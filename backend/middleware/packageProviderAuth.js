const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is admin or package provider
const packageProviderAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin or package_provider
    if (req.user.role !== 'admin' && req.user.role !== 'package_provider') {
      return res.status(403).json({ 
        message: 'Access denied. Only admins and package providers can perform this action.' 
      });
    }

    // For package providers, check if they're verified
    if (req.user.role === 'package_provider' && !req.user.providerInfo?.verified) {
      return res.status(403).json({ 
        message: 'Your package provider account is not verified yet. Please contact admin.' 
      });
    }

    next();
  } catch (error) {
    console.error('Package provider auth error:', error);
    res.status(500).json({ message: 'Server error during authorization' });
  }
};

// Middleware to check if user owns the package or is admin
const packageOwnerOrAdminAuth = async (req, res, next) => {
  try {
    const Package = require('../models/Package');
    const packageId = req.params.id;

    const package = await Package.findById(packageId);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Admin can access any package
    if (req.user.role === 'admin') {
      return next();
    }

    // Package provider can only access their own packages
    if (req.user.role === 'package_provider') {
      if (package.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ 
          message: 'Access denied. You can only manage your own packages.' 
        });
      }
      return next();
    }

    // Other roles not allowed
    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Package owner auth error:', error);
    res.status(500).json({ message: 'Server error during authorization' });
  }
};

module.exports = { packageProviderAuth, packageOwnerOrAdminAuth };
