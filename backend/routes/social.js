const express = require('express');
const router = express.Router();
const {
  recordShare,
  getShareStats,
  getTrendingShares,
  generateShareUrls,
  getSocialFeed,
  getRecommendedUsers,
  getUserActivity,
  emailShare
} = require('../controllers/socialController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/stats/:targetType/:targetId', getShareStats);
router.get('/trending', getTrendingShares);
router.get('/share-urls/:targetType/:targetId', generateShareUrls);
router.get('/recommendations', getRecommendedUsers);
router.get('/activity/:userId', getUserActivity);

// Semi-protected routes (can work without auth but better with it)
router.post('/share', recordShare);
router.post('/email-share', emailShare);

// Protected routes
router.get('/feed', protect, getSocialFeed);

module.exports = router;
