const forumService = require('../services/forumService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const forumController = {
  // Create a new forum topic
  async createTopic(req, res) {
    try {
      const userId = req.user.id;
      const topicData = req.body;

      const topic = await forumService.createTopic(userId, topicData);

      successResponse(res, topic, 'Forum topic created successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Create a new post in a topic
  async createPost(req, res) {
    try {
      const userId = req.user.id;
      const { topicId } = req.params;
      const postData = req.body;

      const post = await forumService.createPost(userId, topicId, postData);

      successResponse(res, post, 'Forum post created successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get forum topics with filters
  async getTopics(req, res) {
    try {
      const filters = req.query;

      const result = await forumService.getTopics(filters);

      successResponse(res, result, 'Forum topics retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get a specific topic and its posts
  async getTopic(req, res) {
    try {
      const { topicId } = req.params;
      const userId = req.user?.id;

      const result = await forumService.getTopic(topicId, userId);

      successResponse(res, result, 'Forum topic retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Like/unlike a post
  async likePost(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;

      const result = await forumService.likePost(userId, postId);

      successResponse(res, result, 'Post like status updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Dislike/undislike a post
  async dislikePost(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;

      const result = await forumService.dislikePost(userId, postId);

      successResponse(res, result, 'Post dislike status updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Mark a post as best answer
  async markBestAnswer(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const { topicId } = req.body;

      const result = await forumService.markBestAnswer(userId, postId, topicId);

      successResponse(res, result, 'Best answer marked successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Subscribe/unsubscribe to a topic
  async subscribeTo(req, res) {
    try {
      const userId = req.user.id;
      const { topicId } = req.params;

      const result = await forumService.subscribeTo(userId, topicId);

      const message = result.subscribed ? 
        'Successfully subscribed to topic' : 
        'Successfully unsubscribed from topic';

      successResponse(res, result, message);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Report a post
  async reportPost(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const { reason } = req.body;

      const result = await forumService.reportPost(userId, postId, reason);

      successResponse(res, result, 'Post reported successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's forum profile
  async getUserProfile(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      const profile = await forumService.getUserForumProfile(userId);

      successResponse(res, profile, 'User forum profile retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get forum categories
  async getCategories(req, res) {
    try {
      const categories = await forumService.getForumCategories();

      successResponse(res, categories, 'Forum categories retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Search forum
  async searchForum(req, res) {
    try {
      const { q: searchQuery } = req.query;
      const filters = req.query;

      if (!searchQuery) {
        return errorResponse(res, 'Search query is required', 400);
      }

      const results = await forumService.searchForum(searchQuery, filters);

      successResponse(res, results, 'Forum search completed successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get top contributors
  async getTopContributors(req, res) {
    try {
      const { limit = 10 } = req.query;

      const contributors = await forumService.getTopContributors(parseInt(limit));

      successResponse(res, contributors, 'Top contributors retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get forum statistics
  async getForumStats(req, res) {
    try {
      const stats = await forumService.getForumStats();

      successResponse(res, stats, 'Forum statistics retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update a topic (author only)
  async updateTopic(req, res) {
    try {
      const userId = req.user.id;
      const { topicId } = req.params;
      const updateData = req.body;

      const result = await forumService.updateTopic(userId, topicId, updateData);

      successResponse(res, result, 'Topic updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update a post (author only)
  async updatePost(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const updateData = req.body;

      const result = await forumService.updatePost(userId, postId, updateData);

      successResponse(res, result, 'Post updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Delete a topic (author or admin only)
  async deleteTopic(req, res) {
    try {
      const userId = req.user.id;
      const { topicId } = req.params;
      const isAdmin = req.user.isAdmin;

      const result = await forumService.deleteTopic(userId, topicId, isAdmin);

      successResponse(res, result, 'Topic deleted successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Delete a post (author or admin only)
  async deletePost(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const isAdmin = req.user.isAdmin;

      const result = await forumService.deletePost(userId, postId, isAdmin);

      successResponse(res, result, 'Post deleted successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Close/open a topic (admin or author only)
  async toggleTopicStatus(req, res) {
    try {
      const userId = req.user.id;
      const { topicId } = req.params;
      const { status } = req.body; // 'open' or 'closed'
      const isAdmin = req.user.isAdmin;

      const result = await forumService.toggleTopicStatus(userId, topicId, status, isAdmin);

      successResponse(res, result, `Topic ${status} successfully`);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Pin/unpin a topic (admin only)
  async toggleTopicPin(req, res) {
    try {
      const { topicId } = req.params;
      const { pinned } = req.body;

      // Check admin access
      if (!req.user.isAdmin) {
        return errorResponse(res, 'Unauthorized access', 403);
      }

      const result = await forumService.toggleTopicPin(topicId, pinned);

      const message = pinned ? 'Topic pinned successfully' : 'Topic unpinned successfully';
      successResponse(res, result, message);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's topics
  async getUserTopics(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      const { page = 1, limit = 20, status } = req.query;

      const result = await forumService.getUserTopics(
        userId, 
        parseInt(page), 
        parseInt(limit), 
        status
      );

      successResponse(res, result, 'User topics retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's posts
  async getUserPosts(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await forumService.getUserPosts(
        userId, 
        parseInt(page), 
        parseInt(limit)
      );

      successResponse(res, result, 'User posts retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get trending topics
  async getTrendingTopics(req, res) {
    try {
      const { timeframe = 'week', limit = 10 } = req.query;

      const topics = await forumService.getTrendingTopics(timeframe, parseInt(limit));

      successResponse(res, topics, 'Trending topics retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get recent activity
  async getRecentActivity(req, res) {
    try {
      const { limit = 20 } = req.query;
      const userId = req.user?.id;

      const activity = await forumService.getRecentActivity(parseInt(limit), userId);

      successResponse(res, activity, 'Recent activity retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Moderate post (admin only)
  async moderatePost(req, res) {
    try {
      const { postId } = req.params;
      const { action, reason } = req.body; // 'approve', 'hide', 'delete'

      // Check admin access
      if (!req.user.isAdmin) {
        return errorResponse(res, 'Unauthorized access', 403);
      }

      const result = await forumService.moderatePost(postId, action, reason, req.user.id);

      successResponse(res, result, `Post ${action} successfully`);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get moderation queue (admin only)
  async getModerationQueue(req, res) {
    try {
      // Check admin access
      if (!req.user.isAdmin) {
        return errorResponse(res, 'Unauthorized access', 403);
      }

      const { page = 1, limit = 20, type = 'all' } = req.query;

      const result = await forumService.getModerationQueue(
        parseInt(page), 
        parseInt(limit), 
        type
      );

      successResponse(res, result, 'Moderation queue retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
};

module.exports = forumController;