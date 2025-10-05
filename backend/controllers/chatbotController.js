const chatbotService = require('../services/chatbotService');
const { v4: uuidv4 } = require('uuid');

class ChatbotController {
  // Start new chat session
  async startChat(req, res) {
    try {
      const sessionId = uuidv4();
      
      // Send initial greeting
      const response = await chatbotService.processMessage(
        sessionId,
        'hello',
        req.user?.id
      );

      res.json({
        success: true,
        data: {
          sessionId,
          message: response.response,
          suggestions: response.suggestions
        }
      });

    } catch (error) {
      console.error('Start chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start chat session'
      });
    }
  }

  // Send message to chatbot
  async sendMessage(req, res) {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          message: 'Session ID and message are required'
        });
      }

      const response = await chatbotService.processMessage(
        sessionId,
        message,
        req.user?.id
      );

      res.json({
        success: true,
        data: {
          response: response.response,
          intent: response.intent,
          confidence: response.confidence,
          suggestions: response.suggestions
        }
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message'
      });
    }
  }

  // Get conversation history
  async getConversationHistory(req, res) {
    try {
      const { sessionId } = req.params;

      const conversation = await chatbotService.getConversationHistory(sessionId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Check if user has access to this conversation
      if (req.user && conversation.user && conversation.user._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: conversation
      });

    } catch (error) {
      console.error('Get conversation history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation history'
      });
    }
  }

  // Submit feedback for conversation
  async submitFeedback(req, res) {
    try {
      const { sessionId } = req.params;
      const { rating, feedback } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      await chatbotService.submitFeedback(sessionId, rating, feedback);

      res.json({
        success: true,
        message: 'Feedback submitted successfully'
      });

    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback'
      });
    }
  }

  // Get user's chat sessions (for logged-in users)
  async getUserChatSessions(req, res) {
    try {
      const ChatbotConversation = require('../models/ChatbotConversation');
      
      const sessions = await ChatbotConversation.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select('sessionId status createdAt satisfaction context.currentTopic')
        .limit(20);

      res.json({
        success: true,
        data: sessions
      });

    } catch (error) {
      console.error('Get user chat sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat sessions'
      });
    }
  }

  // Get chatbot analytics (admin only)
  async getChatbotAnalytics(req, res) {
    try {
      const ChatbotConversation = require('../models/ChatbotConversation');
      
      // Total conversations
      const totalConversations = await ChatbotConversation.countDocuments();
      
      // Conversations by status
      const statusStats = await ChatbotConversation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Average satisfaction rating
      const satisfactionStats = await ChatbotConversation.aggregate([
        {
          $match: { 'satisfaction.rating': { $exists: true } }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$satisfaction.rating' },
            totalRatings: { $sum: 1 }
          }
        }
      ]);

      // Most common intents
      const intentStats = await ChatbotConversation.aggregate([
        { $unwind: '$messages' },
        {
          $match: {
            'messages.metadata.intent': { $exists: true },
            'messages.role': 'assistant'
          }
        },
        {
          $group: {
            _id: '$messages.metadata.intent',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Conversations over time (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const conversationsOverTime = await ChatbotConversation.aggregate([
        {
          $match: { createdAt: { $gte: thirtyDaysAgo } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      res.json({
        success: true,
        data: {
          totalConversations,
          statusDistribution: statusStats,
          satisfaction: satisfactionStats[0] || { avgRating: 0, totalRatings: 0 },
          topIntents: intentStats,
          conversationsOverTime
        }
      });

    } catch (error) {
      console.error('Get chatbot analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chatbot analytics'
      });
    }
  }

  // Quick responses for common queries
  async getQuickResponses(req, res) {
    try {
      const quickResponses = [
        {
          id: 'popular_destinations',
          text: 'Show me popular destinations',
          category: 'destinations'
        },
        {
          id: 'budget_packages',
          text: 'Find budget-friendly packages',
          category: 'booking'
        },
        {
          id: 'luxury_travel',
          text: 'Luxury travel options',
          category: 'booking'
        },
        {
          id: 'family_friendly',
          text: 'Family-friendly destinations',
          category: 'destinations'
        },
        {
          id: 'adventure_travel',
          text: 'Adventure travel packages',
          category: 'booking'
        },
        {
          id: 'travel_tips',
          text: 'General travel tips',
          category: 'advice'
        },
        {
          id: 'best_time_visit',
          text: 'Best time to visit destinations',
          category: 'advice'
        },
        {
          id: 'packing_tips',
          text: 'Packing advice',
          category: 'advice'
        }
      ];

      res.json({
        success: true,
        data: quickResponses
      });

    } catch (error) {
      console.error('Get quick responses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get quick responses'
      });
    }
  }
}

module.exports = new ChatbotController();