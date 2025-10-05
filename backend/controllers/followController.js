const FollowService = require('../services/followService');

class FollowController {
  
  /**
   * @route   POST /api/follow/user
   * @desc    Follow a user
   * @access  Private
   */
  async followUser(req, res) {
    try {
      const { userId } = req.body;
      const followerId = req.user._id || req.user.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await FollowService.followUser(followerId, userId);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${userId}`).emit('follow-updated', {
          followerId,
          followedUserId: userId,
          following: true,
          followerCount: result.data.followerCount,
          type: 'follow'
        });
        
        // Notify the followed user
        io.to(`user-${userId}`).emit('notification', {
          type: 'follow',
          message: 'Someone started following you',
          followerId,
          timestamp: new Date()
        });
      }
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ FOLLOW: Follow user controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to follow user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   POST /api/follow/unfollow
   * @desc    Unfollow a user
   * @access  Private
   */
  async unfollowUser(req, res) {
    try {
      const { userId } = req.body;
      const followerId = req.user._id || req.user.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await FollowService.unfollowUser(followerId, userId);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${userId}`).emit('follow-updated', {
          followerId,
          followedUserId: userId,
          following: false,
          followerCount: result.data.followerCount,
          type: 'unfollow'
        });
      }
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ UNFOLLOW: Unfollow user controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to unfollow user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   POST /api/follow/toggle
   * @desc    Toggle follow status
   * @access  Private
   */
  async toggleFollow(req, res) {
    try {
      const { userId } = req.body;
      const followerId = req.user._id || req.user.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await FollowService.toggleFollow(followerId, userId);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${userId}`).emit('follow-updated', {
          followerId,
          followedUserId: userId,
          following: result.data.following,
          followerCount: result.data.followerCount,
          type: result.data.following ? 'follow' : 'unfollow'
        });
        
        if (result.data.following) {
          // Notify the followed user
          io.to(`user-${userId}`).emit('notification', {
            type: 'follow',
            message: 'Someone started following you',
            followerId,
            timestamp: new Date()
          });
        }
      }
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ TOGGLE: Toggle follow controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle follow status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   GET /api/follow/status/:userId
   * @desc    Get following status between current user and specified user
   * @access  Private
   */
  async getFollowingStatus(req, res) {
    try {
      const { userId } = req.params;
      const followerId = req.user._id || req.user.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await FollowService.getFollowingStatus(followerId, userId);
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ STATUS: Get following status controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get following status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   GET /api/follow/followers/:userId
   * @desc    Get user's followers
   * @access  Public
   */
  async getFollowers(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await FollowService.getFollowers(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: true
      });
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ FOLLOWERS: Get followers controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get followers',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   GET /api/follow/following/:userId
   * @desc    Get users that a user is following
   * @access  Public
   */
  async getFollowing(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await FollowService.getFollowing(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: true
      });
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ FOLLOWING: Get following controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get following',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   GET /api/follow/suggestions
   * @desc    Get follow suggestions for current user
   * @access  Private
   */
  async getFollowSuggestions(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { limit = 10 } = req.query;
      
      const result = await FollowService.getFollowSuggestions(userId, {
        limit: parseInt(limit)
      });
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ SUGGESTIONS: Get follow suggestions controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get follow suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   GET /api/follow/mutual/:userId
   * @desc    Get mutual follows between current user and specified user
   * @access  Private
   */
  async getMutualFollows(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id || req.user.id;
      const { limit = 10 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await FollowService.getMutualFollows(currentUserId, userId, {
        limit: parseInt(limit)
      });
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ MUTUAL: Get mutual follows controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get mutual follows',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   POST /api/follow/bulk
   * @desc    Follow multiple users at once
   * @access  Private
   */
  async bulkFollow(req, res) {
    try {
      const { userIds } = req.body;
      const followerId = req.user._id || req.user.id;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required'
        });
      }
      
      if (userIds.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Cannot follow more than 50 users at once'
        });
      }
      
      const result = await FollowService.bulkFollow(followerId, userIds);
      
      // Emit socket events for successful follows
      const io = req.app.get('io');
      if (io) {
        result.data.results.forEach(({ userId, success, result: followResult }) => {
          if (success) {
            io.to(`user-${userId}`).emit('follow-updated', {
              followerId,
              followedUserId: userId,
              following: true,
              followerCount: followResult.data.followerCount,
              type: 'follow'
            });
            
            io.to(`user-${userId}`).emit('notification', {
              type: 'follow',
              message: 'Someone started following you',
              followerId,
              timestamp: new Date()
            });
          }
        });
      }
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('❌ BULK: Bulk follow controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to bulk follow users',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
  
  /**
   * @route   GET /api/follow/analytics/:userId
   * @desc    Get follow analytics for a user
   * @access  Public
   */
  async getFollowAnalytics(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      // Get basic stats
      const followerCount = await FollowService.getFollowers(userId, { limit: 1 });
      const followingCount = await FollowService.getFollowing(userId, { limit: 1 });
      
      // Calculate follow ratio
      const followers = followerCount.data.pagination.totalFollowers;
      const following = followingCount.data.pagination.totalFollowing;
      const followRatio = following > 0 ? (followers / following).toFixed(2) : followers;
      
      // Get mutual follows if current user is authenticated
      let mutualFollows = null;
      if (req.user) {
        const mutualResult = await FollowService.getMutualFollows(req.user._id || req.user.id, userId);
        mutualFollows = mutualResult.data.totalMutual;
      }
      
      const analytics = {
        userId,
        followers,
        following,
        followRatio: parseFloat(followRatio),
        mutualFollows,
        engagement: {
          isPopular: followers > 100,
          isActive: following > 50,
          isInfluencer: followers > 1000,
          followBackRate: followRatio > 0.8 ? 'high' : followRatio > 0.3 ? 'medium' : 'low'
        }
      };
      
      res.status(200).json({
        success: true,
        data: analytics
      });
      
    } catch (error) {
      console.error('❌ ANALYTICS: Get follow analytics controller error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get follow analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }
}

module.exports = new FollowController();