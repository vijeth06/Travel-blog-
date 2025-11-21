const express = require('express');
const router = express.Router();
const { contactProvider, getProviderContacts } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// @route   POST /api/contact/provider
// @desc    Contact a package provider
// @access  Private
router.post('/provider', protect, contactProvider);

// @route   GET /api/contact/provider/requests
// @desc    Get provider contact requests
// @access  Private (Provider/Admin)
router.get('/provider/requests', protect, getProviderContacts);

module.exports = router;
