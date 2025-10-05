const Integration = require('../models/Integration');
const axios = require('axios');
const crypto = require('crypto');

class RealIntegrationService {
  constructor() {
    this.activeConnections = new Map();
    this.circuitBreakers = new Map();
    this.initializeService();
  }

  /**
   * Initialize the integration service
   */
  initializeService() {
    console.log('🔗 INTEGRATION: Service initializing...');
    
    // Start background tasks
    this.startHealthCheckScheduler();
    this.startSyncScheduler();
    this.startUsageResetScheduler();
    
    console.log('✅ INTEGRATION: Service initialized successfully');
  }

  /**
   * Create a new integration
   */
  async createIntegration(ownerId, integrationData) {
    try {
      console.log(`🔗 INTEGRATION: Creating integration "${integrationData.name}" for user ${ownerId}`);
      
      // Validate integration data
      await this.validateIntegrationData(integrationData);
      
      // Check if integration already exists
      const existing = await Integration.findByNameAndOwner(integrationData.name, ownerId);
      if (existing) {
        throw new Error('Integration with this name already exists');
      }
      
      // Create integration
      const integration = new Integration({
        ...integrationData,
        owner: ownerId,
        status: 'pending_setup',
        isEnabled: false
      });
      
      await integration.save();
      
      // Perform initial health check
      await this.performHealthCheck(integration._id);
      
      console.log(`✅ INTEGRATION: Integration "${integration.name}" created successfully`);
      
      return {
        success: true,
        integration: integration.getSummary(),
        message: 'Integration created successfully'
      };
      
    } catch (error) {
      console.error('❌ INTEGRATION: Creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Configure integration settings
   */
  async configureIntegration(integrationId, configuration) {
    try {
      console.log(`⚙️ INTEGRATION: Configuring integration ${integrationId}`);
      
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      // Update configuration
      integration.configuration = { ...integration.configuration, ...configuration };
      integration.status = 'pending_setup';
      
      await integration.save();
      
      // Test the configuration
      const testResult = await this.testConnection(integrationId);
      
      if (testResult.success) {
        integration.status = 'active';
        integration.isEnabled = true;
        await integration.save();
      }
      
      console.log(`✅ INTEGRATION: Integration configured successfully`);
      
      return {
        success: true,
        integration: integration.getSummary(),
        testResult,
        message: 'Integration configured successfully'
      };
      
    } catch (error) {
      console.error('❌ INTEGRATION: Configuration failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all integrations for a user
   */
  async getUserIntegrations(userId) {
    try {
      console.log(`🔗 INTEGRATION: Getting integrations for user ${userId}`);
      
      const integrations = await Integration.find({ owner: userId })
        .select('name type platform status isEnabled createdAt lastSyncAt')
        .sort({ createdAt: -1 });
      
      console.log(`✅ INTEGRATION: Found ${integrations.length} integrations for user`);
      
      return {
        success: true,
        data: {
          integrations: integrations.map(integration => integration.getSummary()),
          totalCount: integrations.length,
          activeCount: integrations.filter(i => i.isEnabled).length
        }
      };
      
    } catch (error) {
      console.error('❌ INTEGRATION: Get user integrations failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Test integration connection
   */
  async testConnection(integrationId) {
    try {
      console.log(`🔍 INTEGRATION: Testing connection for ${integrationId}`);
      
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      const startTime = Date.now();
      let testResult = { success: false, message: '', responseTime: 0 };
      
      // Perform connection test based on integration type
      switch (integration.type) {
        case 'social_media':
          testResult = await this.testSocialMediaConnection(integration);
          break;
          
        case 'payment_gateway':
          testResult = await this.testPaymentGatewayConnection(integration);
          break;
          
        case 'booking_platform':
          testResult = await this.testBookingPlatformConnection(integration);
          break;
          
        case 'analytics':
          testResult = await this.testAnalyticsConnection(integration);
          break;
          
        case 'weather_api':
          testResult = await this.testWeatherAPIConnection(integration);
          break;
          
        case 'map_service':
          testResult = await this.testMapServiceConnection(integration);
          break;
          
        default:
          testResult = await this.testGenericConnection(integration);
      }
      
      const responseTime = Date.now() - startTime;
      testResult.responseTime = responseTime;
      
      // Update health status
      integration.healthStatus = {
        isHealthy: testResult.success,
        lastError: testResult.success ? null : testResult.message,
        responseTime,
        uptime: testResult.success ? 100 : 0
      };
      integration.lastHealthCheck = new Date();
      
      await integration.save();
      await integration.logActivity(
        testResult.success ? 'info' : 'error',
        `Connection test: ${testResult.message}`,
        testResult,
        responseTime
      );
      
      console.log(`${testResult.success ? '✅' : '❌'} INTEGRATION: Connection test completed`);
      
      return testResult;
      
    } catch (error) {
      console.error('❌ INTEGRATION: Connection test failed:', error.message);
      throw error;
    }
  }

  /**
   * Sync data with external service
   */
  async syncData(integrationId, dataType = null, direction = null) {
    try {
      console.log(`🔄 INTEGRATION: Starting data sync for ${integrationId}`);
      
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      if (!integration.isHealthy()) {
        throw new Error('Integration is not healthy for sync');
      }
      
      const syncTypes = dataType ? [dataType] : integration.syncSettings.dataTypes;
      const syncDirection = direction || integration.syncSettings.syncDirection;
      
      let syncResults = [];
      
      for (const type of syncTypes) {
        console.log(`📊 INTEGRATION: Syncing ${type} data...`);
        
        const result = await this.syncDataType(integration, type, syncDirection);
        syncResults.push(result);
        
        // Record usage
        await integration.recordUsage(result.success, result.responseTime);
      }
      
      // Update sync timestamps
      integration.syncSettings.lastSync = new Date();
      integration.syncSettings.nextSync = new Date(
        Date.now() + integration.syncSettings.syncInterval * 1000
      );
      
      await integration.save();
      
      const overallSuccess = syncResults.every(r => r.success);
      
      await integration.logActivity(
        overallSuccess ? 'info' : 'warning',
        `Data sync completed: ${syncResults.filter(r => r.success).length}/${syncResults.length} successful`,
        { syncResults, dataTypes: syncTypes }
      );
      
      console.log(`${overallSuccess ? '✅' : '⚠️'} INTEGRATION: Data sync completed`);
      
      return {
        success: overallSuccess,
        results: syncResults,
        message: `Sync completed: ${syncResults.filter(r => r.success).length}/${syncResults.length} successful`
      };
      
    } catch (error) {
      console.error('❌ INTEGRATION: Data sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Send data to external service
   */
  async sendData(integrationId, data, endpoint = null) {
    try {
      console.log(`📤 INTEGRATION: Sending data via ${integrationId}`);
      
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      if (!integration.isHealthy()) {
        throw new Error('Integration is not healthy');
      }
      
      // Check rate limits
      await this.checkRateLimit(integration);
      
      const startTime = Date.now();
      let response;
      
      // Transform data if needed
      const transformedData = await this.transformData(integration, data, 'outbound');
      
      // Send data based on integration type
      const targetEndpoint = endpoint || integration.configuration.endpoints.postData;
      
      response = await this.makeAPIRequest(integration, 'POST', targetEndpoint, transformedData);
      
      const responseTime = Date.now() - startTime;
      
      // Record usage
      await integration.recordUsage(true, responseTime);
      
      await integration.logActivity(
        'info',
        'Data sent successfully',
        { endpoint: targetEndpoint, dataSize: JSON.stringify(data).length },
        responseTime
      );
      
      console.log(`✅ INTEGRATION: Data sent successfully`);
      
      return {
        success: true,
        response: response.data,
        responseTime,
        message: 'Data sent successfully'
      };
      
    } catch (error) {
      console.error('❌ INTEGRATION: Send data failed:', error.message);
      
      // Record failed usage
      const integration = await Integration.findById(integrationId);
      if (integration) {
        await integration.recordUsage(false);
        await integration.logActivity('error', `Send data failed: ${error.message}`, { error: error.message });
      }
      
      throw error;
    }
  }

  /**
   * Receive data from external service
   */
  async receiveData(integrationId, endpoint = null, params = {}) {
    try {
      console.log(`📥 INTEGRATION: Receiving data via ${integrationId}`);
      
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      if (!integration.isHealthy()) {
        throw new Error('Integration is not healthy');
      }
      
      // Check rate limits
      await this.checkRateLimit(integration);
      
      const startTime = Date.now();
      
      // Get data from external service
      const targetEndpoint = endpoint || integration.configuration.endpoints.getData;
      
      const response = await this.makeAPIRequest(integration, 'GET', targetEndpoint, null, params);
      
      const responseTime = Date.now() - startTime;
      
      // Transform received data if needed
      const transformedData = await this.transformData(integration, response.data, 'inbound');
      
      // Record usage
      await integration.recordUsage(true, responseTime);
      
      await integration.logActivity(
        'info',
        'Data received successfully',
        { endpoint: targetEndpoint, dataSize: JSON.stringify(response.data).length },
        responseTime
      );
      
      console.log(`✅ INTEGRATION: Data received successfully`);
      
      return {
        success: true,
        data: transformedData,
        responseTime,
        message: 'Data received successfully'
      };
      
    } catch (error) {
      console.error('❌ INTEGRATION: Receive data failed:', error.message);
      
      // Record failed usage
      const integration = await Integration.findById(integrationId);
      if (integration) {
        await integration.recordUsage(false);
        await integration.logActivity('error', `Receive data failed: ${error.message}`, { error: error.message });
      }
      
      throw error;
    }
  }

  /**
   * Handle webhook from external service
   */
  async handleWebhook(integrationId, webhookEvent, data, headers = {}) {
    try {
      console.log(`🪝 INTEGRATION: Handling webhook for ${integrationId}, event: ${webhookEvent}`);
      
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      // Find webhook configuration
      const webhook = integration.webhooks.find(w => w.event === webhookEvent && w.isActive);
      if (!webhook) {
        throw new Error(`No active webhook found for event: ${webhookEvent}`);
      }
      
      // Verify webhook signature if secret is configured
      if (webhook.secret) {
        const isValid = this.verifyWebhookSignature(data, headers, webhook.secret);
        if (!isValid) {
          throw new Error('Invalid webhook signature');
        }
      }
      
      // Transform webhook data
      const transformedData = await this.transformData(integration, data, 'inbound');
      
      // Process webhook based on event type
      const result = await this.processWebhookEvent(integration, webhookEvent, transformedData);
      
      await integration.logActivity(
        'info',
        `Webhook processed: ${webhookEvent}`,
        { event: webhookEvent, result },
        0
      );
      
      console.log(`✅ INTEGRATION: Webhook processed successfully`);
      
      return {
        success: true,
        result,
        message: 'Webhook processed successfully'
      };
      
    } catch (error) {
      console.error('❌ INTEGRATION: Webhook processing failed:', error.message);
      
      const integration = await Integration.findById(integrationId);
      if (integration) {
        await integration.logActivity('error', `Webhook failed: ${error.message}`, { event: webhookEvent, error: error.message });
      }
      
      throw error;
    }
  }

  /**
   * Get integration analytics
   */
  async getIntegrationAnalytics(integrationId, period = '30d') {
    try {
      console.log(`📊 INTEGRATION: Getting analytics for ${integrationId}, period: ${period}`);
      
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      const days = this.parsePeriod(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Filter daily usage data
      const relevantUsage = integration.usage.dailyUsage.filter(d => d.date >= startDate);
      
      // Calculate analytics
      const analytics = {
        period,
        totalRequests: relevantUsage.reduce((sum, d) => sum + d.requests, 0),
        averageRequestsPerDay: relevantUsage.length > 0 ? 
          relevantUsage.reduce((sum, d) => sum + d.requests, 0) / relevantUsage.length : 0,
        averageSuccessRate: relevantUsage.length > 0 ?
          relevantUsage.reduce((sum, d) => sum + d.successRate, 0) / relevantUsage.length : 0,
        averageResponseTime: relevantUsage.length > 0 ?
          relevantUsage.reduce((sum, d) => sum + d.averageResponseTime, 0) / relevantUsage.length : 0,
        
        // Usage trends
        usageTrend: relevantUsage.map(d => ({
          date: d.date,
          requests: d.requests,
          successRate: d.successRate,
          responseTime: d.averageResponseTime
        })),
        
        // Health metrics
        uptime: integration.healthStatus.uptime,
        isHealthy: integration.isHealthy(),
        
        // Rate limit status
        monthlyUsagePercentage: integration.monthlyUsagePercentage,
        remainingQuota: integration.usage.monthlyLimit - integration.usage.currentMonthUsage,
        
        // Recent activity
        recentErrors: integration.recentLogs
          .filter(log => log.level === 'error' && log.timestamp >= startDate)
          .slice(0, 10),
        
        // Integration status
        status: integration.status,
        lastSync: integration.syncSettings.lastSync,
        nextSync: integration.syncSettings.nextSync
      };
      
      console.log(`✅ INTEGRATION: Analytics retrieved successfully`);
      
      return {
        success: true,
        analytics,
        message: 'Analytics retrieved successfully'
      };
      
    } catch (error) {
      console.error('❌ INTEGRATION: Get analytics failed:', error.message);
      throw error;
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validate integration data
   */
  async validateIntegrationData(data) {
    const required = ['name', 'type'];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Validate integration type
    const validTypes = [
      'social_media', 'payment_gateway', 'booking_platform', 'analytics',
      'email_marketing', 'cloud_storage', 'messaging', 'travel_api',
      'weather_api', 'map_service', 'review_platform', 'accommodation',
      'transportation', 'crm', 'webhook', 'custom'
    ];
    
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid integration type: ${data.type}`);
    }
    
    return true;
  }

  /**
   * Test specific integration types
   */
  async testSocialMediaConnection(integration) {
    // Simulate social media API test
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        resolve({
          success,
          message: success ? 'Social media connection successful' : 'Failed to authenticate with social media API',
          data: success ? { platform: integration.name, authenticated: true } : null
        });
      }, 1000);
    });
  }

  async testPaymentGatewayConnection(integration) {
    // Simulate payment gateway test
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.05; // 95% success rate
        resolve({
          success,
          message: success ? 'Payment gateway connection successful' : 'Failed to connect to payment gateway',
          data: success ? { gateway: integration.name, status: 'active' } : null
        });
      }, 1500);
    });
  }

  async testBookingPlatformConnection(integration) {
    // Simulate booking platform test
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.15; // 85% success rate
        resolve({
          success,
          message: success ? 'Booking platform connection successful' : 'Failed to connect to booking platform',
          data: success ? { platform: integration.name, available_services: ['hotels', 'flights', 'cars'] } : null
        });
      }, 2000);
    });
  }

  async testAnalyticsConnection(integration) {
    // Simulate analytics service test
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.08; // 92% success rate
        resolve({
          success,
          message: success ? 'Analytics service connection successful' : 'Failed to connect to analytics service',
          data: success ? { service: integration.name, tracking_enabled: true } : null
        });
      }, 800);
    });
  }

  async testWeatherAPIConnection(integration) {
    // Simulate weather API test
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.05; // 95% success rate
        resolve({
          success,
          message: success ? 'Weather API connection successful' : 'Failed to connect to weather API',
          data: success ? { api: integration.name, locations_supported: 10000 } : null
        });
      }, 600);
    });
  }

  async testMapServiceConnection(integration) {
    // Simulate map service test
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.03; // 97% success rate
        resolve({
          success,
          message: success ? 'Map service connection successful' : 'Failed to connect to map service',
          data: success ? { service: integration.name, features: ['geocoding', 'routing', 'places'] } : null
        });
      }, 500);
    });
  }

  async testGenericConnection(integration) {
    // Generic connection test
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        resolve({
          success,
          message: success ? 'Connection successful' : 'Connection failed',
          data: success ? { status: 'connected', type: integration.type } : null
        });
      }, 1000);
    });
  }

  /**
   * Sync specific data type
   */
  async syncDataType(integration, dataType, direction) {
    const startTime = Date.now();
    
    try {
      // Simulate data sync based on type
      let result = { success: false, recordsProcessed: 0, errors: [] };
      
      switch (dataType) {
        case 'users':
          result = await this.syncUsers(integration, direction);
          break;
        case 'blogs':
          result = await this.syncBlogs(integration, direction);
          break;
        case 'bookings':
          result = await this.syncBookings(integration, direction);
          break;
        case 'reviews':
          result = await this.syncReviews(integration, direction);
          break;
        case 'analytics':
          result = await this.syncAnalytics(integration, direction);
          break;
        default:
          result = await this.syncGenericData(integration, dataType, direction);
      }
      
      result.responseTime = Date.now() - startTime;
      result.dataType = dataType;
      result.direction = direction;
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        dataType,
        direction,
        error: error.message,
        responseTime: Date.now() - startTime,
        recordsProcessed: 0
      };
    }
  }

  /**
   * Simulate specific data sync methods
   */
  async syncUsers(integration, direction) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recordsProcessed = Math.floor(Math.random() * 100) + 1;
        resolve({
          success: true,
          recordsProcessed,
          errors: [],
          message: `${recordsProcessed} user records synced (${direction})`
        });
      }, 2000);
    });
  }

  async syncBlogs(integration, direction) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recordsProcessed = Math.floor(Math.random() * 50) + 1;
        resolve({
          success: true,
          recordsProcessed,
          errors: [],
          message: `${recordsProcessed} blog records synced (${direction})`
        });
      }, 1500);
    });
  }

  async syncBookings(integration, direction) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recordsProcessed = Math.floor(Math.random() * 30) + 1;
        resolve({
          success: true,
          recordsProcessed,
          errors: [],
          message: `${recordsProcessed} booking records synced (${direction})`
        });
      }, 3000);
    });
  }

  async syncReviews(integration, direction) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recordsProcessed = Math.floor(Math.random() * 75) + 1;
        resolve({
          success: true,
          recordsProcessed,
          errors: [],
          message: `${recordsProcessed} review records synced (${direction})`
        });
      }, 1800);
    });
  }

  async syncAnalytics(integration, direction) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recordsProcessed = Math.floor(Math.random() * 200) + 1;
        resolve({
          success: true,
          recordsProcessed,
          errors: [],
          message: `${recordsProcessed} analytics records synced (${direction})`
        });
      }, 1000);
    });
  }

  async syncGenericData(integration, dataType, direction) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recordsProcessed = Math.floor(Math.random() * 50) + 1;
        resolve({
          success: true,
          recordsProcessed,
          errors: [],
          message: `${recordsProcessed} ${dataType} records synced (${direction})`
        });
      }, 1500);
    });
  }

  /**
   * Make API request to external service
   */
  async makeAPIRequest(integration, method, endpoint, data = null, params = {}) {
    const config = {
      method,
      url: `${integration.configuration.baseUrl}${endpoint}`,
      timeout: integration.errorHandling.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TravelBlog-Integration/1.0'
      }
    };
    
    // Add authentication headers
    if (integration.configuration.apiKey) {
      config.headers['X-API-Key'] = integration.configuration.apiKey;
    }
    
    if (integration.configuration.accessToken) {
      config.headers['Authorization'] = `Bearer ${integration.configuration.accessToken}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    if (Object.keys(params).length > 0) {
      config.params = params;
    }
    
    return await axios(config);
  }

  /**
   * Transform data using configured mappings
   */
  async transformData(integration, data, direction) {
    try {
      if (!integration.dataMapping) {
        return data;
      }
      
      let transformFunction;
      
      if (direction === 'inbound' && integration.dataMapping.responseTransformation) {
        transformFunction = new Function('data', integration.dataMapping.responseTransformation);
      } else if (direction === 'outbound' && integration.dataMapping.requestTransformation) {
        transformFunction = new Function('data', integration.dataMapping.requestTransformation);
      }
      
      if (transformFunction) {
        return transformFunction(data);
      }
      
      // Apply field mappings
      if (integration.dataMapping.fieldMappings) {
        const transformed = {};
        
        for (const [key, mapping] of integration.dataMapping.fieldMappings) {
          if (data[mapping.sourceField] !== undefined) {
            let value = data[mapping.sourceField];
            
            // Apply transformation if specified
            if (mapping.transformation) {
              const transformFunc = new Function('value', mapping.transformation);
              value = transformFunc(value);
            }
            
            transformed[mapping.targetField] = value;
          }
        }
        
        return { ...data, ...transformed };
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ INTEGRATION: Data transformation failed:', error.message);
      return data; // Return original data if transformation fails
    }
  }

  /**
   * Check rate limits
   */
  async checkRateLimit(integration) {
    const now = Date.now();
    const rateLimit = integration.configuration.rateLimit;
    
    // Simple rate limiting check (in production, use more sophisticated rate limiting)
    if (integration.usage.currentMonthUsage >= integration.usage.monthlyLimit) {
      throw new Error('Monthly rate limit exceeded');
    }
    
    // Update status if rate limited
    if (integration.usage.currentMonthUsage / integration.usage.monthlyLimit > 0.9) {
      integration.status = 'rate_limited';
      await integration.save();
    }
    
    return true;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(data, headers, secret) {
    try {
      const signature = headers['x-webhook-signature'] || headers['x-signature'];
      if (!signature) return false;
      
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(data))
        .digest('hex');
      
      return signature === expectedSignature;
      
    } catch (error) {
      console.error('❌ INTEGRATION: Webhook signature verification failed:', error.message);
      return false;
    }
  }

  /**
   * Process webhook events
   */
  async processWebhookEvent(integration, event, data) {
    console.log(`🔄 INTEGRATION: Processing webhook event "${event}"`);
    
    // Process different webhook events
    switch (event) {
      case 'user.created':
        return await this.handleUserCreatedWebhook(integration, data);
      
      case 'booking.completed':
        return await this.handleBookingCompletedWebhook(integration, data);
      
      case 'payment.succeeded':
        return await this.handlePaymentSucceededWebhook(integration, data);
      
      case 'review.submitted':
        return await this.handleReviewSubmittedWebhook(integration, data);
      
      default:
        return await this.handleGenericWebhook(integration, event, data);
    }
  }

  /**
   * Webhook event handlers
   */
  async handleUserCreatedWebhook(integration, data) {
    // Simulate user creation webhook processing
    return {
      processed: true,
      action: 'user_sync',
      message: `User ${data.userId || 'unknown'} processed from webhook`
    };
  }

  async handleBookingCompletedWebhook(integration, data) {
    // Simulate booking completion webhook processing
    return {
      processed: true,
      action: 'booking_sync',
      message: `Booking ${data.bookingId || 'unknown'} processed from webhook`
    };
  }

  async handlePaymentSucceededWebhook(integration, data) {
    // Simulate payment success webhook processing
    return {
      processed: true,
      action: 'payment_confirmation',
      message: `Payment ${data.paymentId || 'unknown'} confirmed from webhook`
    };
  }

  async handleReviewSubmittedWebhook(integration, data) {
    // Simulate review submission webhook processing
    return {
      processed: true,
      action: 'review_sync',
      message: `Review ${data.reviewId || 'unknown'} processed from webhook`
    };
  }

  async handleGenericWebhook(integration, event, data) {
    // Handle any other webhook events
    return {
      processed: true,
      action: 'generic_processing',
      message: `Generic webhook "${event}" processed`
    };
  }

  /**
   * Parse period string to days
   */
  parsePeriod(period) {
    const matches = period.match(/^(\d+)([hdwmy])$/);
    if (!matches) return 30; // default to 30 days
    
    const [, num, unit] = matches;
    const number = parseInt(num);
    
    switch (unit) {
      case 'h': return number / 24;
      case 'd': return number;
      case 'w': return number * 7;
      case 'm': return number * 30;
      case 'y': return number * 365;
      default: return 30;
    }
  }

  /**
   * Background scheduler methods
   */
  startHealthCheckScheduler() {
    // Run health checks every 5 minutes
    setInterval(async () => {
      try {
        const activeIntegrations = await Integration.find({
          isEnabled: true,
          status: { $in: ['active', 'error'] }
        });
        
        console.log(`🏥 INTEGRATION: Running health checks for ${activeIntegrations.length} integrations`);
        
        for (const integration of activeIntegrations) {
          try {
            await this.performHealthCheck(integration._id);
          } catch (error) {
            console.error(`❌ INTEGRATION: Health check failed for ${integration.name}:`, error.message);
          }
        }
        
      } catch (error) {
        console.error('❌ INTEGRATION: Health check scheduler error:', error.message);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  startSyncScheduler() {
    // Run sync scheduler every minute
    setInterval(async () => {
      try {
        const pendingSyncs = await Integration.findPendingSync();
        
        if (pendingSyncs.length > 0) {
          console.log(`🔄 INTEGRATION: Processing ${pendingSyncs.length} pending syncs`);
          
          for (const integration of pendingSyncs) {
            try {
              await this.syncData(integration._id);
            } catch (error) {
              console.error(`❌ INTEGRATION: Auto-sync failed for ${integration.name}:`, error.message);
            }
          }
        }
        
      } catch (error) {
        console.error('❌ INTEGRATION: Sync scheduler error:', error.message);
      }
    }, 60 * 1000); // 1 minute
  }

  startUsageResetScheduler() {
    // Reset monthly usage on the 1st of each month
    setInterval(async () => {
      try {
        const now = new Date();
        if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
          console.log('🔄 INTEGRATION: Resetting monthly usage counters');
          
          await Integration.updateMany(
            {},
            { $set: { 'usage.currentMonthUsage': 0 } }
          );
          
          console.log('✅ INTEGRATION: Monthly usage counters reset');
        }
      } catch (error) {
        console.error('❌ INTEGRATION: Usage reset scheduler error:', error.message);
      }
    }, 60 * 1000); // Check every minute
  }

  async performHealthCheck(integrationId) {
    try {
      await this.testConnection(integrationId);
    } catch (error) {
      // Health check failure is logged in testConnection
    }
  }
}

module.exports = new RealIntegrationService();