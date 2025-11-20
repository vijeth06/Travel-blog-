const Review = require('../models/Review');
const { validationResult } = require('express-validator');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      targetType,
      targetId,
      title,
      content,
      overallRating,
      aspectRatings,
      tripType,
      visitDate,
      stayDuration,
      wouldRecommend,
      recommendedFor,
      pros,
      cons,
      tags,
      traveledWith,
      reasonForVisit,
      bestTimeToVisit
    } = req.body;

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      author: req.user._id,
      targetType,
      targetId
    });

    if (existingReview) {
      return res.status(409).json({
        message: 'You have already reviewed this item. You can edit your existing review.'
      });
    }

    const review = new Review({
      author: req.user._id,
      targetType,
      targetId,
      title,
      content,
      overallRating,
      aspectRatings: aspectRatings || {},
      tripType,
      visitDate,
      stayDuration,
      wouldRecommend,
      recommendedFor: recommendedFor || [],
      pros: pros || [],
      cons: cons || [],
      tags: tags || [],
      traveledWith,
      reasonForVisit,
      bestTimeToVisit: bestTimeToVisit || []
    });

    await review.save();
    await review.populate('author', 'name avatar');

    // Update target item's rating (you'd need to implement this for each target type)
    // await updateTargetRating(targetType, targetId);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Get reviews for a specific item
exports.getReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'newest',
      rating,
      verified,
      tripType,
      traveledWith
    } = req.query;

    // Build filter
    let filter = {
      targetType,
      targetId,
      status: 'published'
    };

    if (rating) {
      filter.overallRating = parseInt(rating);
    }

    if (verified === 'true') {
      filter.isVerified = true;
    }

    if (tripType) {
      filter.tripType = tripType;
    }

    if (traveledWith) {
      filter.traveledWith = traveledWith;
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'highest_rating':
        sort.overallRating = -1;
        break;
      case 'lowest_rating':
        sort.overallRating = 1;
        break;
      case 'most_helpful':
        sort = { 'helpful': -1, createdAt: -1 };
        break;
      default:
        sort.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total, stats] = await Promise.all([
      Review.find(filter)
        .populate('author', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter),
      Review.getDetailedStats(targetType, targetId)
    ]);

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNext: skip + reviews.length < total,
        hasPrev: parseInt(page) > 1
      },
      stats
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      message: 'Failed to get reviews',
      error: error.message
    });
  }
};

// Get review statistics
exports.getReviewStats = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const [basicStats, detailedStats] = await Promise.all([
      Review.getAverageRating(targetType, targetId),
      Review.getDetailedStats(targetType, targetId)
    ]);

    res.json({
      ...basicStats,
      ...detailedStats
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      message: 'Failed to get review statistics',
      error: error.message
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const updateFields = [
      'title', 'content', 'overallRating', 'aspectRatings', 'wouldRecommend',
      'pros', 'cons', 'tags', 'recommendedFor', 'bestTimeToVisit'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    await review.save();
    await review.populate('author', 'name avatar');

    res.json({
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.markHelpful(req.user.id);

    res.json({
      message: 'Review marked as helpful',
      helpfulCount: review.helpful.length,
      notHelpfulCount: review.notHelpful.length
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

// Mark review as not helpful
exports.markNotHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.markNotHelpful(req.user.id);

    res.json({
      message: 'Review marked as not helpful',
      helpfulCount: review.helpful.length,
      notHelpfulCount: review.notHelpful.length
    });

  } catch (error) {
    console.error('Mark not helpful error:', error);
    res.status(500).json({
      message: 'Failed to mark review as not helpful',
      error: error.message
    });
  }
};

// Add response to review
exports.addResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Response content is required' });
    }

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is business owner (this would need to be implemented based on your business logic)
    const isBusinessOwner = false; // Implement business owner check

    await review.addResponse(req.user.id, content, isBusinessOwner);
    await review.populate('responses.author', 'name avatar');

    res.json({
      message: 'Response added successfully',
      responses: review.responses
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      message: 'Failed to add response',
      error: error.message
    });
  }
};

// Flag a review
exports.flagReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Flag reason is required' });
    }

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.flagReview(req.user.id, reason, description);

    res.json({
      message: 'Review flagged successfully',
      flagCount: review.flags.length
    });

  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({
      message: 'Failed to flag review',
      error: error.message
    });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ 
        author: userId,
        status: 'published'
      })
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ 
        author: userId,
        status: 'published'
      })
    ]);

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNext: skip + reviews.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      message: 'Failed to get user reviews',
      error: error.message
    });
  }
};

// Get trending/popular reviews
exports.getTrendingReviews = async (req, res) => {
  try {
    const { limit = 10, timeframe = '7d' } = req.query;

    // Calculate date based on timeframe
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

    const reviews = await Review.aggregate([
      {
        $match: {
          status: 'published',
          createdAt: { $gte: startDate }
        }
      },
      {
        $addFields: {
          helpfulScore: {
            $divide: [
              { $size: '$helpful' },
              { $add: [{ $size: '$helpful' }, { $size: '$notHelpful' }, 1] }
            ]
          },
          engagementScore: {
            $add: [
              { $size: '$helpful' },
              { $size: '$responses' },
              '$views'
            ]
          }
        }
      },
      {
        $sort: {
          engagementScore: -1,
          helpfulScore: -1,
          overallRating: -1
        }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          title: 1,
          content: 1,
          overallRating: 1,
          targetType: 1,
          targetId: 1,
          wouldRecommend: 1,
          createdAt: 1,
          helpful: 1,
          notHelpful: 1,
          responses: 1,
          views: 1,
          helpfulScore: 1,
          engagementScore: 1,
          'author.name': 1,
          'author.avatar': 1
        }
      }
    ]);

    res.json({ reviews });

  } catch (error) {
    console.error('Get trending reviews error:', error);
    res.status(500).json({
      message: 'Failed to get trending reviews',
      error: error.message
    });
  }
};

// Search reviews
exports.searchReviews = async (req, res) => {
  try {
    const { 
      q, 
      targetType, 
      rating, 
      verified,
      page = 1, 
      limit = 10 
    } = req.query;

    let filter = { status: 'published' };

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Filter by target type
    if (targetType) {
      filter.targetType = targetType;
    }

    // Filter by rating
    if (rating) {
      filter.overallRating = { $gte: parseInt(rating) };
    }

    // Filter by verified status
    if (verified === 'true') {
      filter.isVerified = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = Review.find(filter)
      .populate('author', 'name avatar')
      .skip(skip)
      .limit(parseInt(limit));

    // Sort by relevance if text search, otherwise by date
    if (q) {
      query = query.sort({ score: { $meta: 'textScore' } });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const [reviews, total] = await Promise.all([
      query,
      Review.countDocuments(filter)
    ]);

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNext: skip + reviews.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Search reviews error:', error);
    res.status(500).json({
      message: 'Failed to search reviews',
      error: error.message
    });
  }
};