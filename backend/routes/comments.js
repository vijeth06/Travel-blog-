const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createComment,
  getCommentsByBlog,
  deleteComment,
  flagComment,
  getPendingComments,
  moderateComment
} = require('../controllers/commentController');
const { cache } = require('../middleware/cache');
const { commentLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/blog/:blogId', getCommentsByBlog);

// Protected routes
router.post('/', protect, commentLimiter, createComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/flag', protect, flagComment);

// Admin routes
router.get('/pending', protect, admin, getPendingComments);
router.put('/:id/moderate', protect, admin, moderateComment);

module.exports = router;
