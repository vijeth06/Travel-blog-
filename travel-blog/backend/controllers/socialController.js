const SocialShare = require('../models/SocialShare');
const Blog = require('../models/Blog');
const Package = require('../models/Package');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const activityTracker = require('../middleware/activityTracker');

// @desc    Record a social share
// @route   POST /api/social/share
// @access  Public
const recordShare = async (req, res) => {
  try {
    const { targetType, targetId, platform } = req.body;
    const userId = req.user?.id;

    // Validate target type
    if (!['Blog', 'Package'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    // Verify target exists
    let target;
    if (targetType === 'Blog') {
      target = await Blog.findById(targetId);
    } else {
      target = await Package.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    // Record the share
    const shareData = {
      user: userId,
      targetType,
      targetId,
      platform,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer')
    };

    await SocialShare.recordShare(shareData);

    // Update share count in target
    const shareCount = await SocialShare.countDocuments({ targetType, targetId });
    
    if (targetType === 'Blog') {
      await Blog.findByIdAndUpdate(targetId, { sharesCount: shareCount });
    } else {
      // For packages, we might want to track this differently
      // Could add a sharesCount field to Package model if needed
    }

    res.json({ 
      message: 'Share recorded successfully',
      shareCount,
      platform 
    });
  } catch (error) {
    console.error('Record share error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get share statistics for content
// @route   GET /api/social/stats/:targetType/:targetId
// @access  Public
const getShareStats = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const stats = await SocialShare.getShareStats(targetType, targetId);

    res.json({
      targetType,
      targetId,
      ...stats
    });
  } catch (error) {
    console.error('Get share stats error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get trending shared content
// @route   GET /api/social/trending
// @access  Public
const getTrendingShares = async (req, res) => {
  try {
    const { targetType = 'Blog', timeframe = '7d', limit = 10 } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const trending = await SocialShare.aggregate([
      {
        $match: {
          targetType,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            targetId: '$targetId',
            platform: '$platform'
          },
          shareCount: { $sum: 1 },
          latestShare: { $max: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$_id.targetId',
          totalShares: { $sum: '$shareCount' },
          platforms: {
            $push: {
              platform: '$_id.platform',
              count: '$shareCount'
            }
          },
          latestShare: { $max: '$latestShare' }
        }
      },
      { $sort: { totalShares: -1, latestShare: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate the actual content
    const Model = targetType === 'Blog' ? Blog : Package;
    const populatedTrending = await Model.populate(trending, {
      path: '_id',
      select: targetType === 'Blog' 
        ? 'title slug excerpt featuredImage author category createdAt sharesCount'
        : 'title location price images category type featured'
    });

    res.json({
      trending: populatedTrending.map(item => ({
        content: item._id,
        totalShares: item.totalShares,
        platforms: item.platforms,
        latestShare: item.latestShare
      })),
      timeframe,
      targetType
    });
  } catch (error) {
    console.error('Get trending shares error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Generate social media sharing URLs
// @route   GET /api/social/share-urls/:targetType/:targetId
// @access  Public
const generateShareUrls = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Get content details
    let content;
    let contentUrl;
    let title;
    let description;
    let image;

    if (targetType === 'Blog') {
      content = await Blog.findById(targetId).select('title slug excerpt featuredImage');
      if (!content) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      contentUrl = `${frontendUrl}/blogs/${content.slug || targetId}`;
      title = content.title;
      description = content.excerpt || content.title;
      image = content.featuredImage;
    } else if (targetType === 'Package') {
      content = await Package.findById(targetId).select('title location description images');
      if (!content) {
        return res.status(404).json({ message: 'Package not found' });
      }
      contentUrl = `${frontendUrl}/packages/${targetId}`;
      title = content.title;
      description = `${content.title} - ${content.location}`;
      image = content.images?.[0];
    }

    const encodedUrl = encodeURIComponent(contentUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedImage = image ? encodeURIComponent(image) : '';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      pinterest: image ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedDescription}` : null,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    };

    // Remove null values
    Object.keys(shareUrls).forEach(key => {
      if (shareUrls[key] === null) {
        delete shareUrls[key];
      }
    });

    res.json({
      contentUrl,
      title,
      description,
      image,
      shareUrls
    });
  } catch (error) {
    console.error('Generate share URLs error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Follow a user
// @route   POST /api/social/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const followerId = req.user.id;

    if (followerId === userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    await Follow.create({
      follower: followerId,
      following: userId
    });

    // Track activity for gamification
    await activityTracker.trackActivity(followerId, 'user_followed', { followedUserId: userId });

    // Get updated follower count
    const followerCount = await Follow.countDocuments({ following: userId });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userId}`).emit('follow-updated', {
        followerId,
        followedUserId: userId,
        following: true,
        followerCount
      });
    }

    console.log(`✅ User ${followerId} successfully followed user ${userId}`);

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

// @desc    Unfollow a user
// @route   POST /api/social/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const followerId = req.user.id;

    // Remove follow relationship
    const result = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });

    if (!result) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Get updated follower count
    const followerCount = await Follow.countDocuments({ following: userId });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userId}`).emit('follow-updated', {
        followerId,
        followedUserId: userId,
        following: false,
        followerCount
      });
    }

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

// @desc    Get following status
// @route   GET /api/social/following-status/:userId
// @access  Private
const getFollowingStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const isFollowing = await Follow.exists({
      follower: followerId,
      following: userId
    });

    const followerCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    res.json({
      following: !!isFollowing,
      followerCount,
      followingCount
    });
  } catch (error) {
    console.error('Get following status error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get social feed
// @route   GET /api/social/feed
// @access  Private
const getSocialFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get users that current user follows
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);
    followingIds.push(userId); // Include own posts

    // Get blogs from followed users
    const blogs = await Blog.find({
      author: { $in: followingIds },
      published: true
    })
    .populate('author', 'username email profilePicture')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Blog.countDocuments({
      author: { $in: followingIds },
      published: true
    });

    res.json({
      blogs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get social feed error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get recommended users
// @route   GET /api/social/recommendations
// @access  Public
const getRecommendedUsers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userId = req.user?.id;

    let excludeIds = [];
    if (userId) {
      // Get users already following
      const following = await Follow.find({ follower: userId }).select('following');
      excludeIds = following.map(f => f.following);
      excludeIds.push(userId); // Exclude self
    }

    // Get users with most followers, excluding already followed
    const pipeline = [
      { $match: { _id: { $nin: excludeIds } } },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'following',
          as: 'followers'
        }
      },
      {
        $addFields: {
          followerCount: { $size: '$followers' }
        }
      },
      { $sort: { followerCount: -1, createdAt: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          username: 1,
          email: 1,
          profilePicture: 1,
          bio: 1,
          followerCount: 1
        }
      }
    ];

    const users = await User.aggregate(pipeline);

    res.json({ users });
  } catch (error) {
    console.error('Get recommended users error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user activity
// @route   GET /api/social/activity/:userId
// @access  Public
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get recent blogs by user
    const blogs = await Blog.find({ author: userId, published: true })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get recent likes by user
    const likes = await Like.find({ user: userId })
      .populate('targetId')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent comments by user
    const comments = await Comment.find({ user: userId })
      .populate('blog', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const activity = {
      blogs,
      likes,
      comments,
      page: parseInt(page)
    };

    res.json(activity);
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Send email share
// @route   POST /api/social/email-share
// @access  Public
const emailShare = async (req, res) => {
  try {
    const { to, subject, message, url, targetType, targetId } = req.body;
    
    // Here you would integrate with an email service like SendGrid, Nodemailer, etc.
    // For now, we'll just record the share and return success
    
    if (to) {
      // Record the share
      await recordShare({
        body: { targetType, targetId, platform: 'email' },
        user: req.user,
        ip: req.ip,
        get: (header) => req.get(header)
      }, {
        json: () => {} // Mock response for internal call
      });

      // TODO: Implement actual email sending
      console.log('Email share:', { to, subject, message, url });
    }

    res.json({ message: 'Email share processed successfully' });
  } catch (error) {
    console.error('Email share error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  recordShare,
  getShareStats,
  getTrendingShares,
  generateShareUrls,
  followUser,
  unfollowUser,
  getFollowingStatus,
  getSocialFeed,
  getRecommendedUsers,
  getUserActivity,
  emailShare
};
