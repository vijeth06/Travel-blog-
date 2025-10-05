const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// Create a category
router.post('/', protect, categoryController.createCategory);
// Get all categories
router.get('/', categoryController.getCategories);
// Delete a category
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;
