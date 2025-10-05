const RealIntegrationService = require('../services/realIntegrationService');
const Integration = require('../models/Integration');

class RealIntegrationController {
  
  /**
   * @route   GET /api/integrations
   * @desc    Get all integrations for user with filtering and pagination
   * @access  Private
   */
  async getUserIntegrations(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type, 
        status, 
        isEnabled,
        search 
      } = req.query;
      
      // Build query
      const query = { owner: req.user._id };
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (isEnabled !== undefined) query.isEnabled = isEnabled === 'true';
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'documentation.description': { $regex: search, $options: 'i' } }
        ];
      }
      
      // Execute query with pagination
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { updatedAt: -1 },
        populate: 'owner',
        select: '-configuration.apiKey -configuration.apiSecret -configuration.accessToken -configuration.refreshToken -configuration.clientSecret'
      };
      
      const result = await Integration.paginate(query, options);
      
      // Add summary for each integration
      const integrations = result.docs.map(integration => ({
        ...integration.toObject(),
        summary: integration.getSummary(),
        isHealthy: integration.isHealthy(),
        successRate: integration.successRate,
        monthlyUsagePercentage: integration.monthlyUsagePercentage
      }));
      
      res.json({
        success: true,
        message: 'Integrations retrieved successfully',
        data: {
          integrations,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalIntegrations: result.totalDocs,
            hasNext: result.hasNextPage,
            hasPrev: result.hasPrevPage
          }
        }
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Get user integrations failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve integrations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * @route   GET /api/integrations/:id
   * @desc    Get single integration details
   * @access  Private
   */
  async getIntegration(req, res) {
    try {
      const { id } = req.params;
      
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      }).select('-configuration.apiKey -configuration.apiSecret -configuration.accessToken -configuration.refreshToken -configuration.clientSecret');
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Add computed fields
      const integrationData = {
        ...integration.toObject(),
        summary: integration.getSummary(),
        isHealthy: integration.isHealthy(),
        successRate: integration.successRate,
        monthlyUsagePercentage: integration.monthlyUsagePercentage
      };
      
      res.json({
        success: true,
        message: 'Integration retrieved successfully',
        data: integrationData
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Get integration failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve integration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * @route   POST /api/integrations
   * @desc    Create new integration
   * @access  Private
   */
  async createIntegration(req, res) {
    try {
      const integrationData = req.body;
      
      // Validate required fields
      const { name, type } = integrationData;
      
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Name and type are required'
        });
      }
      
      // Create integration through service
      const result = await RealIntegrationService.createIntegration(req.user._id, integrationData);
      
      res.status(201).json({
        success: true,
        message: 'Integration created successfully',
        data: result.integration
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Create integration failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create integration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   PUT /api/integrations/:id/configure
   * @desc    Configure integration settings
   * @access  Private
   */
  async configureIntegration(req, res) {
    try {
      const { id } = req.params;
      const configuration = req.body;
      
      // Verify ownership
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      });
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Configure integration through service
      const result = await RealIntegrationService.configureIntegration(id, configuration);
      
      res.json({
        success: true,
        message: 'Integration configured successfully',
        data: result
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Configure integration failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to configure integration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   POST /api/integrations/:id/test
   * @desc    Test integration connection
   * @access  Private
   */
  async testIntegration(req, res) {
    try {
      const { id } = req.params;
      
      // Verify ownership
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      });
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Test connection through service
      const result = await RealIntegrationService.testConnection(id);
      
      res.json({
        success: true,
        message: 'Connection test completed',
        data: result
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Test integration failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to test integration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   POST /api/integrations/:id/sync
   * @desc    Manually trigger data synchronization
   * @access  Private
   */
  async syncIntegration(req, res) {
    try {
      const { id } = req.params;
      const { dataType, direction } = req.body;
      
      // Verify ownership
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      });
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Sync data through service
      const result = await RealIntegrationService.syncData(id, dataType, direction);
      
      res.json({
        success: true,
        message: 'Data synchronization completed',
        data: result
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Sync integration failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to sync integration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   POST /api/integrations/:id/send
   * @desc    Send data to external service
   * @access  Private
   */
  async sendData(req, res) {
    try {
      const { id } = req.params;
      const { data, endpoint } = req.body;
      
      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'Data is required'
        });
      }
      
      // Verify ownership
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      });
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Send data through service
      const result = await RealIntegrationService.sendData(id, data, endpoint);
      
      res.json({
        success: true,
        message: 'Data sent successfully',
        data: result
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Send data failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send data',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   GET /api/integrations/:id/receive
   * @desc    Receive data from external service
   * @access  Private
   */
  async receiveData(req, res) {
    try {
      const { id } = req.params;
      const { endpoint, ...params } = req.query;
      
      // Verify ownership
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      });
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Receive data through service
      const result = await RealIntegrationService.receiveData(id, endpoint, params);
      
      res.json({
        success: true,
        message: 'Data received successfully',
        data: result
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Receive data failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to receive data',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   POST /api/integrations/:id/webhook
   * @desc    Handle incoming webhook
   * @access  Public (webhook endpoint)
   */
  async handleWebhook(req, res) {
    try {
      const { id } = req.params;
      const { event } = req.query;
      const data = req.body;
      const headers = req.headers;
      
      if (!event) {
        return res.status(400).json({
          success: false,
          message: 'Event type is required'
        });
      }
      
      // Find integration (no ownership check for webhooks)
      const integration = await Integration.findById(id);
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Handle webhook through service
      const result = await RealIntegrationService.handleWebhook(id, event, data, headers);
      
      res.json({
        success: true,
        message: 'Webhook processed successfully',
        data: result
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Webhook handling failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to process webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   GET /api/integrations/:id/analytics
   * @desc    Get integration analytics
   * @access  Private
   */
  async getAnalytics(req, res) {
    try {
      const { id } = req.params;
      const { period = '30d' } = req.query;
      
      // Verify ownership
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      });
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Get analytics through service
      const result = await RealIntegrationService.getIntegrationAnalytics(id, period);
      
      res.json({
        success: true,
        message: 'Analytics retrieved successfully',
        data: result.analytics
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Get analytics failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   PUT /api/integrations/:id/toggle
   * @desc    Enable/disable integration
   * @access  Private
   */
  async toggleIntegration(req, res) {
    try {
      const { id } = req.params;
      const { isEnabled } = req.body;
      
      // Verify ownership
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      });
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Update status
      integration.isEnabled = isEnabled;
      if (!isEnabled) {
        integration.status = 'inactive';
      } else if (integration.status === 'inactive') {
        integration.status = 'active';
      }
      
      await integration.save();
      
      await integration.logActivity(
        'info',
        `Integration ${isEnabled ? 'enabled' : 'disabled'}`,
        { isEnabled }
      );
      
      res.json({
        success: true,
        message: `Integration ${isEnabled ? 'enabled' : 'disabled'} successfully`,
        data: integration.getSummary()
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Toggle integration failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle integration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   DELETE /api/integrations/:id
   * @desc    Delete integration
   * @access  Private
   */
  async deleteIntegration(req, res) {
    try {
      const { id } = req.params;
      
      // Verify ownership
      const integration = await Integration.findOne({
        _id: id,
        owner: req.user._id
      });
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          message: 'Integration not found'
        });
      }
      
      // Delete integration
      await Integration.findByIdAndDelete(id);
      
      console.log(`🗑️ INTEGRATION: Integration "${integration.name}" deleted by user ${req.user._id}`);
      
      res.json({
        success: true,
        message: 'Integration deleted successfully'
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Delete integration failed:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete integration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
      });
    }
  }

  /**
   * @route   GET /api/integrations/types
   * @desc    Get available integration types and their templates
   * @access  Private
   */
  async getIntegrationTypes(req, res) {
    try {
      const integrationTypes = {
        social_media: {
          name: 'Social Media',
          description: 'Connect with social media platforms',
          examples: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn'],
          requiredFields: ['apiKey', 'apiSecret'],
          optionalFields: ['accessToken', 'refreshToken'],
          features: ['Post sharing', 'User authentication', 'Analytics'],
          documentation: 'https://docs.example.com/social-media'
        },
        
        payment_gateway: {
          name: 'Payment Gateway',
          description: 'Process payments and transactions',
          examples: ['Stripe', 'PayPal', 'Razorpay', 'Square'],
          requiredFields: ['apiKey', 'apiSecret'],
          optionalFields: ['webhookSecret'],
          features: ['Payment processing', 'Subscription management', 'Refunds'],
          documentation: 'https://docs.example.com/payments'
        },
        
        booking_platform: {
          name: 'Booking Platform',
          description: 'Integrate with travel booking services',
          examples: ['Booking.com', 'Expedia', 'Airbnb', 'Agoda'],
          requiredFields: ['apiKey'],
          optionalFields: ['partnerId', 'affiliateId'],
          features: ['Hotel search', 'Price comparison', 'Booking management'],
          documentation: 'https://docs.example.com/booking'
        },
        
        analytics: {
          name: 'Analytics',
          description: 'Track and analyze user behavior',
          examples: ['Google Analytics', 'Mixpanel', 'Adobe Analytics'],
          requiredFields: ['trackingId'],
          optionalFields: ['apiKey', 'customDimensions'],
          features: ['Event tracking', 'User analytics', 'Conversion tracking'],
          documentation: 'https://docs.example.com/analytics'
        },
        
        weather_api: {
          name: 'Weather API',
          description: 'Get weather information for destinations',
          examples: ['OpenWeatherMap', 'AccuWeather', 'Weather.com'],
          requiredFields: ['apiKey'],
          optionalFields: ['units', 'language'],
          features: ['Current weather', 'Forecasts', 'Weather alerts'],
          documentation: 'https://docs.example.com/weather'
        },
        
        map_service: {
          name: 'Map Service',
          description: 'Maps, geocoding, and location services',
          examples: ['Google Maps', 'Mapbox', 'Here Maps'],
          requiredFields: ['apiKey'],
          optionalFields: ['region', 'language'],
          features: ['Geocoding', 'Routing', 'Places API'],
          documentation: 'https://docs.example.com/maps'
        },
        
        email_marketing: {
          name: 'Email Marketing',
          description: 'Send marketing emails and newsletters',
          examples: ['Mailchimp', 'SendGrid', 'ConvertKit'],
          requiredFields: ['apiKey'],
          optionalFields: ['listId', 'templateId'],
          features: ['Email campaigns', 'List management', 'Analytics'],
          documentation: 'https://docs.example.com/email'
        },
        
        cloud_storage: {
          name: 'Cloud Storage',
          description: 'Store and manage files in the cloud',
          examples: ['AWS S3', 'Google Cloud Storage', 'Azure Blob'],
          requiredFields: ['accessKeyId', 'secretAccessKey'],
          optionalFields: ['region', 'bucket'],
          features: ['File upload', 'File management', 'CDN'],
          documentation: 'https://docs.example.com/storage'
        }
      };
      
      res.json({
        success: true,
        message: 'Integration types retrieved successfully',
        data: integrationTypes
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Get types failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve integration types',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * @route   GET /api/integrations/dashboard
   * @desc    Get integration dashboard overview
   * @access  Private
   */
  async getDashboardOverview(req, res) {
    try {
      const userId = req.user._id;
      
      // Get user's integrations summary
      const integrations = await Integration.find({ owner: userId });
      
      // Calculate statistics
      const stats = {
        total: integrations.length,
        active: integrations.filter(i => i.isEnabled && i.status === 'active').length,
        inactive: integrations.filter(i => !i.isEnabled || i.status === 'inactive').length,
        errors: integrations.filter(i => i.status === 'error').length,
        healthy: integrations.filter(i => i.isHealthy()).length
      };
      
      // Get usage statistics
      const totalUsage = integrations.reduce((sum, i) => sum + i.usage.currentMonthUsage, 0);
      const totalLimit = integrations.reduce((sum, i) => sum + i.usage.monthlyLimit, 0);
      
      // Get recent activity
      const recentActivity = integrations
        .flatMap(i => i.recentLogs.map(log => ({
          ...log.toObject(),
          integrationName: i.name,
          integrationId: i._id
        })))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
      
      // Get integration types breakdown
      const typeBreakdown = integrations.reduce((acc, integration) => {
        acc[integration.type] = (acc[integration.type] || 0) + 1;
        return acc;
      }, {});
      
      const overview = {
        stats,
        usage: {
          current: totalUsage,
          limit: totalLimit,
          percentage: totalLimit > 0 ? (totalUsage / totalLimit * 100).toFixed(2) : 0
        },
        recentActivity,
        typeBreakdown,
        recommendations: this.generateRecommendations(integrations)
      };
      
      res.json({
        success: true,
        message: 'Dashboard overview retrieved successfully',
        data: overview
      });
      
    } catch (error) {
      console.error('❌ INTEGRATION: Get dashboard failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard overview',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Generate recommendations for user
   */
  generateRecommendations(integrations) {
    const recommendations = [];
    
    // Check for missing essential integrations
    const hasAnalytics = integrations.some(i => i.type === 'analytics');
    if (!hasAnalytics) {
      recommendations.push({
        type: 'missing_integration',
        title: 'Add Analytics Integration',
        description: 'Track your blog performance with analytics integration',
        priority: 'high'
      });
    }
    
    const hasPayment = integrations.some(i => i.type === 'payment_gateway');
    if (!hasPayment) {
      recommendations.push({
        type: 'missing_integration',
        title: 'Add Payment Gateway',
        description: 'Monetize your blog with payment processing',
        priority: 'medium'
      });
    }
    
    // Check for unhealthy integrations
    const unhealthyCount = integrations.filter(i => !i.isHealthy()).length;
    if (unhealthyCount > 0) {
      recommendations.push({
        type: 'health_issue',
        title: 'Fix Integration Issues',
        description: `${unhealthyCount} integration(s) need attention`,
        priority: 'high'
      });
    }
    
    // Check for high usage
    const highUsageIntegrations = integrations.filter(i => 
      parseFloat(i.monthlyUsagePercentage) > 80
    );
    if (highUsageIntegrations.length > 0) {
      recommendations.push({
        type: 'usage_warning',
        title: 'Monitor Usage Limits',
        description: `${highUsageIntegrations.length} integration(s) approaching limits`,
        priority: 'medium'
      });
    }
    
    return recommendations;
  }
}

module.exports = new RealIntegrationController();