const User = require('../models/User');
const Follow = require('../models/Follow');
const OnboardingService = require('../services/onboardingService');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get follower and following counts
    const followerCount = await Follow.getFollowerCount(req.params.id);
    const followingCount = await Follow.getFollowingCount(req.params.id);
    
    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = await Follow.isFollowing(req.user.id, req.params.id);
    }

    res.json({
      ...user.toObject(),
      followerCount,
      followingCount,
      isFollowing
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    // Mark onboarding step when profile fields are updated
    try {
      if (req.user && req.user.id) {
        await OnboardingService.markStepCompleted(req.user.id, 'complete_profile');
      }
    } catch (err) {
      console.error('Onboarding complete_profile hook error:', err.message);
    }

    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user.id,
      following: req.params.id
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    await Follow.create({
      follower: req.user.id,
      following: req.params.id
    });

    const followerCount = await Follow.getFollowerCount(req.params.id);

    res.json({ 
      message: 'User followed successfully',
      following: true,
      followerCount
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove follow relationship
    const result = await Follow.findOneAndDelete({
      follower: req.user.id,
      following: req.params.id
    });

    if (!result) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    const followerCount = await Follow.getFollowerCount(req.params.id);

    res.json({ 
      message: 'User unfollowed successfully',
      following: false,
      followerCount
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { page = 1, limit = 20 } = req.query;
    const followers = await Follow.getFollowers(req.params.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: true
    });

    const total = await Follow.getFollowerCount(req.params.id);

    res.json({
      followers,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { page = 1, limit = 20 } = req.query;
    const following = await Follow.getFollowing(req.params.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: true
    });

    const total = await Follow.getFollowingCount(req.params.id);

    res.json({
      following,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get follower count
exports.getFollowerCount = async (req, res) => {
  try {
    const count = await Follow.getFollowerCount(req.params.id);
    res.json({ count });
  } catch (error) {
    console.error('Get follower count error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get following count
exports.getFollowingCount = async (req, res) => {
  try {
    const count = await Follow.getFollowingCount(req.params.id);
    res.json({ count });
  } catch (error) {
    console.error('Get following count error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};