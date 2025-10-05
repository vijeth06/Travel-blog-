const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - authenticate user
const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    if (!req.user.isActive) {
      return res.status(401).json({ msg: 'Account is deactivated' });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Optional auth - authenticate user if token is provided, but don't require it
const optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // No token provided, continue without authentication
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.isActive) {
      // Invalid user, continue without authentication
      req.user = null;
    }
  } catch (err) {
    // Invalid token, continue without authentication
    req.user = null;
  }

  next();
};

// Admin middleware - check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
};

// Export all middleware functions
module.exports = { protect, optionalAuth, admin };

// For backward compatibility, also export protect as default
module.exports.default = protect;
