const express = require('express');
const router = express.Router();
const {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  searchPackages,
  addPackageReview,
  getFeaturedPackages
} = require('../controllers/packageController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getPackages);
router.get('/search', searchPackages);
router.get('/featured', getFeaturedPackages);
router.get('/:id', getPackageById);

// Protected routes
router.post('/:id/reviews', protect, addPackageReview);

// Admin routes
router.post('/', protect, admin, createPackage);
router.put('/:id', protect, admin, updatePackage);
router.delete('/:id', protect, admin, deletePackage);

module.exports = router;
