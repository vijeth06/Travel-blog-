const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { createLimiter } = require('../middleware/rateLimiter');

// Public routes (no protect required)
router.get('/categories', 
  createLimiter,
  forumController.getCategories
);

router.get('/stats', 
  createLimiter,
  forumController.getForumStats
);

router.get('/topics', 
  createLimiter,
  forumController.getTopics
);

router.get('/topics/trending', 
  createLimiter,
  forumController.getTrendingTopics
);

router.get('/topics/:topicId', 
  createLimiter,
  forumController.getTopic
);

router.get('/search', 
  createLimiter,
  forumController.searchForum
);

router.get('/contributors/top', 
  createLimiter,
  forumController.getTopContributors
);

router.get('/activity/recent', 
  createLimiter,
  forumController.getRecentActivity
);

// Apply authentication middleware to protected routes
router.use(protect);

// Topic management routes
router.post('/topics', 
  createLimiter,
  forumController.createTopic
);

router.put('/topics/:topicId', 
  createLimiter,
  forumController.updateTopic
);

router.delete('/topics/:topicId', 
  createLimiter,
  forumController.deleteTopic
);

router.put('/topics/:topicId/status', 
  createLimiter,
  forumController.toggleTopicStatus
);

router.put('/topics/:topicId/subscribe', 
  createLimiter,
  forumController.subscribeTo
);

// Post management routes
router.post('/topics/:topicId/posts', 
  createLimiter,
  forumController.createPost
);

router.put('/posts/:postId', 
  createLimiter,
  forumController.updatePost
);

router.delete('/posts/:postId', 
  createLimiter,
  forumController.deletePost
);

router.put('/posts/:postId/like', 
  createLimiter,
  forumController.likePost
);

router.put('/posts/:postId/dislike', 
  createLimiter,
  forumController.dislikePost
);

router.put('/posts/:postId/best-answer', 
  createLimiter,
  forumController.markBestAnswer
);

router.post('/posts/:postId/report', 
  createLimiter,
  forumController.reportPost
);

// User profile and activity routes
router.get('/users/:userId/profile', 
  forumController.getUserProfile
);

router.get('/users/:userId/topics', 
  forumController.getUserTopics
);

router.get('/users/:userId/posts', 
  forumController.getUserPosts
);

// Admin routes
router.use('/admin', adminAuth);

router.put('/admin/topics/:topicId/pin', 
  createLimiter,
  forumController.toggleTopicPin
);

router.put('/admin/posts/:postId/moderate', 
  createLimiter,
  forumController.moderatePost
);

router.get('/admin/moderation/queue', 
  createLimiter,
  forumController.getModerationQueue
);

module.exports = router;