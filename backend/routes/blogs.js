const express = require('express');
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  getTrendingBlogs,
  searchBlogs,
  toggleBlogLike,
  toggleBlogBookmark,
  getBookmarkedBlogs,
  getBlogWithEngagement
} = require('../controllers/blogController');
const { protect: auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { cache } = require('../middleware/cache');
const { createLimiter } = require('../middleware/rateLimiter');

// Special routes (must come before /:id)
router.get('/search', cache('short'), searchBlogs);
router.get('/featured', cache('medium'), getFeaturedBlogs);
router.get('/trending', cache('short'), getTrendingBlogs);
router.get('/bookmarked', auth, getBookmarkedBlogs);

// Engagement routes
router.post('/:id/like', auth, toggleBlogLike);
router.post('/:id/bookmark', auth, toggleBlogBookmark);
router.get('/:id/engagement', auth, getBlogWithEngagement);

// CRUD routes
router.get('/:id', cache('medium'), getBlog);
router.post('/', auth, createLimiter, upload.array('images', 5), createBlog);
router.get('/', cache('short'), getBlogs);
router.put('/:id', auth, upload.array('images', 5), updateBlog);
router.delete('/:id', auth, deleteBlog);

module.exports = router;
