const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Package = require('../models/Package');
const Country = require('../models/Country');
const { protect, optionalAuth } = require('../middleware/auth');

// Simple search endpoint
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { query, type = 'blogs', limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    let results = [];
    const searchRegex = new RegExp(query, 'i');

    if (type === 'blogs') {
      results = await Blog.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex }
        ]
      })
        .populate('author', 'name avatar')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
    } else if (type === 'packages') {
      results = await Package.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { destination: searchRegex }
        ]
      })
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
    }

    res.json({ results, count: results.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Advanced search endpoint
router.get('/advanced', optionalAuth, async (req, res) => {
  try {
    const {
      q,
      destination,
      category,
      minBudget,
      maxBudget,
      duration,
      startDate,
      endDate,
      groupSize,
      travelStyle,
      minRating,
      amenities,
      difficulty,
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.query;

    // Build search query
    let searchQuery = {};
    let aggregationPipeline = [];

    // Text search
    if (q) {
      searchQuery.$text = { $search: q };
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Destination filter
    if (destination) {
      searchQuery.destination = destination;
    }

    // Budget filter
    if (minBudget || maxBudget) {
      searchQuery.price = {};
      if (minBudget) searchQuery.price.$gte = parseFloat(minBudget);
      if (maxBudget) searchQuery.price.$lte = parseFloat(maxBudget);
    }

    // Duration filter
    if (duration) {
      searchQuery.duration = duration;
    }

    // Date availability filter
    if (startDate || endDate) {
      searchQuery.availableDates = {};
      if (startDate) searchQuery.availableDates.$gte = new Date(startDate);
      if (endDate) searchQuery.availableDates.$lte = new Date(endDate);
    }

    // Group size filter
    if (groupSize) {
      if (groupSize === '1') {
        searchQuery.maxGroupSize = { $gte: 1 };
      } else if (groupSize === '2') {
        searchQuery.maxGroupSize = { $gte: 2 };
      } else if (groupSize === '3-5') {
        searchQuery.maxGroupSize = { $gte: 3, $lte: 5 };
      } else if (groupSize === '6-10') {
        searchQuery.maxGroupSize = { $gte: 6, $lte: 10 };
      } else if (groupSize === '10+') {
        searchQuery.maxGroupSize = { $gte: 10 };
      }
    }

    // Travel style filter
    if (travelStyle) {
      searchQuery.travelStyle = travelStyle;
    }

    // Rating filter
    if (minRating) {
      searchQuery.averageRating = { $gte: parseFloat(minRating) };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      searchQuery.amenities = { $in: amenitiesArray };
    }

    // Difficulty filter
    if (difficulty) {
      searchQuery.difficulty = difficulty;
    }

    // Create aggregation pipeline
    aggregationPipeline = [
      { $match: searchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryInfo.name', 0] },
          authorName: { $arrayElemAt: ['$authorInfo.name', 0] },
          relevanceScore: q ? { $meta: 'textScore' } : 1
        }
      }
    ];

    // Sorting
    let sortStage = {};
    switch (sortBy) {
      case 'price-low':
        sortStage.price = 1;
        break;
      case 'price-high':
        sortStage.price = -1;
        break;
      case 'rating':
        sortStage.averageRating = -1;
        break;
      case 'newest':
        sortStage.createdAt = -1;
        break;
      case 'popular':
        sortStage.viewCount = -1;
        break;
      case 'relevance':
      default:
        if (q) {
          sortStage = { score: { $meta: 'textScore' } };
        } else {
          sortStage.createdAt = -1;
        }
        break;
    }

    aggregationPipeline.push({ $sort: sortStage });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: parseInt(limit) });

    // Project final fields
    aggregationPipeline.push({
      $project: {
        title: 1,
        description: 1,
        content: 1,
        images: 1,
        price: 1,
        duration: 1,
        difficulty: 1,
        maxGroupSize: 1,
        amenities: 1,
        averageRating: 1,
        reviewCount: 1,
        viewCount: 1,
        tags: 1,
        travelStyle: 1,
        destination: 1,
        categoryName: 1,
        authorName: 1,
        createdAt: 1,
        relevanceScore: 1
      }
    });

    // Execute search across multiple collections
    const [blogs, packages] = await Promise.all([
      Blog.aggregate([
        ...aggregationPipeline.map(stage => {
          if (stage.$match) {
            // Adapt search for blogs
            const blogMatch = { ...stage.$match };
            if (blogMatch.price) {
              delete blogMatch.price; // Blogs don't have price
            }
            if (blogMatch.maxGroupSize) {
              delete blogMatch.maxGroupSize; // Blogs don't have group size
            }
            if (blogMatch.amenities) {
              delete blogMatch.amenities; // Blogs don't have amenities
            }
            return { $match: blogMatch };
          }
          return stage;
        })
      ]),
      Package.aggregate(aggregationPipeline)
    ]);

    // Combine and format results
    let allResults = [
      ...blogs.map(blog => ({ ...blog, type: 'blog' })),
      ...packages.map(pkg => ({ ...pkg, type: 'package' }))
    ];

    // Sort combined results if needed
    if (sortBy === 'relevance' && q) {
      allResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    // Get total count for pagination
    const totalCountPipeline = aggregationPipeline.slice(0, -2); // Remove skip and limit
    const [blogCount, packageCount] = await Promise.all([
      Blog.aggregate([
        ...totalCountPipeline.map(stage => {
          if (stage.$match) {
            const blogMatch = { ...stage.$match };
            if (blogMatch.price) delete blogMatch.price;
            if (blogMatch.maxGroupSize) delete blogMatch.maxGroupSize;
            if (blogMatch.amenities) delete blogMatch.amenities;
            return { $match: blogMatch };
          }
          return stage;
        }),
        { $count: 'total' }
      ]),
      Package.aggregate([...totalCountPipeline, { $count: 'total' }])
    ]);

    const totalResults = (blogCount[0]?.total || 0) + (packageCount[0]?.total || 0);

    // Add search analytics
    if (req.user) {
      // Track search for user analytics
      const searchData = {
        userId: req.user.id,
        query: q,
        filters: {
          destination,
          category,
          budget: [minBudget, maxBudget],
          travelStyle,
          difficulty
        },
        resultsCount: totalResults,
        timestamp: new Date()
      };
      
      // Save search analytics (optional - you can create a SearchAnalytics model)
      console.log('Search performed:', searchData);
    }

    res.json({
      results: allResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / parseInt(limit)),
        totalResults,
        hasNext: skip + allResults.length < totalResults,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        destination,
        category,
        budget: [minBudget, maxBudget],
        travelStyle,
        difficulty,
        groupSize,
        amenities: amenities ? amenities.split(',') : []
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      message: 'Search failed',
      error: error.message
    });
  }
});

// Search suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const [blogSuggestions, packageSuggestions, destinationSuggestions] = await Promise.all([
      Blog.find(
        { $text: { $search: q } },
        { title: 1, score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(5),
      
      Package.find(
        { $text: { $search: q } },
        { title: 1, score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(5),
      
      Country.find(
        { name: { $regex: q, $options: 'i' } }
      ).select('name').limit(5)
    ]);

    const suggestions = [
      ...blogSuggestions.map(item => ({ type: 'blog', title: item.title, id: item._id })),
      ...packageSuggestions.map(item => ({ type: 'package', title: item.title, id: item._id })),
      ...destinationSuggestions.map(item => ({ type: 'destination', title: item.name, id: item._id }))
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
});

// Popular searches endpoint
router.get('/popular', async (req, res) => {
  try {
    // This could be based on actual analytics data
    const popularSearches = [
      'Adventure tours',
      'Beach destinations',
      'Cultural experiences',
      'Mountain hiking',
      'City breaks',
      'Food tours',
      'Photography tours',
      'Wildlife safaris',
      'Historical sites',
      'Romantic getaways'
    ];

    res.json({ popularSearches });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({ message: 'Failed to get popular searches' });
  }
});

// Search filters options endpoint
router.get('/filters', async (req, res) => {
  try {
    const [categories, destinations] = await Promise.all([
      require('../models/Category').find().select('name'),
      Country.find().select('name')
    ]);

    const filterOptions = {
      categories: categories.map(cat => ({ id: cat._id, name: cat.name })),
      destinations: destinations.map(dest => ({ id: dest._id, name: dest.name })),
      travelStyles: [
        'Adventure', 'Relaxation', 'Cultural', 'Business', 'Family', 
        'Solo', 'Romantic', 'Backpacking', 'Luxury', 'Budget'
      ],
      difficulties: ['Easy', 'Moderate', 'Challenging', 'Expert'],
      durations: [
        '1 day', '2-3 days', '4-7 days', '1-2 weeks', '2-4 weeks', '1+ month'
      ],
      groupSizes: [
        { value: '1', label: 'Solo (1 person)' },
        { value: '2', label: 'Couple (2 people)' },
        { value: '3-5', label: 'Small Group (3-5 people)' },
        { value: '6-10', label: 'Medium Group (6-10 people)' },
        { value: '10+', label: 'Large Group (10+ people)' }
      ],
      amenities: [
        'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Beach Access',
        'Mountain View', 'City View', 'Pet Friendly', 'Parking', 'Airport Shuttle',
        'Room Service', 'Laundry', 'Air Conditioning', 'Heating', 'Kitchen'
      ]
    };

    res.json(filterOptions);
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({ message: 'Failed to get filter options' });
  }
});

// Search suggestions endpoint
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchRegex = new RegExp(query, 'i');
    const suggestions = [];

    // Get blog title suggestions
    const blogSuggestions = await Blog.find({ title: searchRegex })
      .select('title')
      .limit(parseInt(limit));

    // Get destination suggestions from packages
    const destinations = await Package.distinct('destination', {
      destination: searchRegex
    }).limit(parseInt(limit));

    blogSuggestions.forEach(blog => suggestions.push(blog.title));
    destinations.forEach(dest => suggestions.push(dest));

    res.json({ suggestions: [...new Set(suggestions)].slice(0, limit) });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;