const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllBlogs,
  deleteBlogAdmin,
  updateBlogAdmin,
  toggleBlogFeatured,
  getAllComments,
  bulkModerateComments,
  getSystemHealth,
  getUserActivity
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(adminAuth);

// Analytics routes
router.get('/analytics', getAnalytics);
router.get('/system-health', getSystemHealth);
router.get('/user-activity', getUserActivity);

// Blog management routes
router.get('/blogs', getAllBlogs);
router.put('/blogs/:id', updateBlogAdmin);
router.delete('/blogs/:id', deleteBlogAdmin);
router.patch('/blogs/:id/featured', toggleBlogFeatured);

// Comment moderation routes
router.get('/comments', getAllComments);
router.post('/comments/bulk-moderate', bulkModerateComments);

module.exports = router;
