const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Package = require('../models/Package');
const FavoritePlace = require('../models/FavoritePlace');

class RecommendationService {
  constructor() {
    this.weights = {
      similarity: 0.3,
      popularity: 0.2,
      recency: 0.15,
      location: 0.15,
      interests: 0.2
    };
  }

  async generateRecommendations(userId) {
    try {
      const user = await User.findById(userId)
        .populate('following')
        .populate('travelPreferences');

      if (!user) {
        throw new Error('User not found');
      }

      // Clear old recommendations
      await Recommendation.deleteMany({ 
        user: userId,
        expiresAt: { $lte: new Date() }
      });

      const recommendations = [];

      // Generate different types of recommendations
      const blogRecommendations = await this.generateBlogRecommendations(user);
      const packageRecommendations = await this.generatePackageRecommendations(user);
      const userRecommendations = await this.generateUserRecommendations(user);
      const destinationRecommendations = await this.generateDestinationRecommendations(user);

      recommendations.push(...blogRecommendations);
      recommendations.push(...packageRecommendations);
      recommendations.push(...userRecommendations);
      recommendations.push(...destinationRecommendations);

      // Save all recommendations
      await Recommendation.insertMany(recommendations);

      return recommendations;

    } catch (error) {
      console.error('Recommendation generation error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  async generateBlogRecommendations(user) {
    const recommendations = [];
    
    try {
      // Get user's favorite places and interests
      const favoriteCountries = user.travelPreferences?.preferredDestinations || [];
      const userInterests = this.extractUserInterests(user);

      // Find blogs based on location preference
      const locationBasedBlogs = await Blog.find({
        'geotag.country': { $in: favoriteCountries },
        status: 'published',
        author: { $ne: user._id }
      }).limit(10);

      // Find trending blogs
      const trendingBlogs = await Blog.find({
        status: 'published',
        author: { $ne: user._id },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ views: -1, likesCount: -1 }).limit(10);

      // Find blogs from followed users
      const followingBlogs = await Blog.find({
        author: { $in: user.following },
        status: 'published'
      }).sort({ createdAt: -1 }).limit(5);

      // Process location-based recommendations
      for (const blog of locationBasedBlogs) {
        const score = this.calculateBlogScore(blog, user, 'location_based');
        recommendations.push({
          user: user._id,
          type: 'blog',
          targetId: blog._id,
          targetModel: 'Blog',
          reason: 'location_based',
          score,
          metadata: {
            confidence: 0.75,
            factors: ['location_match', 'interests'],
            generatedAt: new Date()
          },
          contextualInfo: {
            personalizedReason: `Because you're interested in ${blog.geotag?.country || 'this destination'}`
          }
        });
      }

      // Process trending recommendations
      for (const blog of trendingBlogs) {
        const score = this.calculateBlogScore(blog, user, 'trending');
        recommendations.push({
          user: user._id,
          type: 'blog',
          targetId: blog._id,
          targetModel: 'Blog',
          reason: 'trending',
          score,
          metadata: {
            confidence: 0.65,
            factors: ['popularity', 'recency'],
            generatedAt: new Date()
          },
          contextualInfo: {
            trending: true,
            personalizedReason: 'This is trending among travel enthusiasts'
          }
        });
      }

      // Process following recommendations
      for (const blog of followingBlogs) {
        recommendations.push({
          user: user._id,
          type: 'blog',
          targetId: blog._id,
          targetModel: 'Blog',
          reason: 'friends_activity',
          score: 0.85,
          metadata: {
            confidence: 0.9,
            factors: ['social_connection'],
            generatedAt: new Date()
          },
          contextualInfo: {
            personalizedReason: 'From someone you follow'
          }
        });
      }

    } catch (error) {
      console.error('Blog recommendation error:', error);
    }

    return recommendations;
  }

  async generatePackageRecommendations(user) {
    const recommendations = [];
    
    try {
      const favoriteCountries = user.travelPreferences?.preferredDestinations || [];
      const budgetRange = user.travelPreferences?.budgetRange || 'Mid-range';
      
      // Budget mapping
      const budgetRanges = {
        'Budget': { min: 0, max: 1000 },
        'Mid-range': { min: 1000, max: 3000 },
        'Luxury': { min: 3000, max: 10000 }
      };

      const userBudget = budgetRanges[budgetRange];

      // Find packages in user's budget and preferred locations
      const budgetPackages = await Package.find({
        price: { $gte: userBudget.min, $lte: userBudget.max },
        'location.country': { $in: favoriteCountries }
      }).limit(10);

      // Find popular packages
      const popularPackages = await Package.find({
        createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      }).sort({ bookingsCount: -1 }).limit(10);

      // Process budget-based recommendations
      for (const pkg of budgetPackages) {
        const score = this.calculatePackageScore(pkg, user, 'price_range');
        recommendations.push({
          user: user._id,
          type: 'package',
          targetId: pkg._id,
          targetModel: 'Package',
          reason: 'price_range',
          score,
          metadata: {
            confidence: 0.8,
            factors: ['budget_match', 'location_preference'],
            generatedAt: new Date()
          },
          contextualInfo: {
            personalizedReason: `Perfect for your ${budgetRange.toLowerCase()} budget`
          }
        });
      }

      // Process popular recommendations
      for (const pkg of popularPackages) {
        const score = this.calculatePackageScore(pkg, user, 'popular_among_similar_users');
        recommendations.push({
          user: user._id,
          type: 'package',
          targetId: pkg._id,
          targetModel: 'Package',
          reason: 'popular_among_similar_users',
          score,
          metadata: {
            confidence: 0.7,
            factors: ['popularity'],
            generatedAt: new Date()
          },
          contextualInfo: {
            personalizedReason: 'Popular among travelers like you'
          }
        });
      }

    } catch (error) {
      console.error('Package recommendation error:', error);
    }

    return recommendations;
  }

  async generateUserRecommendations(user) {
    const recommendations = [];
    
    try {
      const userInterests = user.travelPreferences?.preferredDestinations || [];
      
      // Find users with similar interests
      const similarUsers = await User.find({
        'travelPreferences.preferredDestinations': { $in: userInterests },
        _id: { $ne: user._id, $nin: user.following },
        role: { $in: ['author', 'visitor'] }
      }).limit(10);

      // Find active authors
      const activeAuthors = await User.find({
        role: 'author',
        _id: { $ne: user._id, $nin: user.following }
      }).limit(5);

      // Process similar user recommendations
      for (const similarUser of similarUsers) {
        const score = this.calculateUserSimilarity(user, similarUser);
        recommendations.push({
          user: user._id,
          type: 'user',
          targetId: similarUser._id,
          targetModel: 'User',
          reason: 'similar_interests',
          score,
          metadata: {
            confidence: 0.75,
            factors: ['interest_overlap'],
            generatedAt: new Date()
          },
          contextualInfo: {
            personalizedReason: 'Shares similar travel interests'
          }
        });
      }

      // Process active author recommendations
      for (const author of activeAuthors) {
        recommendations.push({
          user: user._id,
          type: 'user',
          targetId: author._id,
          targetModel: 'User',
          reason: 'trending',
          score: 0.7,
          metadata: {
            confidence: 0.6,
            factors: ['activity'],
            generatedAt: new Date()
          },
          contextualInfo: {
            personalizedReason: 'Active travel blogger'
          }
        });
      }

    } catch (error) {
      console.error('User recommendation error:', error);
    }

    return recommendations;
  }

  async generateDestinationRecommendations(user) {
    const recommendations = [];
    
    try {
      // This would integrate with a destinations/countries collection
      // For now, we'll use favorite places as proxy
      const userFavorites = await FavoritePlace.find({ user: user._id });
      const favoriteCountries = userFavorites.map(fav => fav.country);

      // Find trending destinations
      const trendingDestinations = await Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$geotag.country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Process trending destination recommendations
      for (const dest of trendingDestinations) {
        if (dest._id && !favoriteCountries.includes(dest._id)) {
          recommendations.push({
            user: user._id,
            type: 'destination',
            targetId: new require('mongoose').Types.ObjectId(), // Placeholder
            targetModel: 'Country',
            reason: 'trending',
            score: 0.6,
            metadata: {
              confidence: 0.5,
              factors: ['trending'],
              generatedAt: new Date()
            },
            contextualInfo: {
              personalizedReason: `${dest._id} is trending with ${dest.count} recent posts`
            }
          });
        }
      }

    } catch (error) {
      console.error('Destination recommendation error:', error);
    }

    return recommendations;
  }

  calculateBlogScore(blog, user, reason) {
    let score = 0.5; // Base score

    // Factor in views and likes (popularity)
    const popularityScore = Math.min((blog.views || 0) / 1000 + (blog.likesCount || 0) / 100, 1);
    score += popularityScore * this.weights.popularity;

    // Factor in recency
    const daysSincePublished = (Date.now() - blog.createdAt) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(1 - daysSincePublished / 30, 0);
    score += recencyScore * this.weights.recency;

    // Factor in location match
    const userCountries = user.travelPreferences?.preferredDestinations || [];
    if (userCountries.includes(blog.geotag?.country)) {
      score += this.weights.location;
    }

    return Math.min(score, 1); // Cap at 1.0
  }

  calculatePackageScore(pkg, user, reason) {
    let score = 0.5; // Base score

    // Factor in user budget preference
    const budgetRanges = {
      'Budget': { min: 0, max: 1000 },
      'Mid-range': { min: 1000, max: 3000 },
      'Luxury': { min: 3000, max: 10000 }
    };

    const userBudget = budgetRanges[user.travelPreferences?.budgetRange || 'Mid-range'];
    if (pkg.price >= userBudget.min && pkg.price <= userBudget.max) {
      score += 0.3;
    }

    // Factor in location preference
    const userCountries = user.travelPreferences?.preferredDestinations || [];
    if (userCountries.includes(pkg.location?.country)) {
      score += this.weights.location;
    }

    return Math.min(score, 1);
  }

  calculateUserSimilarity(user1, user2) {
    const interests1 = user1.travelPreferences?.preferredDestinations || [];
    const interests2 = user2.travelPreferences?.preferredDestinations || [];
    
    // Calculate Jaccard similarity
    const intersection = interests1.filter(x => interests2.includes(x));
    const union = [...new Set([...interests1, ...interests2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  extractUserInterests(user) {
    const interests = [];
    
    if (user.travelPreferences?.preferredDestinations) {
      interests.push(...user.travelPreferences.preferredDestinations);
    }
    
    if (user.travelPreferences?.travelStyle) {
      interests.push(user.travelPreferences.travelStyle);
    }

    return interests;
  }

  async getUserRecommendations(userId, type = null, limit = 20) {
    try {
      const query = { user: userId };
      if (type) {
        query.type = type;
      }

      const recommendations = await Recommendation.find(query)
        .populate('targetId')
        .sort({ score: -1, createdAt: -1 })
        .limit(limit);

      return recommendations;

    } catch (error) {
      console.error('Get user recommendations error:', error);
      throw new Error('Failed to get user recommendations');
    }
  }

  async markRecommendationInteraction(recommendationId, interactionType) {
    try {
      const update = {
        [`userInteraction.${interactionType}`]: true,
        [`userInteraction.${interactionType}At`]: new Date()
      };

      // Update interaction score based on type
      const scoreIncrease = {
        viewed: 0.1,
        clicked: 0.3,
        liked: 0.5,
        dismissed: -0.2
      };

      update['$inc'] = { 'userInteraction.interactionScore': scoreIncrease[interactionType] || 0 };

      await Recommendation.findByIdAndUpdate(recommendationId, update);

    } catch (error) {
      console.error('Mark interaction error:', error);
      throw new Error('Failed to mark interaction');
    }
  }
}

module.exports = new RecommendationService();