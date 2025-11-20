const Blog = require('../models/Blog');
const User = require('../models/User');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');

/**
 * Get social feed - blogs from users the current user follows
 * Real-time Instagram-like feed
 */
exports.getSocialFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    // Get user's following list
    const user = await User.findById(userId, 'following');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followingIds = user.following || [];

    // If not following anyone, return empty feed
    if (followingIds.length === 0) {
      return res.json({
        blogs: [],
        currentPage: page,
        totalPages: 0,
        totalBlogs: 0,
        message: 'Start following users to see their posts'
      });
    }

    // Get blogs from followed users
    const blogs = await Blog.find({
      author: { $in: followingIds },
      status: 'published'
    })
      .populate('author', 'name avatar bio')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add engagement data for each blog
    const blogsWithEngagement = await Promise.all(
      blogs.map(async (blog) => {
        const isLiked = await Like.isLikedByUser(userId, 'Blog', blog._id);
        const isBookmarked = await Bookmark.findOne({ user: userId, blog: blog._id });
        
        return {
          ...blog.toObject(),
          engagement: {
            isLiked,
            isBookmarked: !!isBookmarked,
            likesCount: blog.likesCount || 0,
            commentsCount: blog.commentsCount || 0,
            views: blog.views || 0
          }
        };
      })
    );

    const total = await Blog.countDocuments({
      author: { $in: followingIds },
      status: 'published'
    });

    res.json({
      blogs: blogsWithEngagement,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (err) {
    console.error('Get social feed error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Get recommended users to follow
 * Based on similar interests, popular authors, etc.
 */
exports.getRecommendedUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const userId = req.user.id;

    // Get current user's following list
    const currentUser = await User.findById(userId, 'following');
    const followingIds = currentUser.following || [];
    
    // Add current user ID to exclude
    const excludeIds = [...followingIds, userId];

    // Find users with most posts and followers, excluding already followed
    const recommendedUsers = await User.find({
      _id: { $nin: excludeIds },
      isActive: true,
      role: { $in: ['author', 'admin'] }
    })
      .select('name avatar bio totalPosts followers following')
      .sort({ totalPosts: -1, followers: -1 })
      .limit(limit);

    // Add follower counts
    const usersWithCounts = recommendedUsers.map(user => ({
      ...user.toObject(),
      followerCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0,
      postCount: user.totalPosts || 0
    }));

    res.json({
      users: usersWithCounts
    });
  } catch (err) {
    console.error('Get recommended users error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Get trending blogs (most engagement in last 7 days)
 */
exports.getTrendingBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user ? req.user.id : null;

    // Get blogs from last 7 days, sorted by engagement
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const blogs = await Blog.find({
      status: 'published',
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort({ likesCount: -1, views: -1, commentsCount: -1 })
      .limit(limit);

    // Add engagement data if user is authenticated
    let blogsWithEngagement = blogs;
    if (userId) {
      blogsWithEngagement = await Promise.all(
        blogs.map(async (blog) => {
          const isLiked = await Like.isLikedByUser(userId, 'Blog', blog._id);
          const isBookmarked = await Bookmark.findOne({ user: userId, blog: blog._id });
          
          return {
            ...blog.toObject(),
            engagement: {
              isLiked,
              isBookmarked: !!isBookmarked
            }
          };
        })
      );
    }

    res.json({
      blogs: blogsWithEngagement
    });
  } catch (err) {
    console.error('Get trending blogs error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Get user's activity feed (their own posts)
 */
exports.getUserActivityFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.params.userId || req.user.id;

    const blogs = await Blog.find({
      author: userId,
      status: 'published'
    })
      .populate('author', 'name avatar bio')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments({
      author: userId,
      status: 'published'
    });

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (err) {
    console.error('Get user activity feed error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = exports;
