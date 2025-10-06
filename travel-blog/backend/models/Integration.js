const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const IntegrationSchema = new mongoose.Schema({
  // Basic Integration Information
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  
  type: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  
  // Configuration and Credentials
  configuration: {
    // API Credentials
    apiKey: { type: String, select: false },
    apiSecret: { type: String, select: false },
    accessToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
    clientId: { type: String, select: false },
    clientSecret: { type: String, select: false },
    
    // API Endpoints
    baseUrl: String,
    apiVersion: String,
    endpoints: {
      authenticate: String,
      getData: String,
      postData: String,
      webhook: String
    },
    
    // Rate Limiting
    rateLimit: {
      requestsPerMinute: { type: Number, default: 60 },
      requestsPerHour: { type: Number, default: 1000 },
      requestsPerDay: { type: Number, default: 10000 }
    },
    
    // Custom Settings
    customSettings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  
  // Status and Health
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'pending_setup', 'rate_limited'],
    default: 'pending_setup'
  },
  
  isEnabled: {
    type: Boolean,
    default: false
  },
  
  lastHealthCheck: Date,
  
  healthStatus: {
    isHealthy: { type: Boolean, default: false },
    lastError: String,
    responseTime: Number, // in milliseconds
    uptime: Number // percentage
  },
  
  // Data Synchronization
  syncSettings: {
    autoSync: { type: Boolean, default: false },
    syncInterval: { type: Number, default: 3600 }, // seconds
    lastSync: Date,
    nextSync: Date,
    syncDirection: {
      type: String,
      enum: ['bidirectional', 'inbound', 'outbound'],
      default: 'bidirectional'
    },
    dataTypes: [{
      type: String,
      enum: [
        'users',
        'blogs',
        'bookings',
        'reviews',
        'analytics',
        'payments',
        'notifications',
        'media',
        'locations',
        'weather',
        'prices'
      ]
    }]
  },
  
  // Usage Tracking
  usage: {
    totalRequests: { type: Number, default: 0 },
    successfulRequests: { type: Number, default: 0 },
    failedRequests: { type: Number, default: 0 },
    lastRequestAt: Date,
    
    // Daily usage tracking
    dailyUsage: [{
      date: { type: Date, required: true },
      requests: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 }
    }],
    
    // Monthly limits
    monthlyLimit: { type: Number, default: 100000 },
    currentMonthUsage: { type: Number, default: 0 }
  },
  
  // Webhook Configuration
  webhooks: [{
    event: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    secret: String,
    isActive: {
      type: Boolean,
      default: true
    },
    headers: {
      type: Map,
      of: String
    },
    retryPolicy: {
      maxRetries: { type: Number, default: 3 },
      retryDelay: { type: Number, default: 1000 }
    }
  }],
  
  // Data Mapping and Transformation
  dataMapping: {
    fieldMappings: {
      type: Map,
      of: {
        sourceField: String,
        targetField: String,
        transformation: String // javascript function as string
      }
    },
    responseTransformation: String, // javascript function as string
    requestTransformation: String // javascript function as string
  },
  
  // Security and Permissions
  permissions: [{
    type: String,
    enum: [
      'read_user_data',
      'write_user_data',
      'read_blog_data',
      'write_blog_data',
      'read_booking_data',
      'write_booking_data',
      'read_analytics',
      'send_notifications',
      'access_payments',
      'manage_media',
      'webhook_access'
    ]
  }],
  
  encryption: {
    isEncrypted: { type: Boolean, default: true },
    algorithm: { type: String, default: 'aes-256-gcm' },
    keyVersion: { type: Number, default: 1 }
  },
  
  // Integration Owner and Settings
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: [String],
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Documentation and Support
  documentation: {
    description: String,
    setupInstructions: String,
    apiDocumentationUrl: String,
    supportContact: String,
    troubleshootingGuide: String
  },
  
  // Error Handling and Logging
  errorHandling: {
    retryStrategy: {
      type: String,
      enum: ['exponential_backoff', 'linear', 'fixed_delay'],
      default: 'exponential_backoff'
    },
    maxRetries: { type: Number, default: 3 },
    timeout: { type: Number, default: 30000 }, // milliseconds
    circuitBreaker: {
      enabled: { type: Boolean, default: true },
      failureThreshold: { type: Number, default: 5 },
      resetTimeout: { type: Number, default: 60000 }
    }
  },
  
  // Logs (recent activity)
  recentLogs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'debug'],
      default: 'info'
    },
    message: String,
    data: mongoose.Schema.Types.Mixed,
    requestId: String,
    responseTime: Number
  }],
  
  // Metadata
  tags: [String],
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  category: String,
  
  // Integration specific data
  integrationData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
  
}, {
  timestamps: true,
  collection: 'integrations'
});

// Indexes for performance
IntegrationSchema.index({ owner: 1, type: 1 });
IntegrationSchema.index({ status: 1, isEnabled: 1 });
IntegrationSchema.index({ 'usage.lastRequestAt': -1 });
IntegrationSchema.index({ 'syncSettings.nextSync': 1 });
IntegrationSchema.index({ tags: 1 });

// Add pagination plugin
IntegrationSchema.plugin(mongoosePaginate);

// Virtual for success rate
IntegrationSchema.virtual('successRate').get(function() {
  if (this.usage.totalRequests === 0) return 0;
  return (this.usage.successfulRequests / this.usage.totalRequests * 100).toFixed(2);
});

// Virtual for current month usage percentage
IntegrationSchema.virtual('monthlyUsagePercentage').get(function() {
  if (this.usage.monthlyLimit === 0) return 0;
  return (this.usage.currentMonthUsage / this.usage.monthlyLimit * 100).toFixed(2);
});

// Middleware to encrypt sensitive fields before saving
IntegrationSchema.pre('save', function(next) {
  if (this.isModified('configuration')) {
    // In a real application, encrypt sensitive fields here
    // For demo purposes, we'll just mark as encrypted
    if (this.encryption.isEncrypted) {
      // Simulate encryption
      console.log('🔐 INTEGRATION: Encrypting sensitive configuration data');
    }
  }
  next();
});

// Method to check if integration is healthy
IntegrationSchema.methods.isHealthy = function() {
  return this.status === 'active' && 
         this.isEnabled && 
         this.healthStatus.isHealthy &&
         this.usage.currentMonthUsage < this.usage.monthlyLimit;
};

// Method to log activity
IntegrationSchema.methods.logActivity = function(level, message, data = null, responseTime = null) {
  this.recentLogs.unshift({
    level,
    message,
    data,
    responseTime,
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
  
  // Keep only last 50 logs
  if (this.recentLogs.length > 50) {
    this.recentLogs = this.recentLogs.slice(0, 50);
  }
  
  return this.save();
};

// Method to update usage statistics
IntegrationSchema.methods.recordUsage = function(isSuccess = true, responseTime = null) {
  this.usage.totalRequests += 1;
  this.usage.currentMonthUsage += 1;
  this.usage.lastRequestAt = new Date();
  
  if (isSuccess) {
    this.usage.successfulRequests += 1;
  } else {
    this.usage.failedRequests += 1;
  }
  
  // Update daily usage
  const today = new Date().toISOString().split('T')[0];
  let dailyRecord = this.usage.dailyUsage.find(d => 
    d.date.toISOString().split('T')[0] === today
  );
  
  if (!dailyRecord) {
    dailyRecord = {
      date: new Date(),
      requests: 0,
      successRate: 0,
      averageResponseTime: 0
    };
    this.usage.dailyUsage.unshift(dailyRecord);
  }
  
  dailyRecord.requests += 1;
  if (responseTime) {
    dailyRecord.averageResponseTime = 
      (dailyRecord.averageResponseTime * (dailyRecord.requests - 1) + responseTime) / dailyRecord.requests;
  }
  dailyRecord.successRate = 
    (this.usage.successfulRequests / this.usage.totalRequests * 100);
  
  // Keep only last 30 days
  if (this.usage.dailyUsage.length > 30) {
    this.usage.dailyUsage = this.usage.dailyUsage.slice(0, 30);
  }
  
  return this.save();
};

// Method to get integration summary
IntegrationSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    type: this.type,
    status: this.status,
    isEnabled: this.isEnabled,
    isHealthy: this.isHealthy(),
    successRate: this.successRate,
    monthlyUsagePercentage: this.monthlyUsagePercentage,
    lastRequestAt: this.usage.lastRequestAt,
    lastSync: this.syncSettings.lastSync,
    nextSync: this.syncSettings.nextSync,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get integration by name and owner
IntegrationSchema.statics.findByNameAndOwner = function(name, ownerId) {
  return this.findOne({ name, owner: ownerId });
};

// Static method to get active integrations by type
IntegrationSchema.statics.findActiveByType = function(type, ownerId = null) {
  const query = { 
    type, 
    status: 'active', 
    isEnabled: true 
  };
  
  if (ownerId) {
    query.owner = ownerId;
  }
  
  return this.find(query);
};

// Static method to get integrations needing sync
IntegrationSchema.statics.findPendingSync = function() {
  return this.find({
    'syncSettings.autoSync': true,
    'syncSettings.nextSync': { $lte: new Date() },
    status: 'active',
    isEnabled: true
  });
};

module.exports = mongoose.model('Integration', IntegrationSchema);