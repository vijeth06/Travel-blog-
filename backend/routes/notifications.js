const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');

// Get user notifications
router.get('/', auth, getNotifications);

// Get unread count
router.get('/unread-count', auth, getUnreadCount);

// Mark notification as read
router.patch('/:id/read', auth, markAsRead);

// Mark all notifications as read
router.patch('/read-all', auth, markAllAsRead);

// Delete notification
router.delete('/:id', auth, deleteNotification);

module.exports = router;