const Package = require('../models/Package');
const Category = require('../models/Category');
const User = require('../models/User');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice);
    }
    if (req.query.featured) filter.featured = req.query.featured === 'true';
    if (req.query.status) filter.status = req.query.status;
    else filter.status = 'active'; // Default to active packages

    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    const packages = await Package.find(filter)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Package.countDocuments(filter);

    res.json({
      packages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPackages: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
const getPackageById = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .populate('reviews.user', 'name avatar');

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(package);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new package
// @route   POST /api/packages
// @access  Private (Admin or Package Provider)
const createPackage = async (req, res) => {
  try {
    const packageData = {
      ...req.body,
      createdBy: req.user.id
    };

    const package = new Package(packageData);
    const savedPackage = await package.save();

    // Update provider's package count
    if (req.user.role === 'package_provider') {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'providerInfo.totalPackages': 1 }
      });
    }

    const populatedPackage = await Package.findById(savedPackage._id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email providerInfo');

    res.status(201).json(populatedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private (Admin or Package Owner)
const updatePackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('category', 'name description')
      .populate('createdBy', 'name email');

    res.json(updatedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private (Admin or Package Owner)
const deletePackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Decrement provider's package count if they created it
    if (package.createdBy && package.createdBy.toString() !== req.user.id && req.user.role === 'package_provider') {
      await User.findByIdAndUpdate(package.createdBy, {
        $inc: { 'providerInfo.totalPackages': -1 }
      });
    } else if (package.createdBy && package.createdBy.toString() === req.user.id && req.user.role === 'package_provider') {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'providerInfo.totalPackages': -1 }
      });
    }

    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search packages
// @route   GET /api/packages/search
// @access  Public
const searchPackages = async (req, res) => {
  try {
    const { q, category, type, minPrice, maxPrice, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let searchQuery = {};

    if (q) {
      searchQuery.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { keywords: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (category) searchQuery.category = category;
    if (type) searchQuery.type = type;
    if (location) searchQuery.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseInt(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseInt(maxPrice);
    }

    searchQuery.status = 'active';

    const packages = await Package.find(searchQuery)
      .populate('category', 'name description')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Package.countDocuments(searchQuery);

    res.json({
      packages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPackages: total,
      searchQuery: q
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review to package
// @route   POST /api/packages/:id/reviews
// @access  Private
const addPackageReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Check if user already reviewed this package
    const existingReview = package.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this package' });
    }

    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment
    };

    package.reviews.push(review);
    package.calculateAverageRating();
    await package.save();

    const updatedPackage = await Package.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    res.status(201).json(updatedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get featured packages
// @route   GET /api/packages/featured
// @access  Public
const getFeaturedPackages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const packages = await Package.find({ featured: true, status: 'active' })
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  searchPackages,
  addPackageReview,
  getFeaturedPackages
};
