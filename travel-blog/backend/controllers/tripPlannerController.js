const aiTripPlannerService = require('../services/aiTripPlannerService');
const TripPlan = require('../models/TripPlan');
const { validationResult } = require('express-validator');

class TripPlannerController {
  // Generate AI trip plan
  async generateTripPlan(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        destination,
        startDate,
        endDate,
        budget,
        travelers,
        travelStyle,
        preferences
      } = req.body;

      // Calculate duration
      const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

      const tripDetails = {
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration,
        budget,
        travelers,
        travelStyle,
        preferences
      };

      const tripPlan = await aiTripPlannerService.generateTripPlan(req.user.id, tripDetails);

      res.json({
        success: true,
        message: 'Trip plan generated successfully',
        data: tripPlan
      });

    } catch (error) {
      console.error('Generate trip plan error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate trip plan'
      });
    }
  }

  // Get user's trip plans
  async getUserTripPlans(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (page - 1) * limit;

      const query = { user: req.user.id };
      if (status) {
        query.status = status;
      }

      const tripPlans = await TripPlan.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name avatar');

      const total = await TripPlan.countDocuments(query);

      res.json({
        success: true,
        data: {
          tripPlans,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / limit),
            count: tripPlans.length,
            totalItems: total
          }
        }
      });

    } catch (error) {
      console.error('Get trip plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trip plans'
      });
    }
  }

  // Get specific trip plan
  async getTripPlan(req, res) {
    try {
      const { id } = req.params;

      const tripPlan = await TripPlan.findById(id)
        .populate('user', 'name avatar')
        .populate('sharing.collaborators', 'name avatar');

      if (!tripPlan) {
        return res.status(404).json({
          success: false,
          message: 'Trip plan not found'
        });
      }

      // Check if user has access
      const hasAccess = tripPlan.user._id.toString() === req.user.id ||
                       tripPlan.sharing.collaborators.some(c => c._id.toString() === req.user.id) ||
                       tripPlan.sharing.isPublic;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: tripPlan
      });

    } catch (error) {
      console.error('Get trip plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trip plan'
      });
    }
  }

  // Update trip plan
  async updateTripPlan(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const tripPlan = await TripPlan.findById(id);

      if (!tripPlan) {
        return res.status(404).json({
          success: false,
          message: 'Trip plan not found'
        });
      }

      // Check ownership
      if (tripPlan.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Update allowed fields
      const allowedUpdates = [
        'title', 'status', 'sharing', 'itinerary', 
        'preferences', 'feedback'
      ];

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          tripPlan[key] = updates[key];
        }
      });

      await tripPlan.save();

      res.json({
        success: true,
        message: 'Trip plan updated successfully',
        data: tripPlan
      });

    } catch (error) {
      console.error('Update trip plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update trip plan'
      });
    }
  }

  // Delete trip plan
  async deleteTripPlan(req, res) {
    try {
      const { id } = req.params;

      const tripPlan = await TripPlan.findById(id);

      if (!tripPlan) {
        return res.status(404).json({
          success: false,
          message: 'Trip plan not found'
        });
      }

      // Check ownership
      if (tripPlan.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await TripPlan.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Trip plan deleted successfully'
      });

    } catch (error) {
      console.error('Delete trip plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete trip plan'
      });
    }
  }

  // Share trip plan
  async shareTripPlan(req, res) {
    try {
      const { id } = req.params;
      const { isPublic, collaborators = [] } = req.body;

      const tripPlan = await TripPlan.findById(id);

      if (!tripPlan) {
        return res.status(404).json({
          success: false,
          message: 'Trip plan not found'
        });
      }

      // Check ownership
      if (tripPlan.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      tripPlan.sharing.isPublic = isPublic;
      tripPlan.sharing.collaborators = collaborators;

      if (isPublic && !tripPlan.sharing.shareCode) {
        tripPlan.sharing.shareCode = Math.random().toString(36).substring(2, 15);
      }

      await tripPlan.save();

      res.json({
        success: true,
        message: 'Trip plan sharing updated',
        data: {
          shareCode: tripPlan.sharing.shareCode,
          isPublic: tripPlan.sharing.isPublic
        }
      });

    } catch (error) {
      console.error('Share trip plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share trip plan'
      });
    }
  }

  // Get trip plan by share code
  async getTripPlanByShareCode(req, res) {
    try {
      const { shareCode } = req.params;

      const tripPlan = await TripPlan.findOne({ 'sharing.shareCode': shareCode })
        .populate('user', 'name avatar');

      if (!tripPlan || !tripPlan.sharing.isPublic) {
        return res.status(404).json({
          success: false,
          message: 'Trip plan not found or not public'
        });
      }

      res.json({
        success: true,
        data: tripPlan
      });

    } catch (error) {
      console.error('Get shared trip plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get shared trip plan'
      });
    }
  }

  // Optimize trip plan
  async optimizeTripPlan(req, res) {
    try {
      const { id } = req.params;
      const { criteria = [] } = req.body; // ['budget', 'time', 'interests']

      const tripPlan = await TripPlan.findById(id);

      if (!tripPlan) {
        return res.status(404).json({
          success: false,
          message: 'Trip plan not found'
        });
      }

      // Check ownership
      if (tripPlan.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const optimizedPlan = await aiTripPlannerService.optimizeTripPlan(id, criteria);

      res.json({
        success: true,
        message: 'Trip plan optimized successfully',
        data: optimizedPlan
      });

    } catch (error) {
      console.error('Optimize trip plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to optimize trip plan'
      });
    }
  }

  // Get personalized recommendations
  async getRecommendations(req, res) {
    try {
      const { limit = 10 } = req.query;

      const recommendations = await aiTripPlannerService.getPersonalizedRecommendations(
        req.user.id, 
        parseInt(limit)
      );

      res.json({
        success: true,
        data: recommendations
      });

    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  }

  // Clone trip plan
  async cloneTripPlan(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const originalPlan = await TripPlan.findById(id);

      if (!originalPlan) {
        return res.status(404).json({
          success: false,
          message: 'Trip plan not found'
        });
      }

      // Check if plan is accessible
      const hasAccess = originalPlan.user.toString() === req.user.id ||
                       originalPlan.sharing.isPublic ||
                       originalPlan.sharing.collaborators.includes(req.user.id);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Create clone
      const clonedPlan = new TripPlan({
        ...originalPlan.toObject(),
        _id: undefined,
        user: req.user.id,
        title: title || `${originalPlan.title} (Copy)`,
        status: 'draft',
        sharing: {
          isPublic: false,
          shareCode: null,
          collaborators: []
        },
        feedback: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await clonedPlan.save();

      res.json({
        success: true,
        message: 'Trip plan cloned successfully',
        data: clonedPlan
      });

    } catch (error) {
      console.error('Clone trip plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clone trip plan'
      });
    }
  }
}

module.exports = new TripPlannerController();