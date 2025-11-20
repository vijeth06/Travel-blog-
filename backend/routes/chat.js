const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User search
router.get('/users/search', chatController.searchUsers);

// Conversations
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:recipientId', chatController.getOrCreateConversation);
router.post('/conversations/group', chatController.createGroupConversation);
router.post('/conversations/:conversationId/archive', chatController.archiveConversation);
router.post('/conversations/:conversationId/mute', chatController.toggleMute);

// Messages
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.post('/conversations/:conversationId/read', chatController.markAsRead);
router.delete('/messages/:messageId', chatController.deleteMessage);

// Typing indicator
router.post('/conversations/:conversationId/typing', chatController.setTyping);

module.exports = router;
