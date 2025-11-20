const Blog = require('../models/Blog');
const User = require('../models/User');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');

exports.createBlog = async (req, res) => {
  try {
    console.log('Creating blog with data:', req.body);
    console.log('User ID:', req.user.id);
    
    // Validate required fields
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Create slug from title if not provided
    let slug = req.body.slug;
    if (!slug) {
      slug = title.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);
    }

    // Ensure slug is unique
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    const blogData = {
      ...req.body,
      author: req.user.id,
      slug,
      status: req.body.status || 'published',
      publishedAt: req.body.status === 'published' ? new Date() : null
    };

    const blog = new Blog(blogData);
    await blog.save();
    
    console.log('Blog created successfully:', blog._id);
    
    // Update user's total posts count
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalPosts: 1 } });
    
    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'name avatar')
      .populate('category', 'name');
    
    res.status(201).json(populatedBlog);
  } catch (err) {
    console.error('Create blog error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, author, status = 'published', featured, search } = req.query;

    // Build query
    let query = { status };
    
    if (category) query.category = category;
    if (author) query.author = author;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
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
  } catch (err) {
    console.error('Get blogs error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('category', 'name');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    await blog.incrementViews();
    
    res.json(blog);
  } catch (err) {
    console.error('Get blog error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'name avatar').populate('category', 'name');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found or unauthorized' });
    }
    
    res.json(blog);
  } catch (err) {
    console.error('Update blog error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found or unauthorized' });
    }

    // Update user's total posts count
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalPosts: -1 } });
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Delete blog error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get featured blogs
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const blogs = await Blog.find({ status: 'published', featured: true })
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(blogs);
  } catch (err) {
    console.error('Get featured blogs error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get trending blogs
exports.getTrendingBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort({ views: -1, likesCount: -1 })
      .limit(limit);

    res.json(blogs);
  } catch (err) {
    console.error('Get trending blogs error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Advanced search for blogs
exports.searchBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const {
      q: searchQuery,
      category,
      location,
      country,
      countryCode,
      continent,
      rating,
      sortBy = 'relevance'
    } = req.query;

    // Build search query
    let query = { status: 'published' };
    
    // Text search
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } },
        { excerpt: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Location filter
    if (location) {
      query.$or = query.$or || [];
      query.$or.push(
        { 'geotag.city': { $regex: location, $options: 'i' } },
        { 'geotag.address': { $regex: location, $options: 'i' } },
        { location: { $regex: location, $options: 'i' } }
      );
    }

    // Country filter
    if (country) {
      query['geotag.country'] = { $regex: country, $options: 'i' };
    }

    // Country code filter
    if (countryCode) {
      query['geotag.countryCode'] = countryCode.toUpperCase();
    }

    // Continent filter
    if (continent) {
      query['geotag.continent'] = { $regex: continent, $options: 'i' };
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'rating':
        sortCriteria = { rating: -1, likesCount: -1 };
        break;
      case 'popular':
        sortCriteria = { views: -1, likesCount: -1 };
        break;
      case 'relevance':
      default:
        // For relevance, we'll use a combination of recent + popular
        sortCriteria = { featured: -1, likesCount: -1, views: -1, createdAt: -1 };
        break;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      results: blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      query: searchQuery
    });
  } catch (err) {
    console.error('Search blogs error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Toggle like on a blog (real-time)
exports.toggleBlogLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if blog exists
    const blog = await Blog.findById(id).populate('author', 'name');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Toggle like using Like model
    const result = await Like.toggleLike(userId, 'Blog', id);

    // Update blog likes count
    const likesCount = await Like.getLikeCount('Blog', id);
    await Blog.findByIdAndUpdate(id, { likesCount });

    // Create notification if liked and not own blog
    if (result.liked && blog.author._id.toString() !== userId) {
      const user = await User.findById(userId, 'name avatar');
      
      await Notification.create({
        recipient: blog.author._id,
        sender: userId,
        type: 'like',
        title: 'New Like',
        message: `${user.name} liked your blog "${blog.title}"`,
        link: `/blogs/${blog.slug || blog._id}`,
        data: { blogId: id, blogTitle: blog.title }
      });

      // Emit real-time notification via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${blog.author._id}`).emit('new-notification', {
          type: 'like',
          message: `${user.name} liked your blog "${blog.title}"`,
          link: `/blogs/${blog.slug || blog._id}`,
          sender: { name: user.name, avatar: user.avatar },
          createdAt: new Date()
        });
      }
    }

    res.json({
      liked: result.liked,
      likesCount,
      message: result.liked ? 'Blog liked' : 'Blog unliked'
    });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Toggle bookmark on a blog
exports.toggleBlogBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ user: userId, blog: id });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      res.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      // Add bookmark
      await Bookmark.create({ user: userId, blog: id });
      res.json({ bookmarked: true, message: 'Blog bookmarked' });
    }
  } catch (err) {
    console.error('Toggle bookmark error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get user's bookmarked blogs
exports.getBookmarkedBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    // Get bookmarked blog IDs
    const bookmarks = await Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'blog',
        populate: [
          { path: 'author', select: 'name avatar' },
          { path: 'category', select: 'name' }
        ]
      });

    const blogs = bookmarks.map(b => b.blog).filter(b => b); // Filter out null blogs

    const total = await Bookmark.countDocuments({ user: userId });

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (err) {
    console.error('Get bookmarked blogs error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get blog with user engagement status (liked, bookmarked)
exports.getBlogWithEngagement = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user ? req.user.id : null;

    const blog = await Blog.findById(blogId)
      .populate('author', 'name avatar bio')
      .populate('category', 'name');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blogId, { $inc: { views: 1 } });

    let isLiked = false;
    let isBookmarked = false;

    if (userId) {
      // Check if user liked the blog
      isLiked = await Like.isLikedByUser(userId, 'Blog', blogId);
      
      // Check if user bookmarked the blog
      const bookmark = await Bookmark.findOne({ user: userId, blog: blogId });
      isBookmarked = !!bookmark;
    }

    res.json({
      blog,
      engagement: {
        isLiked,
        isBookmarked,
        likesCount: blog.likesCount || 0,
        commentsCount: blog.commentsCount || 0,
        views: blog.views || 0
      }
    });
  } catch (err) {
    console.error('Get blog with engagement error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
