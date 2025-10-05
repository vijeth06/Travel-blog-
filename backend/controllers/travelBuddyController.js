const travelBuddyService = require('../services/travelBuddyService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const travelBuddyController = {
  // Create or update travel buddy profile
  async createProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = req.body;

      const profile = await travelBuddyService.createBuddyProfile(userId, profileData);

      successResponse(res, profile, 'Travel buddy profile created successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's travel buddy profile
  async getProfile(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      
      const profile = await travelBuddyService.getBuddyProfile(userId);
      
      if (!profile) {
        return errorResponse(res, 'Profile not found', 404);
      }

      successResponse(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Find travel buddies
  async findBuddies(req, res) {
    try {
      const userId = req.user.id;
      const searchCriteria = req.body;

      const buddies = await travelBuddyService.findTravelBuddies(userId, searchCriteria);

      successResponse(res, buddies, 'Travel buddies found successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Send buddy request
  async sendRequest(req, res) {
    try {
      const requesterId = req.user.id;
      const { recipientId, message, travelPlanId } = req.body;

      const result = await travelBuddyService.sendBuddyRequest(
        requesterId, 
        recipientId, 
        message, 
        travelPlanId
      );

      successResponse(res, result, 'Buddy request sent successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Add review for travel buddy
  async addReview(req, res) {
    try {
      const reviewerId = req.user.id;
      const { revieweeId } = req.params;
      const reviewData = req.body;

      const result = await travelBuddyService.addReview(reviewerId, revieweeId, reviewData);

      successResponse(res, result, 'Review added successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get nearby travel buddies
  async getNearbyBuddies(req, res) {
    try {
      const userId = req.user.id;
      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        return errorResponse(res, 'Coordinates are required', 400);
      }

      const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
      const searchRadius = radius ? parseInt(radius) : 50;

      const buddies = await travelBuddyService.getNearbyBuddies(
        userId, 
        coordinates, 
        searchRadius
      );

      successResponse(res, buddies, 'Nearby buddies found successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get buddy recommendations
  async getRecommendations(req, res) {
    try {
      const userId = req.user.id;

      const recommendations = await travelBuddyService.getBuddyRecommendations(userId);

      successResponse(res, recommendations, 'Recommendations retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Verify buddy profile
  async verifyProfile(req, res) {
    try {
      const userId = req.user.id;
      const { verificationType } = req.body;

      const profile = await travelBuddyService.verifyBuddy(userId, verificationType);

      successResponse(res, profile, 'Profile verification updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update profile preferences
  async updatePreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = req.body;

      const profile = await travelBuddyService.updatePreferences(userId, preferences);

      successResponse(res, profile, 'Preferences updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get buddy statistics
  async getStats(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      const stats = await travelBuddyService.getBuddyStats(userId);

      successResponse(res, stats, 'Statistics retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Block/unblock a travel buddy
  async toggleBlock(req, res) {
    try {
      const userId = req.user.id;
      const { buddyId } = req.params;
      const { action } = req.body; // 'block' or 'unblock'

      const result = await travelBuddyService.toggleBlock(userId, buddyId, action);

      successResponse(res, result, `Buddy ${action}ed successfully`);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get travel buddy requests (sent and received)
  async getRequests(req, res) {
    try {
      const userId = req.user.id;
      const { type } = req.query; // 'sent', 'received', or 'all'

      const requests = await travelBuddyService.getBuddyRequests(userId, type);

      successResponse(res, requests, 'Buddy requests retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Respond to buddy request
  async respondToRequest(req, res) {
    try {
      const userId = req.user.id;
      const { requestId } = req.params;
      const { action, message } = req.body; // 'accept' or 'decline'

      const result = await travelBuddyService.respondToBuddyRequest(
        userId, 
        requestId, 
        action, 
        message
      );

      successResponse(res, result, `Request ${action}ed successfully`);
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get travel buddy connections
  async getConnections(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      const connections = await travelBuddyService.getBuddyConnections(userId);

      successResponse(res, connections, 'Connections retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update travel plans
  async updateTravelPlans(req, res) {
    try {
      const userId = req.user.id;
      const travelPlans = req.body.travelPlans;

      const profile = await travelBuddyService.updateTravelPlans(userId, travelPlans);

      successResponse(res, profile, 'Travel plans updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Search buddies with advanced filters
  async advancedSearch(req, res) {
    try {
      const userId = req.user.id;
      const filters = req.body;

      const results = await travelBuddyService.advancedBuddySearch(userId, filters);

      successResponse(res, results, 'Advanced search completed successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
};

module.exports = travelBuddyController;