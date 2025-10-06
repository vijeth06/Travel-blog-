const express = require('express');
const router = express.Router();
const { protect, admin, optionalAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Get all users (Admin only)
router.get('/', protect, admin, userController.getAllUsers);

// Get user by ID
router.get('/:id', optionalAuth, userController.getUserById);

// Update user (Admin only)
router.put('/:id', protect, admin, userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;