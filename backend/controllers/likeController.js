const Like = require('../models/Like');
const Blog = require('../models/Blog');
const Package = require('../models/Package');
const Comment = require('../models/Comment');

// @desc    Toggle like on a target (blog, package, or comment)
// @route   POST /api/likes/toggle
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user.id;

    // Validate target type
    if (!['Blog', 'Package', 'Comment'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    // Verify target exists
    let target;
    switch (targetType) {
      case 'Blog':
        target = await Blog.findById(targetId);
        break;
      case 'Package':
        target = await Package.findById(targetId);
        break;
      case 'Comment':
        target = await Comment.findById(targetId);
        break;
    }

    if (!target) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    // Toggle like
    const result = await Like.toggleLike(userId, targetType, targetId);
    
    // Update like count in the target model
    const likeCount = await Like.getLikeCount(targetType, targetId);
    
    if (targetType === 'Blog') {
      await Blog.findByIdAndUpdate(targetId, { likesCount: likeCount });
    } else if (targetType === 'Package') {
      // Update package rating if needed
      await Package.findByIdAndUpdate(targetId, { 
        'rating.count': likeCount 
      });
    } else if (targetType === 'Comment') {
      await Comment.findByIdAndUpdate(targetId, { likesCount: likeCount });
    }

    // Emit real-time like update
    const io = req.app.get('io');
    if (io && targetType === 'Blog') {
      io.to(`blog-${targetId}`).emit('like-updated', {
        blogId: targetId,
        likeCount,
        action: result.action,
        userId
      });
    }

    // Create notification for content owner when liked (not unliked)
    if (result.action === 'liked') {
      let ownerId = null;
      let notifType = 'like';
      let linkPath = '';
      
      if (targetType === 'Blog' && target.author.toString() !== userId.toString()) {
        ownerId = target.author;
        linkPath = `/blogs/${targetId}`;
      } else if (targetType === 'Comment' && target.user.toString() !== userId.toString()) {
        ownerId = target.user;
        linkPath = `/blogs/${target.blog}#comment-${targetId}`;
      } else if (targetType === 'Package' && target.createdBy && target.createdBy.toString() !== userId.toString()) {
        ownerId = target.createdBy;
        linkPath = `/packages/${targetId}`;
      }
      
      if (ownerId) {
        try {
          const Notification = require('../models/Notification');
          await Notification.create({
            recipient: ownerId,
            sender: userId,
            type: notifType,
            title: 'New Like',
            message: `${req.user.name} liked your ${targetType.toLowerCase()}`,
            link: linkPath,
            data: {
              targetType,
              targetId
            }
          });
          
          // Emit notification via Socket.IO
          if (io) {
            io.to(`user_${ownerId}`).emit('notification', {
              type: 'like',
              message: `${req.user.name} liked your ${targetType.toLowerCase()}`
            });
          }
        } catch (error) {
          console.error('Error creating like notification:', error);
        }
      }
    }

    res.json({
      ...result,
      likeCount,
      message: `${targetType} ${result.action} successfully`
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get like status and count for a target
// @route   GET /api/likes/status/:targetType/:targetId
// @access  Public
const getLikeStatus = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user?.id;

    const likeCount = await Like.getLikeCount(targetType, targetId);
    let isLiked = false;

    if (userId) {
      isLiked = await Like.isLikedByUser(userId, targetType, targetId);
    }

    res.json({
      likeCount,
      isLiked,
      targetType,
      targetId
    });
  } catch (error) {
    console.error('Get like status error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user's liked items
// @route   GET /api/likes/my-likes
// @access  Private
const getUserLikes = async (req, res) => {
  try {
    const { targetType, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const skip = (page - 1) * limit;

    const query = { user: userId };
    if (targetType) query.targetType = targetType;

    const likes = await Like.find(query)
      .populate('targetId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Like.countDocuments(query);

    res.json({
      likes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalLikes: total
    });
  } catch (error) {
    console.error('Get user likes error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get most liked content
// @route   GET /api/likes/trending
// @access  Public
const getTrendingContent = async (req, res) => {
  try {
    const { targetType = 'Blog', limit = 10, timeframe = '7d' } = req.query;

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

    const trending = await Like.aggregate([
      {
        $match: {
          targetType,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$targetId',
          likeCount: { $sum: 1 },
          latestLike: { $max: '$createdAt' }
        }
      },
      { $sort: { likeCount: -1, latestLike: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate the actual content
    const Model = targetType === 'Blog' ? Blog : Package;
    const populatedTrending = await Model.populate(trending, {
      path: '_id',
      select: targetType === 'Blog' 
        ? 'title slug excerpt featuredImage author category createdAt'
        : 'title location price images category type featured'
    });

    res.json({
      trending: populatedTrending.map(item => ({
        content: item._id,
        likeCount: item.likeCount,
        latestLike: item.latestLike
      })),
      timeframe,
      targetType
    });
  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  toggleLike,
  getLikeStatus,
  getUserLikes,
  getTrendingContent
};
