const express = require('express');
const router = express.Router();
const {
  toggleLike,
  getLikeStatus,
  getUserLikes,
  getTrendingContent
} = require('../controllers/likeController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/status/:targetType/:targetId', getLikeStatus);
router.get('/trending', getTrendingContent);

// Protected routes
router.post('/', protect, toggleLike);
router.post('/toggle', protect, toggleLike);
router.get('/my-likes', protect, getUserLikes);

module.exports = router;
