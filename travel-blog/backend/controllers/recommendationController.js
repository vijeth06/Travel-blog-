const recommendationService = require('../services/recommendationService');
const Recommendation = require('../models/Recommendation');

class RecommendationController {
  // Generate recommendations for user
  async generateRecommendations(req, res) {
    try {
      const recommendations = await recommendationService.generateRecommendations(req.user.id);

      res.json({
        success: true,
        message: 'Recommendations generated successfully',
        data: recommendations
      });

    } catch (error) {
      console.error('Generate recommendations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate recommendations'
      });
    }
  }

  // Get user recommendations
  async getUserRecommendations(req, res) {
    try {
      const { type, limit = 20, page = 1 } = req.query;
      const skip = (page - 1) * limit;

      const query = { user: req.user.id };
      if (type) {
        query.type = type;
      }

      const recommendations = await Recommendation.find(query)
        .populate({
          path: 'targetId',
          populate: {
            path: 'author',
            select: 'name avatar'
          }
        })
        .sort({ score: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Recommendation.countDocuments(query);

      res.json({
        success: true,
        data: {
          recommendations,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / limit),
            count: recommendations.length,
            totalItems: total
          }
        }
      });

    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  }

  // Mark recommendation interaction
  async markInteraction(req, res) {
    try {
      const { id } = req.params;
      const { interactionType } = req.body; // 'viewed', 'clicked', 'liked', 'dismissed'

      if (!['viewed', 'clicked', 'liked', 'dismissed'].includes(interactionType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid interaction type'
        });
      }

      const recommendation = await Recommendation.findById(id);

      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: 'Recommendation not found'
        });
      }

      // Check if recommendation belongs to user
      if (recommendation.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await recommendationService.markRecommendationInteraction(id, interactionType);

      res.json({
        success: true,
        message: 'Interaction recorded successfully'
      });

    } catch (error) {
      console.error('Mark interaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record interaction'
      });
    }
  }

  // Get recommendation statistics
  async getRecommendationStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await Recommendation.aggregate([
        { $match: { user: new require('mongoose').Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            viewed: { $sum: { $cond: ['$userInteraction.viewed', 1, 0] } },
            clicked: { $sum: { $cond: ['$userInteraction.clicked', 1, 0] } },
            liked: { $sum: { $cond: ['$userInteraction.liked', 1, 0] } },
            dismissed: { $sum: { $cond: ['$userInteraction.dismissed', 1, 0] } },
            avgScore: { $avg: '$score' }
          }
        }
      ]);

      const typeStats = await Recommendation.aggregate([
        { $match: { user: new require('mongoose').Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgScore: { $avg: '$score' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overall: stats[0] || {
            total: 0, viewed: 0, clicked: 0, liked: 0, dismissed: 0, avgScore: 0
          },
          byType: typeStats
        }
      });

    } catch (error) {
      console.error('Get recommendation stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendation statistics'
      });
    }
  }

  // Refresh recommendations (trigger new generation)
  async refreshRecommendations(req, res) {
    try {
      // Clear old recommendations
      await Recommendation.deleteMany({ 
        user: req.user.id,
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
      });

      // Generate new recommendations
      const recommendations = await recommendationService.generateRecommendations(req.user.id);

      res.json({
        success: true,
        message: 'Recommendations refreshed successfully',
        data: {
          count: recommendations.length,
          recommendations: recommendations.slice(0, 10) // Return first 10
        }
      });

    } catch (error) {
      console.error('Refresh recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh recommendations'
      });
    }
  }

  // Get trending content
  async getTrendingContent(req, res) {
    try {
      const { type = 'all', limit = 10 } = req.query;

      const query = { reason: 'trending' };
      if (type !== 'all') {
        query.type = type;
      }

      const trending = await Recommendation.find(query)
        .populate('targetId')
        .sort({ score: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .distinct('targetId');

      res.json({
        success: true,
        data: trending
      });

    } catch (error) {
      console.error('Get trending content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending content'
      });
    }
  }

  // Get similar users
  async getSimilarUsers(req, res) {
    try {
      const { limit = 10 } = req.query;

      const similarUserRecommendations = await Recommendation.find({
        user: req.user.id,
        type: 'user',
        reason: 'similar_interests'
      })
      .populate('targetId', 'name avatar bio travelPreferences')
      .sort({ score: -1 })
      .limit(parseInt(limit));

      const users = similarUserRecommendations.map(rec => ({
        ...rec.targetId.toObject(),
        similarityScore: rec.score,
        reason: rec.contextualInfo?.personalizedReason
      }));

      res.json({
        success: true,
        data: users
      });

    } catch (error) {
      console.error('Get similar users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get similar users'
      });
    }
  }

  // Feedback on recommendation quality
  async submitRecommendationFeedback(req, res) {
    try {
      const { id } = req.params;
      const { helpful, feedback } = req.body;

      const recommendation = await Recommendation.findById(id);

      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: 'Recommendation not found'
        });
      }

      // Check if recommendation belongs to user
      if (recommendation.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Update recommendation with feedback
      recommendation.userInteraction.helpful = helpful;
      recommendation.userInteraction.feedback = feedback;
      recommendation.userInteraction.feedbackAt = new Date();

      await recommendation.save();

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
}

module.exports = new RecommendationController();