const User = require('../models/User');
const Package = require('../models/Package');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Contact package provider
// @route   POST /api/contact/provider
// @access  Private
const contactProvider = async (req, res) => {
  try {
    const { providerId, packageId, name, email, phone, subject, message } = req.body;

    // Verify provider exists
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'package_provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Create or find conversation between user and provider
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, providerId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, providerId],
        lastMessage: null,
        lastMessageAt: new Date()
      });
    }

    // Create message
    const contactMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      content: `
**Contact Request**

From: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

${packageId ? `Regarding Package: ${(await Package.findById(packageId))?.name || 'N/A'}` : ''}

Message:
${message}
      `.trim(),
      metadata: {
        type: 'provider_contact',
        packageId,
        contactInfo: { name, email, phone }
      }
    });

    // Update conversation
    conversation.lastMessage = contactMessage._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // TODO: Send email notification to provider
    // You can implement email notification here

    res.status(201).json({
      message: 'Contact request sent successfully',
      conversation: conversation._id
    });
  } catch (error) {
    console.error('Contact provider error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get provider contact requests
// @route   GET /api/contact/provider/requests
// @access  Private (Package Provider only)
const getProviderContacts = async (req, res) => {
  try {
    if (req.user.role !== 'package_provider' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name email avatar')
      .populate({
        path: 'lastMessage',
        select: 'content createdAt sender metadata'
      })
      .sort('-lastMessageAt')
      .limit(50);

    // Filter to only contact requests
    const contactRequests = conversations.filter(conv => 
      conv.lastMessage?.metadata?.type === 'provider_contact'
    );

    res.json(contactRequests);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  contactProvider,
  getProviderContacts
};
