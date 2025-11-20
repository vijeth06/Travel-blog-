const express = require('express');
const router = express.Router();
const realCertificationController = require('../controllers/realCertificationController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get certificates for current user
router.get('/', realCertificationController.getUserCertificates);

// NOTE: Additional certificate routes (by id, issue, verify, etc.)
// can be added later when corresponding controller methods exist.

module.exports = router;
