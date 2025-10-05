const FavoritePlace = require('../models/FavoritePlace');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get most popular places by continent
exports.getMostPopularByContinent = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const continents = [
      'Asia', 'Africa', 'North America', 'South America', 
      'Antarctica', 'Europe', 'Australia'
    ];

    const popularPlaces = await Promise.all(
      continents.map(async (continent) => {
        const places = await FavoritePlace.aggregate([
          { $match: { continent } },
          { 
            $addFields: { 
              likesCount: { $size: { $ifNull: ['$likes', []] } },
              commentsCount: { $size: { $ifNull: ['$comments', []] } }
            } 
          },
          { $sort: { likesCount: -1, commentsCount: -1 } },
          { $limit: parseInt(limit) },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
              pipeline: [
                { $project: { name: 1, avatar: 1 } }
              ]
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              placeName: 1,
              slug: 1,
              continent: 1,
              country: 1,
              city: 1,
              description: 1,
              images: { $slice: ['$images', 1] },
              rating: 1,
              likesCount: 1,
              commentsCount: 1,
              user: 1,
              featured: 1,
              createdAt: 1
            }
          }
        ]);
        
        return {
          continent,
          places: places.map(place => ({
            ...place,
            isLiked: req.user ? place.likes?.some(like => like.user?.toString() === req.user.id) : false
          }))
        };
      })
    );

    res.json({
      success: true,
      data: popularPlaces
    });

  } catch (error) {
    console.error('Error fetching popular places by continent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular places',
      error: error.message
    });
  }
};

// Get all favorite places with filters
exports.getFavoritePlaces = async (req, res) => {
  try {
    const {
      continent,
      country,
      category,
      rating,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (continent) filter.continent = continent;
    if (country) filter.country = new RegExp(country, 'i');
    if (category) filter.categories = { $in: [category] };
    if (rating) filter.rating = { $gte: parseInt(rating) };
    if (featured !== undefined) filter.featured = featured === 'true';

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get places with pagination
    const places = await FavoritePlace.find(filter)
      .populate('user', 'name avatar')
      .populate('likes.user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add computed fields
    const placesWithCounts = places.map(place => ({
      ...place,
      likesCount: place.likes?.length || 0,
      commentsCount: place.comments?.length || 0
    }));

    // Get total count for pagination
    const totalPlaces = await FavoritePlace.countDocuments(filter);
    const totalPages = Math.ceil(totalPlaces / parseInt(limit));

    res.json({
      success: true,
      data: {
        places: placesWithCounts,
        currentPage: parseInt(page),
        totalPages,
        totalPlaces,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching favorite places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorite places',
      error: error.message
    });
  }
};

// Get favorite places by continent
exports.getFavoritePlacesByContinent = async (req, res) => {
  try {
    const { continent } = req.params;
    const {
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter
    const filter = { continent };
    if (featured !== undefined) filter.featured = featured === 'true';

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const places = await FavoritePlace.find(filter)
      .populate('user', 'name avatar')
      .populate('likes.user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add computed fields
    const placesWithCounts = places.map(place => ({
      ...place,
      likesCount: place.likes?.length || 0,
      commentsCount: place.comments?.length || 0
    }));

    const totalPlaces = await FavoritePlace.countDocuments(filter);
    const totalPages = Math.ceil(totalPlaces / parseInt(limit));

    res.json({
      success: true,
      data: {
        places: placesWithCounts,
        continent,
        currentPage: parseInt(page),
        totalPages,
        totalPlaces,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching places by continent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch places by continent',
      error: error.message
    });
  }
};

// Get single favorite place by slug
exports.getFavoritePlaceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const place = await FavoritePlace.findOne({ slug })
      .populate('user', 'name avatar bio')
      .populate('likes.user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .lean();

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Favorite place not found'
      });
    }

    // Increment view count
    await FavoritePlace.findByIdAndUpdate(place._id, {
      $inc: { viewsCount: 1 }
    });

    // Add computed fields
    const placeWithCounts = {
      ...place,
      likesCount: place.likes?.length || 0,
      commentsCount: place.comments?.length || 0,
      viewsCount: (place.viewsCount || 0) + 1
    };

    res.json({
      success: true,
      data: placeWithCounts
    });

  } catch (error) {
    console.error('Error fetching favorite place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorite place',
      error: error.message
    });
  }
};

// Create new favorite place
exports.createFavoritePlace = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const placeData = {
      ...req.body,
      user: req.user?.id || req.body.user // Allow manual user assignment for testing
    };

    // If no user provided and no authenticated user, use a default user for testing
    if (!placeData.user) {
      const defaultUser = await User.findOne().limit(1);
      if (defaultUser) {
        placeData.user = defaultUser._id;
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
    }

    const place = new FavoritePlace(placeData);
    await place.save();

    // Populate the created place
    const populatedPlace = await FavoritePlace.findById(place._id)
      .populate('user', 'name avatar')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Favorite place created successfully',
      data: {
        ...populatedPlace,
        likesCount: 0,
        commentsCount: 0
      }
    });

  } catch (error) {
    console.error('Error creating favorite place:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A place with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create favorite place',
      error: error.message
    });
  }
};

// Update favorite place
exports.updateFavoritePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the place and check ownership
    const place = await FavoritePlace.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Favorite place not found'
      });
    }

    if (place.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this place'
      });
    }

    // Update the place
    const updatedPlace = await FavoritePlace.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('user', 'name avatar').lean();

    res.json({
      success: true,
      message: 'Favorite place updated successfully',
      data: {
        ...updatedPlace,
        likesCount: updatedPlace.likes?.length || 0,
        commentsCount: updatedPlace.comments?.length || 0
      }
    });

  } catch (error) {
    console.error('Error updating favorite place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite place',
      error: error.message
    });
  }
};

// Delete favorite place
exports.deleteFavoritePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the place and check ownership
    const place = await FavoritePlace.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Favorite place not found'
      });
    }

    if (place.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this place'
      });
    }

    await FavoritePlace.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Favorite place deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting favorite place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete favorite place',
      error: error.message
    });
  }
};

// Like/Unlike place
exports.toggleLikePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const place = await FavoritePlace.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Favorite place not found'
      });
    }

    // Check if user already liked the place
    const existingLikeIndex = place.likes.findIndex(
      like => like.user.toString() === userId
    );

    let isLiked;
    if (existingLikeIndex > -1) {
      // Unlike - remove the like
      place.likes.splice(existingLikeIndex, 1);
      isLiked = false;
    } else {
      // Like - add the like
      place.likes.push({ user: userId });
      isLiked = true;
    }

    await place.save();

    res.json({
      success: true,
      data: {
        isLiked,
        likesCount: place.likes.length
      }
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
};

// Add comment to place
exports.addCommentToPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const place = await FavoritePlace.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Favorite place not found'
      });
    }

    // Add the comment
    const newComment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    };

    place.comments.push(newComment);
    await place.save();

    // Get the populated comment
    const populatedPlace = await FavoritePlace.findById(id)
      .populate('comments.user', 'name avatar')
      .lean();

    const addedComment = populatedPlace.comments[populatedPlace.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: addedComment
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get user's favorite places
exports.getMyFavoritePlaces = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const places = await FavoritePlace.find({ user: userId })
      .populate('user', 'name avatar')
      .populate('likes.user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add computed fields
    const placesWithCounts = places.map(place => ({
      ...place,
      likesCount: place.likes?.length || 0,
      commentsCount: place.comments?.length || 0
    }));

    const totalPlaces = await FavoritePlace.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalPlaces / parseInt(limit));

    res.json({
      success: true,
      data: {
        places: placesWithCounts,
        currentPage: parseInt(page),
        totalPages,
        totalPlaces,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user favorite places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your favorite places',
      error: error.message
    });
  }
};