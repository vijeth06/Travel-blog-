const express = require('express');
const router = express.Router();
const {
  recordShare,
  getShareStats,
  getTrendingShares,
  generateShareUrls,
  emailShare
} = require('../controllers/socialController');
const {
  getSocialFeed,
  getRecommendedUsers,
  getTrendingBlogs,
  getUserActivityFeed
} = require('../controllers/socialFeedController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/stats/:targetType/:targetId', getShareStats);
router.get('/trending-shares', getTrendingShares);
router.get('/share-urls/:targetType/:targetId', generateShareUrls);
router.get('/recommendations', protect, getRecommendedUsers);
router.get('/activity/:userId', getUserActivityFeed);
router.get('/trending-blogs', getTrendingBlogs);

// Semi-protected routes (can work without auth but better with it)
router.post('/share', recordShare);
router.post('/email-share', emailShare);

// Protected routes - Real-time Instagram-like feed
router.get('/feed', protect, getSocialFeed);

module.exports = router;
