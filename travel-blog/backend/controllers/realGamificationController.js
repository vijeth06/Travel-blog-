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

  // Create a new challenge
  async createChallenge(req, res) {
    try {
      const challengeData = {
        ...req.body,
        createdBy: req.user.id
      };

      const challenge = await gamificationService.createChallenge(challengeData);

      successResponse(res, challenge, 'Challenge created successfully');
    } catch (error) {
      console.error('Create challenge error:', error);
      errorResponse(res, error.message);
    }
  },

  // Join a challenge
  async joinChallenge(req, res) {
    try {
      const userId = req.user.id;
      const { challengeId } = req.params;

      const result = await gamificationService.joinChallenge(userId, challengeId);

      successResponse(res, result, 'Successfully joined challenge');
    } catch (error) {
      console.error('Join challenge error:', error);
      errorResponse(res, error.message);
    }
  },

  // Update challenge progress
  async updateProgress(req, res) {
    try {
      const userId = req.user.id;
      const { challengeId } = req.params;
      const progressData = req.body;

      const result = await gamificationService.updateChallengeProgress(
        userId, 
        challengeId, 
        progressData
      );

      successResponse(res, result, 'Progress updated successfully');
    } catch (error) {
      console.error('Update progress error:', error);
      errorResponse(res, error.message);
    }
  },

  // Initialize achievements (admin only)
  async initializeAchievements(req, res) {
    try {
      await gamificationService.initializeDefaultAchievements();
      
      successResponse(res, {}, 'Achievements initialized successfully');
    } catch (error) {
      console.error('Initialize achievements error:', error);
      errorResponse(res, error.message);
    }
  }
};

module.exports = gamificationController;