const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Search users for starting conversations
exports.searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.json({ users: [], total: 0, currentPage: 1, totalPages: 0 });
    }

    const searchRegex = new RegExp(query, 'i');
    
    const users = await User.find({
      _id: { $ne: currentUserId }, // Exclude current user
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    })
      .select('name email avatar bio')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      _id: { $ne: currentUserId },
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    });

    res.json({
      users,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const conversations = await Conversation.find({
      participants: userId,
      archived: { $ne: userId }
    })
      .populate('participants', 'name avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId }
        });

        return {
          ...conv.toObject(),
          unreadCount,
          isMuted: conv.muted.includes(userId)
        };
      })
    );

    const total = await Conversation.countDocuments({
      participants: userId,
      archived: { $ne: userId }
    });

    res.json({
      conversations: conversationsWithUnread,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalConversations: total
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get or create conversation with a user
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipientId } = req.params;

    if (userId.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [userId, recipientId], $size: 2 }
    })
      .populate('participants', 'name avatar')
      .populate('lastMessage');

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId],
        isGroup: false
      });
      await conversation.save();
      await conversation.populate('participants', 'name avatar');
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get/create conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create group conversation
exports.createGroupConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { participantIds, groupName } = req.body;

    if (!participantIds || participantIds.length < 2) {
      return res.status(400).json({ message: 'At least 2 participants required for group' });
    }

    if (!groupName || groupName.trim().length === 0) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const allParticipants = [userId, ...participantIds.filter(id => id !== userId.toString())];

    const conversation = new Conversation({
      participants: allParticipants,
      isGroup: true,
      groupName: groupName.trim(),
      admins: [userId]
    });

    await conversation.save();
    await conversation.populate('participants', 'name avatar');

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({
      conversation: conversationId,
      deleted: false
    })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      conversation: conversationId,
      deleted: false
    });

    res.json({
      messages: messages.reverse(),
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalMessages: total
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { content, attachments } = req.body;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message content or attachments required' });
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content,
      attachments,
      readBy: [{ user: userId, readAt: new Date() }]
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Emit real-time event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to all participants except sender
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== userId.toString()) {
          io.to(`user_${participantId}`).emit('new-message', {
            conversationId,
            message
          });
        }
      });
    }

    // Create notification for recipients
    const Notification = require('../models/Notification');
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== userId.toString()) {
        try {
          await Notification.create({
            recipient: participantId,
            sender: userId,
            type: 'message',
            title: 'New Message',
            message: `${req.user.name} sent you a message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            link: `/chat`,
            data: {
              conversationId,
              messageId: message._id
            }
          });
          
          // Emit notification via Socket.IO
          if (io) {
            io.to(`user_${participantId}`).emit('notification', {
              type: 'message',
              message: `New message from ${req.user.name}`
            });
          }
        } catch (error) {
          console.error('Error creating message notification:', error);
        }
      }
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== userId.toString()) {
          io.to(`user_${participantId}`).emit('messages-read', {
            conversationId,
            readBy: userId
          });
        }
      });
    }

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    message.deleted = true;
    await message.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      const conversation = await Conversation.findById(message.conversation);
      conversation.participants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('message-deleted', {
          conversationId: message.conversation,
          messageId
        });
      });
    }

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get typing status (handled via Socket.IO events)
exports.setTyping = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { isTyping } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Emit typing event
    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== userId.toString()) {
          io.to(`user_${participantId}`).emit('user-typing', {
            conversationId,
            userId,
            isTyping
          });
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Set typing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Archive conversation
exports.archiveConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.archived.includes(userId)) {
      conversation.archived.push(userId);
      await conversation.save();
    }

    res.json({ message: 'Conversation archived' });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mute/unmute conversation
exports.toggleMute = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isMuted = conversation.muted.includes(userId);

    if (isMuted) {
      conversation.muted = conversation.muted.filter(id => id.toString() !== userId.toString());
    } else {
      conversation.muted.push(userId);
    }

    await conversation.save();

    res.json({ 
      message: isMuted ? 'Conversation unmuted' : 'Conversation muted',
      isMuted: !isMuted
    });
  } catch (error) {
    console.error('Toggle mute error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
