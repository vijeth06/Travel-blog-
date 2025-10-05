const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const chatbotController = require('../controllers/chatbotController');

// @route   POST /api/chatbot/start
// @desc    Start new chat session
// @access  Public
router.post('/start', chatbotController.startChat);

// @route   POST /api/chatbot/message
// @desc    Send message to chatbot
// @access  Public
router.post('/message', chatbotController.sendMessage);

// @route   GET /api/chatbot/conversation/:sessionId
// @desc    Get conversation history
// @access  Public
router.get('/conversation/:sessionId', chatbotController.getConversationHistory);

// @route   POST /api/chatbot/feedback/:sessionId
// @desc    Submit feedback for conversation
// @access  Public
router.post('/feedback/:sessionId', chatbotController.submitFeedback);

// @route   GET /api/chatbot/my-sessions
// @desc    Get user's chat sessions
// @access  Private
router.get('/my-sessions', protect, chatbotController.getUserChatSessions);

// @route   GET /api/chatbot/quick-responses
// @desc    Get quick response options
// @access  Public
router.get('/quick-responses', chatbotController.getQuickResponses);

// @route   GET /api/chatbot/analytics
// @desc    Get chatbot analytics (admin only)
// @access  Private (Admin)
router.get('/analytics', protect, adminAuth, chatbotController.getChatbotAnalytics);

module.exports = router;