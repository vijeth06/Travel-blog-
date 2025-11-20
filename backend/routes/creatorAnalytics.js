const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const Collection = require('../models/Collection');
const User = require('../models/User');
const PremiumTemplate = require('../models/PremiumTemplate');

// Get creator dashboard statistics
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all blogs
    const blogs = await Blog.find({ author: userId });
    const publishedBlogs = blogs.filter(b => b.status === 'published');
    const totalBlogs = publishedBlogs.length;

    // Calculate total views
    const totalViews = publishedBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

    // Get reactions on blogs
    const blogIds = publishedBlogs.map(b => b._id);
    const reactions = await Reaction.find({
      targetType: 'blog',
      targetId: { $in: blogIds }
    });
    const totalReactions = reactions.length;

    // Reaction breakdown
    const reactionBreakdown = reactions.reduce((acc, r) => {
      acc[r.reactionType] = (acc[r.reactionType] || 0) + 1;
      return acc;
    }, {});

    // Get comments on blogs
    const comments = await Comment.find({
      blog: { $in: blogIds }
    });
    const totalComments = comments.length;

    // Get collections
    const collections = await Collection.find({ user: userId });
    const totalCollections = collections.length;
    const publicCollections = collections.filter(c => c.isPublic).length;
    const totalCollectionViews = collections.reduce((sum, c) => sum + (c.views || 0), 0);
    const totalCollectionFollowers = collections.reduce((sum, c) => sum + (c.followers?.length || 0), 0);

    // Get premium templates
    const templates = await PremiumTemplate.find({ createdBy: userId });
    const totalTemplates = templates.length;
    const totalTemplatePurchases = templates.reduce((sum, t) => sum + (t.purchaseCount || 0), 0);
    const totalTemplateRevenue = templates.reduce((sum, t) => sum + (t.price * (t.purchaseCount || 0)), 0);

    // Get followers
    const user = await User.findById(userId).select('followers following');
    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;

    // Engagement rate
    const engagementRate = totalViews > 0 
      ? ((totalReactions + totalComments) / totalViews * 100).toFixed(2)
      : 0;

    // Average views per blog
    const avgViewsPerBlog = totalBlogs > 0 
      ? Math.round(totalViews / totalBlogs)
      : 0;

    // Top performing blogs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBlogs = publishedBlogs.filter(b => new Date(b.publishedAt) >= thirtyDaysAgo);
    const topBlogs = publishedBlogs
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(b => ({
        id: b._id,
        title: b.title,
        views: b.views || 0,
        publishedAt: b.publishedAt
      }));

    // Growth metrics (last 30 days vs previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const blogsLast30 = blogs.filter(b => {
      const date = new Date(b.createdAt);
      return date >= thirtyDaysAgo;
    }).length;

    const blogsPrevious30 = blogs.filter(b => {
      const date = new Date(b.createdAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    const blogGrowth = blogsPrevious30 > 0
      ? ((blogsLast30 - blogsPrevious30) / blogsPrevious30 * 100).toFixed(1)
      : 100;

    res.json({
      success: true,
      data: {
        content: {
          totalBlogs,
          publishedBlogs: totalBlogs,
          draftBlogs: blogs.length - totalBlogs,
          recentBlogs: recentBlogs.length
        },
        engagement: {
          totalViews,
          avgViewsPerBlog,
          totalReactions,
          totalComments,
          engagementRate: parseFloat(engagementRate),
          reactionBreakdown
        },
        collections: {
          total: totalCollections,
          public: publicCollections,
          private: totalCollections - publicCollections,
          totalViews: totalCollectionViews,
          totalFollowers: totalCollectionFollowers
        },
        templates: {
          total: totalTemplates,
          purchases: totalTemplatePurchases,
          revenue: totalTemplateRevenue
        },
        community: {
          followers: followersCount,
          following: followingCount
        },
        topPerforming: topBlogs,
        growth: {
          blogs: {
            last30Days: blogsLast30,
            previous30Days: blogsPrevious30,
            percentChange: parseFloat(blogGrowth)
          }
        }
      }
    });
  } catch (error) {
    console.error('Get creator dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get creator statistics'
    });
  }
});

// Get blog performance analytics
router.get('/blogs/:blogId/analytics', protect, async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view analytics for this blog'
      });
    }

    // Get reactions
    const reactions = await Reaction.find({
      targetType: 'blog',
      targetId: blogId
    }).populate('user', 'name avatar');

    const reactionBreakdown = reactions.reduce((acc, r) => {
      acc[r.reactionType] = (acc[r.reactionType] || 0) + 1;
      return acc;
    }, {});

    // Get comments
    const comments = await Comment.find({ blog: blogId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Views over time (simulated - would need view tracking)
    const viewsOverTime = blog.viewHistory || [];

    res.json({
      success: true,
      data: {
        blog: {
          id: blog._id,
          title: blog.title,
          publishedAt: blog.publishedAt,
          views: blog.views || 0
        },
        engagement: {
          reactions: {
            total: reactions.length,
            breakdown: reactionBreakdown,
            recent: reactions.slice(0, 10)
          },
          comments: {
            total: comments.length,
            recent: comments.slice(0, 5)
          }
        },
        viewsOverTime
      }
    });
  } catch (error) {
    console.error('Get blog analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blog analytics'
    });
  }
});

// Get engagement funnel
router.get('/funnel', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30' } = req.query; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    const blogs = await Blog.find({
      author: userId,
      publishedAt: { $gte: daysAgo }
    });

    const blogIds = blogs.map(b => b._id);

    // Funnel stages
    const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

    const reactions = await Reaction.find({
      targetType: 'blog',
      targetId: { $in: blogIds },
      createdAt: { $gte: daysAgo }
    });
    const uniqueReactors = new Set(reactions.map(r => r.user.toString())).size;

    const comments = await Comment.find({
      blog: { $in: blogIds },
      createdAt: { $gte: daysAgo }
    });
    const uniqueCommenters = new Set(comments.map(c => c.user.toString())).size;

    // Calculate conversion rates
    const viewToReactionRate = totalViews > 0 ? (uniqueReactors / totalViews * 100).toFixed(2) : 0;
    const reactionToCommentRate = uniqueReactors > 0 ? (uniqueCommenters / uniqueReactors * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        funnel: [
          {
            stage: 'Views',
            count: totalViews,
            percentage: 100
          },
          {
            stage: 'Reactions',
            count: uniqueReactors,
            percentage: parseFloat(viewToReactionRate),
            conversionRate: parseFloat(viewToReactionRate)
          },
          {
            stage: 'Comments',
            count: uniqueCommenters,
            percentage: totalViews > 0 ? (uniqueCommenters / totalViews * 100).toFixed(2) : 0,
            conversionRate: parseFloat(reactionToCommentRate)
          }
        ],
        timeRange: parseInt(timeRange)
      }
    });
  } catch (error) {
    console.error('Get engagement funnel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get engagement funnel'
    });
  }
});

// Get audience insights
router.get('/audience', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const blogs = await Blog.find({ author: userId, status: 'published' });
    const blogIds = blogs.map(b => b._id);

    // Get all users who engaged
    const reactions = await Reaction.find({
      targetType: 'blog',
      targetId: { $in: blogIds }
    }).populate('user', 'name country');

    const comments = await Comment.find({
      blog: { $in: blogIds }
    }).populate('user', 'name country');

    const user = await User.findById(userId).populate('followers', 'name country');

    // Country breakdown
    const countryBreakdown = {};
    
    [...reactions, ...comments].forEach(item => {
      if (item.user && item.user.country) {
        countryBreakdown[item.user.country] = (countryBreakdown[item.user.country] || 0) + 1;
      }
    });

    const topCountries = Object.entries(countryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));

    // Most engaged followers
    const followerEngagement = {};
    
    [...reactions, ...comments].forEach(item => {
      if (item.user) {
        const userId = item.user._id.toString();
        followerEngagement[userId] = (followerEngagement[userId] || 0) + 1;
      }
    });

    const topEngagers = Object.entries(followerEngagement)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, engagement]) => {
        const user = reactions.find(r => r.user._id.toString() === userId)?.user ||
                     comments.find(c => c.user._id.toString() === userId)?.user;
        return {
          userId,
          name: user?.name || 'Unknown',
          engagement
        };
      });

    res.json({
      success: true,
      data: {
        totalFollowers: user.followers?.length || 0,
        topCountries,
        topEngagers,
        totalEngagers: Object.keys(followerEngagement).length
      }
    });
  } catch (error) {
    console.error('Get audience insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audience insights'
    });
  }
});

module.exports = router;
