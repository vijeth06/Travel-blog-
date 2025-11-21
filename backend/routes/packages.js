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
const { packageProviderAuth, packageOwnerOrAdminAuth } = require('../middleware/packageProviderAuth');

// Public routes
router.get('/', getPackages);
router.get('/search', searchPackages);
router.get('/featured', getFeaturedPackages);
router.get('/:id', getPackageById);

// Protected routes
router.post('/:id/reviews', protect, addPackageReview);

// Package Provider & Admin routes (can create packages)
router.post('/', protect, packageProviderAuth, createPackage);

// Package Owner or Admin routes (can update/delete their own packages)
router.put('/:id', protect, packageOwnerOrAdminAuth, updatePackage);
router.delete('/:id', protect, packageOwnerOrAdminAuth, deletePackage);

module.exports = router;
