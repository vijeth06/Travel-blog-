const User = require('../models/User');
const Package = require('../models/Package');

// @desc    Get all package providers
// @route   GET /api/admin/providers
// @access  Private (Admin only)
const getAllProviders = async (req, res) => {
  try {
    const { verified, search } = req.query;
    const query = { role: 'package_provider' };

    if (verified !== undefined) {
      query['providerInfo.verified'] = verified === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'providerInfo.companyName': { $regex: search, $options: 'i' } }
      ];
    }

    const providers = await User.find(query)
      .select('name email providerInfo createdAt')
      .sort('-createdAt');

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending provider verifications
// @route   GET /api/admin/providers/pending
// @access  Private (Admin only)
const getPendingProviders = async (req, res) => {
  try {
    const pendingProviders = await User.find({
      role: 'package_provider',
      'providerInfo.verified': false
    })
      .select('name email providerInfo createdAt')
      .sort('-createdAt');

    res.json(pendingProviders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify a package provider
// @route   PUT /api/admin/providers/:id/verify
// @access  Private (Admin only)
const verifyProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (provider.role !== 'package_provider') {
      return res.status(400).json({ message: 'User is not a package provider' });
    }

    provider.providerInfo.verified = true;
    await provider.save();

    res.json({ 
      message: 'Provider verified successfully', 
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        providerInfo: provider.providerInfo
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject/Unverify a package provider
// @route   PUT /api/admin/providers/:id/reject
// @access  Private (Admin only)
const rejectProvider = async (req, res) => {
  try {
    const { reason } = req.body;
    const provider = await User.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (provider.role !== 'package_provider') {
      return res.status(400).json({ message: 'User is not a package provider' });
    }

    provider.providerInfo.verified = false;
    await provider.save();

    res.json({ 
      message: 'Provider verification revoked', 
      reason,
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        providerInfo: provider.providerInfo
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific provider's packages
// @route   GET /api/admin/providers/:id/packages
// @access  Private (Admin only)
const getProviderPackages = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    if (provider.role !== 'package_provider') {
      return res.status(400).json({ message: 'User is not a package provider' });
    }

    const packages = await Package.find({ createdBy: req.params.id })
      .populate('category', 'name description')
      .populate('createdBy', 'name email providerInfo')
      .sort('-createdAt');

    res.json({
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        providerInfo: provider.providerInfo
      },
      packages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider's own packages
// @route   GET /api/providers/my-packages
// @access  Private (Package Provider only)
const getMyPackages = async (req, res) => {
  try {
    if (req.user.role !== 'package_provider' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Package providers only.' });
    }

    const packages = await Package.find({ createdBy: req.user.id })
      .populate('category', 'name description')
      .populate('createdBy', 'name email providerInfo')
      .sort('-createdAt');

    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider statistics
// @route   GET /api/providers/stats
// @access  Private (Package Provider only)
const getProviderStats = async (req, res) => {
  try {
    if (req.user.role !== 'package_provider' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Package providers only.' });
    }

    const Booking = require('../models/Booking');
    const Review = require('../models/Review');

    const packages = await Package.find({ createdBy: req.user.id });
    const packageIds = packages.map(p => p._id);

    const totalBookings = await Booking.countDocuments({ 
      package: { $in: packageIds },
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    const reviews = await Review.find({ 
      package: { $in: packageIds } 
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const totalRevenue = await Booking.aggregate([
      { 
        $match: { 
          package: { $in: packageIds },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$totalPrice' } 
        }
      }
    ]);

    res.json({
      totalPackages: packages.length,
      totalBookings,
      averageRating: averageRating.toFixed(1),
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      verified: req.user.providerInfo?.verified || false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProviders,
  getPendingProviders,
  verifyProvider,
  rejectProvider,
  getProviderPackages,
  getMyPackages,
  getProviderStats
};
