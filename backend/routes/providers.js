const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllProviders,
  getPendingProviders,
  verifyProvider,
  rejectProvider,
  getProviderPackages,
  getMyPackages,
  getProviderStats
} = require('../controllers/providerController');

// Provider's own routes (protected, provider only)
router.get('/my-packages', protect, getMyPackages);
router.get('/stats', protect, getProviderStats);

// Admin routes for provider management
router.get('/admin/all', protect, admin, getAllProviders);
router.get('/admin/pending', protect, admin, getPendingProviders);
router.put('/admin/:id/verify', protect, admin, verifyProvider);
router.put('/admin/:id/reject', protect, admin, rejectProvider);
router.get('/admin/:id/packages', protect, admin, getProviderPackages);

module.exports = router;
