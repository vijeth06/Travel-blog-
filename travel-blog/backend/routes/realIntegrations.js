const express = require('express');
const router = express.Router();
const RealIntegrationControllerClass = require('../controllers/realIntegrationController');
const RealIntegrationController = new RealIntegrationControllerClass();
const { protect: auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for integration operations
const integrationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 integration requests per windowMs
  message: {
    success: false,
    message: 'Too many integration requests, please try again later'
  }
});

// Rate limiting for webhook endpoints (more permissive)
const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 webhook requests per minute
  message: {
    success: false,
    message: 'Too many webhook requests, please try again later'
  }
});

// Rate limiting for data operations (more restrictive)
const dataRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 data operations per minute
  message: {
    success: false,
    message: 'Too many data requests, please try again later'
  }
});

/**
 * @route   GET /api/integrations
 * @desc    Get all integrations for user with filtering and pagination
 * @access  Private
 * @params  ?page=1&limit=20&type=social_media&status=active&isEnabled=true&search=facebook
 */
router.get('/', 
  auth, 
  integrationRateLimit, 
  RealIntegrationController.getUserIntegrations.bind(RealIntegrationController)
);

/**
 * @route   GET /api/integrations/types
 * @desc    Get available integration types and their templates
 * @access  Private
 */
router.get('/types', 
  auth, 
  RealIntegrationController.getIntegrationTypes.bind(RealIntegrationController)
);

/**
 * @route   GET /api/integrations/dashboard
 * @desc    Get integration dashboard overview with statistics
 * @access  Private
 */
router.get('/dashboard', 
  auth, 
  RealIntegrationController.getDashboardOverview.bind(RealIntegrationController)
);

/**
 * @route   POST /api/integrations
 * @desc    Create new integration
 * @access  Private
 * @body    { name, type, configuration, documentation, syncSettings, permissions }
 */
router.post('/', 
  auth, 
  integrationRateLimit, 
  RealIntegrationController.createIntegration.bind(RealIntegrationController)
);

/**
 * @route   GET /api/integrations/:id
 * @desc    Get single integration details
 * @access  Private
 */
router.get('/:id', 
  auth, 
  integrationRateLimit, 
  RealIntegrationController.getIntegration.bind(RealIntegrationController)
);

/**
 * @route   PUT /api/integrations/:id/configure
 * @desc    Configure integration settings and credentials
 * @access  Private
 * @body    { apiKey, apiSecret, baseUrl, endpoints, rateLimit, customSettings }
 */
router.put('/:id/configure', 
  auth, 
  integrationRateLimit, 
  RealIntegrationController.configureIntegration.bind(RealIntegrationController)
);

/**
 * @route   POST /api/integrations/:id/test
 * @desc    Test integration connection and validate credentials
 * @access  Private
 */
router.post('/:id/test', 
  auth, 
  integrationRateLimit, 
  RealIntegrationController.testIntegration.bind(RealIntegrationController)
);

/**
 * @route   PUT /api/integrations/:id/toggle
 * @desc    Enable or disable integration
 * @access  Private
 * @body    { isEnabled: boolean }
 */
router.put('/:id/toggle', 
  auth, 
  integrationRateLimit, 
  RealIntegrationController.toggleIntegration.bind(RealIntegrationController)
);

/**
 * @route   DELETE /api/integrations/:id
 * @desc    Delete integration permanently
 * @access  Private
 */
router.delete('/:id', 
  auth, 
  integrationRateLimit, 
  RealIntegrationController.deleteIntegration.bind(RealIntegrationController)
);

/**
 * @route   POST /api/integrations/:id/sync
 * @desc    Manually trigger data synchronization
 * @access  Private
 * @body    { dataType?: string, direction?: 'inbound'|'outbound'|'bidirectional' }
 */
router.post('/:id/sync', 
  auth, 
  dataRateLimit, 
  RealIntegrationController.syncIntegration.bind(RealIntegrationController)
);

/**
 * @route   POST /api/integrations/:id/send
 * @desc    Send data to external service through integration
 * @access  Private
 * @body    { data: object, endpoint?: string }
 */
router.post('/:id/send', 
  auth, 
  dataRateLimit, 
  RealIntegrationController.sendData.bind(RealIntegrationController)
);

/**
 * @route   GET /api/integrations/:id/receive
 * @desc    Receive data from external service through integration
 * @access  Private
 * @params  ?endpoint=custom_endpoint&param1=value1
 */
router.get('/:id/receive', 
  auth, 
  dataRateLimit, 
  RealIntegrationController.receiveData.bind(RealIntegrationController)
);

/**
 * @route   GET /api/integrations/:id/analytics
 * @desc    Get integration analytics and usage statistics
 * @access  Private
 * @params  ?period=30d (7d, 30d, 90d, 1y)
 */
router.get('/:id/analytics', 
  auth, 
  integrationRateLimit, 
  RealIntegrationController.getAnalytics.bind(RealIntegrationController)
);

/**
 * @route   POST /api/integrations/:id/webhook
 * @desc    Handle incoming webhook from external service
 * @access  Public (webhook endpoint)
 * @params  ?event=user.created
 * @body    Webhook payload from external service
 */
router.post('/:id/webhook', 
  webhookRateLimit, 
  RealIntegrationController.handleWebhook.bind(RealIntegrationController)
);

// ==================== BULK OPERATIONS ====================

/**
 * @route   POST /api/integrations/bulk/sync
 * @desc    Trigger sync for multiple integrations
 * @access  Private
 * @body    { integrationIds: string[], dataType?: string }
 */
router.post('/bulk/sync', auth, dataRateLimit, async (req, res) => {
  try {
    const { integrationIds, dataType } = req.body;
    
    if (!integrationIds || !Array.isArray(integrationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Integration IDs array is required'
      });
    }
    
    if (integrationIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 integrations can be synced at once'
      });
    }
    
    const results = [];
    
    for (const integrationId of integrationIds) {
      try {
        // Create a mock request object for the controller
        const mockReq = {
          user: req.user,
          params: { id: integrationId },
          body: { dataType }
        };
        
        const mockRes = {
          json: (data) => data,
          status: (code) => ({ json: (data) => ({ statusCode: code, ...data }) })
        };
        
        const result = await RealIntegrationController.syncIntegration(mockReq, mockRes);
        results.push({
          integrationId,
          success: result.success || result.statusCode !== 400,
          result
        });
        
      } catch (error) {
        results.push({
          integrationId,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: true,
      message: `Bulk sync completed: ${successCount}/${integrationIds.length} successful`,
      data: {
        results,
        summary: {
          total: integrationIds.length,
          successful: successCount,
          failed: integrationIds.length - successCount
        }
      }
    });
    
  } catch (error) {
    console.error('❌ INTEGRATION: Bulk sync failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Bulk sync operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/integrations/bulk/toggle
 * @desc    Enable/disable multiple integrations
 * @access  Private
 * @body    { integrationIds: string[], isEnabled: boolean }
 */
router.put('/bulk/toggle', auth, integrationRateLimit, async (req, res) => {
  try {
    const { integrationIds, isEnabled } = req.body;
    
    if (!integrationIds || !Array.isArray(integrationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Integration IDs array is required'
      });
    }
    
    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isEnabled must be a boolean value'
      });
    }
    
    const Integration = require('../models/Integration');
    
    // Update multiple integrations
    const result = await Integration.updateMany(
      { 
        _id: { $in: integrationIds },
        owner: req.user._id 
      },
      { 
        isEnabled,
        status: isEnabled ? 'active' : 'inactive',
        updatedAt: new Date()
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} integrations ${isEnabled ? 'enabled' : 'disabled'}`,
      data: {
        requested: integrationIds.length,
        modified: result.modifiedCount,
        isEnabled
      }
    });
    
  } catch (error) {
    console.error('❌ INTEGRATION: Bulk toggle failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Bulk toggle operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * @route   GET /api/integrations/admin/stats
 * @desc    Get global integration statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/admin/stats', auth, async (req, res) => {
  try {
    // TODO: Add admin middleware check
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const Integration = require('../models/Integration');
    
    // Get global statistics
    const stats = await Integration.aggregate([
      {
        $group: {
          _id: null,
          totalIntegrations: { $sum: 1 },
          activeIntegrations: {
            $sum: { $cond: [{ $and: ['$isEnabled', { $eq: ['$status', 'active'] }] }, 1, 0] }
          },
          totalRequests: { $sum: '$usage.totalRequests' },
          totalSuccessfulRequests: { $sum: '$usage.successfulRequests' },
          averageSuccessRate: { $avg: { $divide: ['$usage.successfulRequests', '$usage.totalRequests'] } }
        }
      }
    ]);
    
    // Get type breakdown
    const typeBreakdown = await Integration.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $and: ['$isEnabled', { $eq: ['$status', 'active'] }] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent integrations
    const recentIntegrations = await Integration.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name type status isEnabled owner createdAt')
      .populate('owner', 'name email');
    
    res.json({
      success: true,
      message: 'Admin statistics retrieved successfully',
      data: {
        globalStats: stats[0] || {
          totalIntegrations: 0,
          activeIntegrations: 0,
          totalRequests: 0,
          totalSuccessfulRequests: 0,
          averageSuccessRate: 0
        },
        typeBreakdown,
        recentIntegrations
      }
    });
    
  } catch (error) {
    console.error('❌ INTEGRATION: Admin stats failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ==================== UTILITY ENDPOINTS ====================

/**
 * @route   GET /api/integrations/health
 * @desc    Health check for integration service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Integration Service is operational',
    data: {
      status: 'healthy',
      version: '1.0.0',
      features: [
        'Multi-platform integrations',
        'Real-time data synchronization',
        'Webhook processing',
        'Rate limiting',
        'Analytics and monitoring',
        'Bulk operations',
        'Error handling and retries',
        'Security and encryption'
      ],
      supportedTypes: [
        'social_media',
        'payment_gateway',
        'booking_platform',
        'analytics',
        'email_marketing',
        'cloud_storage',
        'messaging',
        'travel_api',
        'weather_api',
        'map_service',
        'review_platform',
        'accommodation',
        'transportation',
        'crm',
        'webhook',
        'custom'
      ],
      uptime: process.uptime(),
      timestamp: new Date()
    }
  });
});

/**
 * @route   POST /api/integrations/validate-config
 * @desc    Validate integration configuration without saving
 * @access  Private
 * @body    { type, configuration }
 */
router.post('/validate-config', auth, integrationRateLimit, async (req, res) => {
  try {
    const { type, configuration } = req.body;
    
    if (!type || !configuration) {
      return res.status(400).json({
        success: false,
        message: 'Type and configuration are required'
      });
    }
    
    // Validate configuration based on integration type
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
    
    // Basic validation
    switch (type) {
      case 'social_media':
        if (!configuration.apiKey) validation.errors.push('API Key is required');
        if (!configuration.apiSecret) validation.errors.push('API Secret is required');
        break;
        
      case 'payment_gateway':
        if (!configuration.apiKey) validation.errors.push('API Key is required');
        if (!configuration.apiSecret) validation.errors.push('API Secret is required');
        if (!configuration.baseUrl) validation.warnings.push('Base URL not specified, using default');
        break;
        
      case 'weather_api':
        if (!configuration.apiKey) validation.errors.push('API Key is required');
        if (!configuration.baseUrl) validation.suggestions.push('Consider specifying a custom base URL');
        break;
        
      case 'analytics':
        if (!configuration.trackingId && !configuration.apiKey) {
          validation.errors.push('Either tracking ID or API Key is required');
        }
        break;
        
      default:
        if (!configuration.apiKey && !configuration.baseUrl) {
          validation.warnings.push('No API credentials or base URL specified');
        }
    }
    
    validation.isValid = validation.errors.length === 0;
    
    res.json({
      success: true,
      message: 'Configuration validation completed',
      data: validation
    });
    
  } catch (error) {
    console.error('❌ INTEGRATION: Config validation failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Configuration validation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;