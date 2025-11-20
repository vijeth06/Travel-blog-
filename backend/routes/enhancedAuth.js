const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  verify2FA,
  refreshToken,
  logout,
  logoutAll,
  getActiveSessions,
  revokeSession,
  enable2FA,
  disable2FA,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  googleAuth,
  googleCallback
} = require('../controllers/enhancedAuthController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Registration & Verification
router.post('/register', authLimiter, register);
router.post('/verify-email', authLimiter, verifyEmail);

// Login & Authentication
router.post('/login', authLimiter, login);
router.post('/verify-2fa', authLimiter, verify2FA);
router.post('/refresh-token', refreshToken);

// Logout
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);

// Session Management
router.get('/sessions', protect, getActiveSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);

// Two-Factor Authentication
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/disable', protect, disable2FA);

// Password Management
router.post('/password/reset-request', authLimiter, requestPasswordReset);
router.post('/password/reset', authLimiter, resetPassword);
router.post('/password/change', protect, changePassword);

// Profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;
