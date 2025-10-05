const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Package = require('../models/Package');
const Booking = require('../models/Booking');

// Get comprehensive analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBlogs,
      totalComments,
      pendingComments,
      totalPackages,
      totalBookings,
      recentUsers,
      popularBlogs,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      Package.countDocuments(),
      Booking.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Blog.find({ status: 'published' }).sort({ views: -1, likesCount: -1 }).limit(5).populate('author', 'name'),
      Blog.find().sort({ createdAt: -1 }).limit(10).populate('author', 'name').select('title author createdAt status')
    ]);

    // Calculate growth metrics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      newUsersThisMonth,
      newBlogsThisMonth,
      newCommentsThisMonth,
      newBookingsThisMonth
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Blog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Comment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Calculate revenue (if applicable)
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // User role distribution
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Blog status distribution
    const blogStatuses = await Blog.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalBlogs,
        totalComments,
        pendingComments,
        totalPackages,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      growth: {
        newUsersThisMonth,
        newBlogsThisMonth,
        newCommentsThisMonth,
        newBookingsThisMonth
      },
      distributions: {
        userRoles,
        blogStatuses
      },
      recent: {
        users: recentUsers,
        blogs: popularBlogs,
        activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
};

// Get all blogs for admin (including drafts)
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, author, search } = req.query;

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

// Admin delete any blog
exports.deleteBlogAdmin = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Update author's total posts count
    await User.findByIdAndUpdate(blog.author, { $inc: { totalPosts: -1 } });
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Admin delete blog error:', error);
    res.status(500).json({ message: 'Failed to delete blog' });
  }
};

// Admin update any blog
exports.updateBlogAdmin = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'name email avatar').populate('category', 'name');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Admin update blog error:', error);
    res.status(500).json({ message: 'Failed to update blog' });
  }
};

// Toggle blog featured status
exports.toggleBlogFeatured = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.featured = !blog.featured;
    await blog.save();
    
    res.json({ message: `Blog ${blog.featured ? 'featured' : 'unfeatured'} successfully`, featured: blog.featured });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Failed to toggle featured status' });
  }
};

// Get all comments for moderation
exports.getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status = 'pending', blogId } = req.query;

    let query = {};
    if (status !== 'all') query.status = status;
    if (blogId) query.blog = blogId;

    const comments = await Comment.find(query)
      .populate('user', 'name email avatar')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComments: total
    });
  } catch (error) {
    console.error('Get all comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// Bulk moderate comments
exports.bulkModerateComments = async (req, res) => {
  try {
    const { commentIds, action, reason } = req.body;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({ message: 'Comment IDs are required' });
    }

    if (!['approved', 'rejected', 'pending'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const updateData = { status: action };
    if (reason) updateData.moderationReason = reason;

    await Comment.updateMany(
      { _id: { $in: commentIds } },
      updateData
    );

    res.json({ message: `${commentIds.length} comments ${action} successfully` });
  } catch (error) {
    console.error('Bulk moderate comments error:', error);
    res.status(500).json({ message: 'Failed to moderate comments' });
  }
};

// Get system health status
exports.getSystemHealth = async (req, res) => {
  try {
    const dbStatus = await User.findOne().select('_id');
    
    const health = {
      status: 'healthy',
      database: dbStatus ? 'connected' : 'disconnected',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };

    res.json(health);
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date(),
      error: error.message
    });
  }
};

// Get user activity logs
exports.getUserActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get recent user activities (blogs, comments, bookings)
    const [recentBlogs, recentComments, recentBookings] = await Promise.all([
      Blog.find()
        .populate('author', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title author createdAt status'),
      Comment.find()
        .populate('user', 'name email avatar')
        .populate('blog', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('content user blog createdAt status'),
      Booking.find()
        .populate('user', 'name email avatar')
        .populate('package', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('user package createdAt status totalAmount')
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentBlogs.map(blog => ({
        type: 'blog',
        action: 'created',
        user: blog.author,
        target: blog.title,
        status: blog.status,
        createdAt: blog.createdAt,
        id: blog._id
      })),
      ...recentComments.map(comment => ({
        type: 'comment',
        action: 'posted',
        user: comment.user,
        target: comment.blog?.title,
        status: comment.status,
        createdAt: comment.createdAt,
        id: comment._id
      })),
      ...recentBookings.map(booking => ({
        type: 'booking',
        action: 'created',
        user: booking.user,
        target: booking.package?.title,
        status: booking.status,
        amount: booking.totalAmount,
        createdAt: booking.createdAt,
        id: booking._id
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paginatedActivities = activities.slice(skip, skip + limit);

    res.json({
      activities: paginatedActivities,
      currentPage: page,
      totalPages: Math.ceil(activities.length / limit),
      totalActivities: activities.length
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Failed to fetch user activity' });
  }
};
