const gamificationService = require('../services/realGamificationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Real Gamification Controller with working database operations
 */
const gamificationController = {
  // Get user's gamification progress
  async getUserProgress(req, res) {
    try {
      const userId = req.user.id;
      const progress = await gamificationService.getUserProgress(userId);
      
      successResponse(res, progress, 'User progress retrieved successfully');
    } catch (error) {
      console.error('Get user progress error:', error);
      errorResponse(res, error.message);
    }
  },

  // Award points for user activity
  async awardPoints(req, res) {
    try {
      const userId = req.user.id;
      const { activity, points, metadata } = req.body;

      const result = await gamificationService.awardPoints(userId, activity, points, metadata);

      successResponse(res, result, 'Points awarded successfully');
    } catch (error) {
      console.error('Award points error:', error);
      errorResponse(res, error.message);
    }
  },

  // Get leaderboard
  async getLeaderboard(req, res) {
    try {
      const { period = 'all', limit = 10 } = req.query;
      const leaderboard = await gamificationService.getLeaderboard(period, parseInt(limit));

      successResponse(res, leaderboard, 'Leaderboard retrieved successfully');
    } catch (error) {
      console.error('Get leaderboard error:', error);
      errorResponse(res, error.message);
    }
  },

  // Get available achievements
  async getAchievements(req, res) {
    try {
      const userId = req.user.id;
      const achievements = await gamificationService.getAvailableAchievements(userId);

      successResponse(res, achievements, 'Achievements retrieved successfully');
    } catch (error) {
      console.error('Get achievements error:', error);
      errorResponse(res, error.message);
    }
  },

  // Track activity
  async trackActivity(req, res) {
    try {
      const userId = req.user.id;
      const { activityType, metadata } = req.body;

      const result = await gamificationService.trackActivity(userId, activityType, metadata);

      successResponse(res, result, 'Activity tracked successfully');
    } catch (error) {
      console.error('Track activity error:', error);
      errorResponse(res, error.message);
    }
  },

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await gamificationService.getUserStats(userId);

      successResponse(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      console.error('Get user stats error:', error);
      errorResponse(res, error.message);
    }
  },
    }
  },

  // Award points to user
  async awardPoints(req, res) {
    try {
      const userId = req.user.id;
      const { actionType, amount } = req.body;

      const result = await gamificationService.awardPoints(userId, actionType, amount);

      successResponse(res, result, 'Points awarded successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's gamification stats
  async getUserStats(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      const stats = await gamificationService.getUserStats(userId);

      successResponse(res, stats, 'User stats retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get leaderboard
  async getLeaderboard(req, res) {
    try {
      const { timeframe = 'all', limit = 100 } = req.query;

      const leaderboard = await gamificationService.getLeaderboard(timeframe, parseInt(limit));

      successResponse(res, leaderboard, 'Leaderboard retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get active challenges
  async getActiveChallenges(req, res) {
    try {
      const userId = req.user?.id;

      const challenges = await gamificationService.getActiveChallenges(userId);

      successResponse(res, challenges, 'Active challenges retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's challenges
  async getUserChallenges(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      const { status } = req.query; // 'active', 'completed', 'all'

      const challenges = await gamificationService.getUserChallenges(userId, status);

      successResponse(res, challenges, 'User challenges retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get available badges
  async getBadges(req, res) {
    try {
      const badges = await gamificationService.getAvailableBadges();

      successResponse(res, badges, 'Badges retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's badges
  async getUserBadges(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      const badges = await gamificationService.getUserBadges(userId);

      successResponse(res, badges, 'User badges retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Check and award badges
  async checkBadges(req, res) {
    try {
      const userId = req.user.id;

      const newBadges = await gamificationService.checkAndAwardBadges(userId);

      successResponse(res, newBadges, 'Badge check completed');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get challenge details
  async getChallengeDetails(req, res) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.id;

      const challenge = await gamificationService.getChallengeDetails(challengeId, userId);

      if (!challenge) {
        return errorResponse(res, 'Challenge not found', 404);
      }

      successResponse(res, challenge, 'Challenge details retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Leave a challenge
  async leaveChallenge(req, res) {
    try {
      const userId = req.user.id;
      const { challengeId } = req.params;

      const result = await gamificationService.leaveChallenge(userId, challengeId);

      successResponse(res, result, 'Successfully left challenge');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get achievement progress
  async getAchievementProgress(req, res) {
    try {
      const userId = req.user.id;

      const progress = await gamificationService.getAchievementProgress(userId);

      successResponse(res, progress, 'Achievement progress retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get points history
  async getPointsHistory(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      const { limit = 50, page = 1 } = req.query;

      const history = await gamificationService.getPointsHistory(
        userId, 
        parseInt(limit), 
        parseInt(page)
      );

      successResponse(res, history, 'Points history retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get gamification dashboard data
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;

      const dashboard = await gamificationService.getDashboardData(userId);

      successResponse(res, dashboard, 'Dashboard data retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update challenge (admin only)
  async updateChallenge(req, res) {
    try {
      const { challengeId } = req.params;
      const updateData = req.body;

      // Check if user can update challenge (admin or creator)
      const challenge = await gamificationService.getChallengeDetails(challengeId);
      
      if (!challenge) {
        return errorResponse(res, 'Challenge not found', 404);
      }

      if (challenge.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
        return errorResponse(res, 'Unauthorized to update this challenge', 403);
      }

      const updatedChallenge = await gamificationService.updateChallenge(challengeId, updateData);

      successResponse(res, updatedChallenge, 'Challenge updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Delete challenge (admin only)
  async deleteChallenge(req, res) {
    try {
      const { challengeId } = req.params;

      // Check if user can delete challenge (admin or creator)
      const challenge = await gamificationService.getChallengeDetails(challengeId);
      
      if (!challenge) {
        return errorResponse(res, 'Challenge not found', 404);
      }

      if (challenge.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
        return errorResponse(res, 'Unauthorized to delete this challenge', 403);
      }

      await gamificationService.deleteChallenge(challengeId);

      successResponse(res, null, 'Challenge deleted successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get challenge leaderboard
  async getChallengeLeaderboard(req, res) {
    try {
      const { challengeId } = req.params;
      const { limit = 100 } = req.query;

      const leaderboard = await gamificationService.getChallengeLeaderboard(
        challengeId, 
        parseInt(limit)
      );

      successResponse(res, leaderboard, 'Challenge leaderboard retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Submit challenge proof/evidence
  async submitProof(req, res) {
    try {
      const userId = req.user.id;
      const { challengeId } = req.params;
      const proofData = req.body;

      const result = await gamificationService.submitChallengeProof(
        userId, 
        challengeId, 
        proofData
      );

      successResponse(res, result, 'Proof submitted successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get weekly/monthly challenges
  async getFeaturedChallenges(req, res) {
    try {
      const { type = 'weekly' } = req.query; // 'weekly' or 'monthly'

      const challenges = await gamificationService.getFeaturedChallenges(type);

      successResponse(res, challenges, 'Featured challenges retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get gamification statistics (admin)
  async getGamificationStats(req, res) {
    try {
      // Check admin access
      if (!req.user.isAdmin) {
        return errorResponse(res, 'Unauthorized access', 403);
      }

      const stats = await gamificationService.getGamificationStatistics();

      successResponse(res, stats, 'Gamification statistics retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
};

module.exports = gamificationController;