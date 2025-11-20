const Blog = require('../models/Blog');
const Package = require('../models/Package');

/**
 * Advanced search across blogs and packages
 * @route GET /api/search/advanced
 * @access Public
 */
exports.advancedSearch = async (req, res) => {
  try {
    const {
      query,
      type = 'all', // 'blogs', 'packages', 'all'
      destination,
      country,
      continent,
      minBudget,
      maxBudget,
      startDate,
      endDate,
      travelStyle,
      category,
      rating,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;
    let results = { blogs: [], packages: [], total: 0 };

    // Search Blogs
    if (type === 'all' || type === 'blogs') {
      const blogQuery = buildBlogQuery({
        query,
        destination,
        country,
        continent,
        category,
        rating
      });

      const blogs = await Blog.find(blogQuery)
        .populate('author', 'name avatar')
        .populate('category', 'name')
        .sort(getSortCriteria(sortBy))
        .skip(type === 'blogs' ? skip : 0)
        .limit(type === 'blogs' ? parseInt(limit) : 10);

      results.blogs = blogs;
      results.blogCount = await Blog.countDocuments(blogQuery);
    }

    // Search Packages
    if (type === 'all' || type === 'packages') {
      const packageQuery = buildPackageQuery({
        query,
        destination,
        country,
        continent,
        minBudget,
        maxBudget,
        startDate,
        endDate,
        travelStyle,
        rating
      });

      const packages = await Package.find(packageQuery)
        .populate('createdBy', 'name avatar')
        .sort(getSortCriteria(sortBy))
        .skip(type === 'packages' ? skip : 0)
        .limit(type === 'packages' ? parseInt(limit) : 10);

      results.packages = packages;
      results.packageCount = await Package.countDocuments(packageQuery);
    }

    results.total = (results.blogCount || 0) + (results.packageCount || 0);
    results.currentPage = parseInt(page);
    results.totalPages = Math.ceil(results.total / limit);

    res.json(results);
  } catch (err) {
    console.error('Advanced search error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Get search suggestions (autocomplete)
 * @route GET /api/search/suggestions
 * @access Public
 */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(query, 'i');

    // Get destination suggestions from blogs
    const destinations = await Blog.distinct('geotag.city', {
      'geotag.city': regex,
      status: 'published'
    }).limit(5);

    // Get country suggestions
    const countries = await Blog.distinct('geotag.country', {
      'geotag.country': regex,
      status: 'published'
    }).limit(5);

    // Get blog titles
    const blogTitles = await Blog.find({
      title: regex,
      status: 'published'
    })
      .select('title')
      .limit(5);

    const suggestions = [
      ...destinations.map(d => ({ type: 'destination', value: d })),
      ...countries.map(c => ({ type: 'country', value: c })),
      ...blogTitles.map(b => ({ type: 'blog', value: b.title }))
    ];

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (err) {
    console.error('Search suggestions error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Get popular destinations
 * @route GET /api/search/popular-destinations
 * @access Public
 */
exports.getPopularDestinations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Aggregate blogs by destination
    const destinations = await Blog.aggregate([
      { $match: { status: 'published', 'geotag.city': { $exists: true } } },
      {
        $group: {
          _id: {
            city: '$geotag.city',
            country: '$geotag.country',
            lat: '$geotag.lat',
            lng: '$geotag.lng'
          },
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likesCount' }
        }
      },
      { $sort: { count: -1, totalViews: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          coordinates: { lat: '$_id.lat', lng: '$_id.lng' },
          blogCount: '$count',
          views: '$totalViews',
          likes: '$totalLikes'
        }
      }
    ]);

    res.json({ destinations });
  } catch (err) {
    console.error('Popular destinations error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Save user search preferences
 * @route POST /api/search/save-preferences
 * @access Private
 */
exports.saveSearchPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $set: { 'searchPreferences': preferences }
    });

    res.json({ message: 'Search preferences saved', preferences });
  } catch (err) {
    console.error('Save preferences error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Helper function to build blog query
function buildBlogQuery(filters) {
  const query = { status: 'published' };

  if (filters.query) {
    query.$or = [
      { title: { $regex: filters.query, $options: 'i' } },
      { content: { $regex: filters.query, $options: 'i' } },
      { tags: { $in: [new RegExp(filters.query, 'i')] } }
    ];
  }

  if (filters.destination) {
    query['geotag.city'] = { $regex: filters.destination, $options: 'i' };
  }

  if (filters.country) {
    query['geotag.country'] = { $regex: filters.country, $options: 'i' };
  }

  if (filters.continent) {
    query['geotag.continent'] = { $regex: filters.continent, $options: 'i' };
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.rating) {
    query.rating = { $gte: parseFloat(filters.rating) };
  }

  return query;
}

// Helper function to build package query
function buildPackageQuery(filters) {
  const query = { isActive: true };

  if (filters.query) {
    query.$or = [
      { name: { $regex: filters.query, $options: 'i' } },
      { description: { $regex: filters.query, $options: 'i' } },
      { destination: { $regex: filters.query, $options: 'i' } }
    ];
  }

  if (filters.destination) {
    query.destination = { $regex: filters.destination, $options: 'i' };
  }

  if (filters.country) {
    query.country = { $regex: filters.country, $options: 'i' };
  }

  if (filters.minBudget || filters.maxBudget) {
    query.price = {};
    if (filters.minBudget) query.price.$gte = parseFloat(filters.minBudget);
    if (filters.maxBudget) query.price.$lte = parseFloat(filters.maxBudget);
  }

  if (filters.startDate) {
    query.startDate = { $gte: new Date(filters.startDate) };
  }

  if (filters.endDate) {
    query.endDate = { $lte: new Date(filters.endDate) };
  }

  if (filters.travelStyle) {
    query.travelStyle = filters.travelStyle;
  }

  if (filters.rating) {
    query.averageRating = { $gte: parseFloat(filters.rating) };
  }

  return query;
}

// Helper function for sort criteria
function getSortCriteria(sortBy) {
  switch (sortBy) {
    case 'newest':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'popular':
      return { views: -1, likesCount: -1 };
    case 'rating':
      return { rating: -1 };
    case 'price-low':
      return { price: 1 };
    case 'price-high':
      return { price: -1 };
    default:
      return { featured: -1, views: -1, createdAt: -1 };
  }
}

module.exports = exports;
