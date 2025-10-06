const mongoose = require('mongoose');

const MobileOptimizationSchema = new mongoose.Schema({
  // Basic Mobile Settings
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Device Information
  deviceInfo: {
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      required: true
    },
    operatingSystem: {
      type: String,
      enum: ['ios', 'android', 'windows', 'macos', 'linux'],
      required: true
    },
    browser: String,
    browserVersion: String,
    screenResolution: {
      width: Number,
      height: Number
    },
    devicePixelRatio: Number,
    isLowPowerMode: {
      type: Boolean,
      default: false
    },
    connectionType: {
      type: String,
      enum: ['wifi', '4g', '3g', '2g', 'slow-2g', 'offline'],
      default: 'wifi'
    },
    connectionSpeed: {
      type: String,
      enum: ['fast', 'moderate', 'slow'],
      default: 'fast'
    }
  },
  
  // Performance Optimization Settings
  performanceSettings: {
    // Image Optimization
    imageOptimization: {
      enableWebP: { type: Boolean, default: true },
      enableLazyLoading: { type: Boolean, default: true },
      compressionLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'max'],
        default: 'medium'
      },
      maxImageWidth: { type: Number, default: 800 },
      maxImageHeight: { type: Number, default: 600 },
      enableAdaptiveImages: { type: Boolean, default: true }
    },
    
    // Content Optimization
    contentOptimization: {
      enableMinification: { type: Boolean, default: true },
      enableGzipCompression: { type: Boolean, default: true },
      enableBrotliCompression: { type: Boolean, default: true },
      enableContentCaching: { type: Boolean, default: true },
      cacheTimeout: { type: Number, default: 3600 }, // seconds
      enableOfflineMode: { type: Boolean, default: true }
    },
    
    // Loading Optimization
    loadingOptimization: {
      enableProgressiveLoading: { type: Boolean, default: true },
      enablePreloading: { type: Boolean, default: true },
      enablePrefetching: { type: Boolean, default: true },
      enableCodeSplitting: { type: Boolean, default: true },
      enableServiceWorker: { type: Boolean, default: true },
      maxConcurrentRequests: { type: Number, default: 6 }
    },
    
    // Battery Optimization
    batteryOptimization: {
      enableBatterySaver: { type: Boolean, default: true },
      reducedAnimations: { type: Boolean, default: false },
      reducedBackgroundActivity: { type: Boolean, default: false },
      optimizedPolling: { type: Boolean, default: true },
      batteryThreshold: { type: Number, default: 20 } // percentage
    }
  },
  
  // User Experience Settings
  uxSettings: {
    // Touch and Gestures
    touchOptimization: {
      enableTouchGestures: { type: Boolean, default: true },
      swipeNavigation: { type: Boolean, default: true },
      pinchToZoom: { type: Boolean, default: true },
      tapToClick: { type: Boolean, default: true },
      touchTargetSize: { type: Number, default: 44 }, // pixels
      gestureThreshold: { type: Number, default: 10 } // pixels
    },
    
    // Navigation
    navigationOptimization: {
      enableBottomNavigation: { type: Boolean, default: true },
      enableSideDrawer: { type: Boolean, default: true },
      enableBreadcrumbs: { type: Boolean, default: false },
      enableSearchShortcuts: { type: Boolean, default: true },
      showBackButton: { type: Boolean, default: true }
    },
    
    // Text and Display
    displayOptimization: {
      fontSizeMultiplier: { type: Number, default: 1.0, min: 0.8, max: 2.0 },
      lineHeightMultiplier: { type: Number, default: 1.0, min: 0.8, max: 2.0 },
      enableDarkMode: { type: Boolean, default: false },
      enableHighContrast: { type: Boolean, default: false },
      enableDyslexicFont: { type: Boolean, default: false },
      textAlignment: {
        type: String,
        enum: ['left', 'center', 'right', 'justify'],
        default: 'left'
      }
    },
    
    // Notifications
    notificationSettings: {
      enablePushNotifications: { type: Boolean, default: true },
      enableInAppNotifications: { type: Boolean, default: true },
      notificationFrequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily', 'weekly', 'disabled'],
        default: 'immediate'
      },
      quietHours: {
        enabled: { type: Boolean, default: false },
        startTime: { type: String, default: '22:00' },
        endTime: { type: String, default: '08:00' }
      }
    }
  },
  
  // Performance Metrics
  performanceMetrics: {
    // Page Load Metrics
    pageLoadMetrics: {
      firstContentfulPaint: Number, // milliseconds
      largestContentfulPaint: Number,
      firstInputDelay: Number,
      cumulativeLayoutShift: Number,
      timeToInteractive: Number,
      totalPageSize: Number, // bytes
      numberOfRequests: Number
    },
    
    // User Interaction Metrics
    interactionMetrics: {
      averageSessionDuration: Number, // seconds
      bounceRate: Number, // percentage
      pagesPerSession: Number,
      scrollDepth: Number, // percentage
      clickThroughRate: Number, // percentage
      conversionRate: Number // percentage
    },
    
    // Network Metrics
    networkMetrics: {
      averageResponseTime: Number, // milliseconds
      errorRate: Number, // percentage
      timeoutRate: Number, // percentage
      retryRate: Number, // percentage
      cacheHitRate: Number // percentage
    },
    
    // Battery and Resource Usage
    resourceMetrics: {
      batteryUsage: Number, // percentage per hour
      memoryUsage: Number, // MB
      cpuUsage: Number, // percentage
      networkUsage: Number, // MB
      storageUsage: Number // MB
    }
  },
  
  // Adaptive Behavior Settings
  adaptiveBehavior: {
    // Auto-adjustment based on conditions
    autoOptimization: {
      enabled: { type: Boolean, default: true },
      adjustForSlowConnection: { type: Boolean, default: true },
      adjustForLowBattery: { type: Boolean, default: true },
      adjustForLowMemory: { type: Boolean, default: true },
      adjustForOfflineMode: { type: Boolean, default: true }
    },
    
    // Bandwidth Management
    bandwidthManagement: {
      enableDataSaver: { type: Boolean, default: false },
      maxBandwidthUsage: Number, // MB per session
      prioritizeContent: {
        type: String,
        enum: ['text_first', 'images_first', 'balanced'],
        default: 'balanced'
      },
      enableBackgroundSync: { type: Boolean, default: true }
    },
    
    // Progressive Enhancement
    progressiveEnhancement: {
      fallbackMode: {
        type: String,
        enum: ['basic', 'enhanced', 'full'],
        default: 'enhanced'
      },
      enableFeatureDetection: { type: Boolean, default: true },
      gracefulDegradation: { type: Boolean, default: true }
    }
  },
  
  // Mobile-Specific Features
  mobileFeatures: {
    // Camera and Media
    cameraIntegration: {
      enableCamera: { type: Boolean, default: true },
      preferredCamera: {
        type: String,
        enum: ['front', 'back', 'auto'],
        default: 'back'
      },
      enablePhotoUpload: { type: Boolean, default: true },
      enableVideoUpload: { type: Boolean, default: true },
      maxPhotoSize: { type: Number, default: 5 }, // MB
      maxVideoSize: { type: Number, default: 50 } // MB
    },
    
    // Location Services
    locationServices: {
      enableGPS: { type: Boolean, default: true },
      enableLocationSharing: { type: Boolean, default: false },
      locationAccuracy: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      },
      enableGeotagging: { type: Boolean, default: true },
      enableNearbyPlaces: { type: Boolean, default: true }
    },
    
    // Offline Capabilities
    offlineCapabilities: {
      enableOfflineReading: { type: Boolean, default: true },
      enableOfflineComments: { type: Boolean, default: true },
      enableOfflineBookmarks: { type: Boolean, default: true },
      offlineStorageLimit: { type: Number, default: 100 }, // MB
      syncWhenOnline: { type: Boolean, default: true }
    },
    
    // App-like Features
    appFeatures: {
      enablePWA: { type: Boolean, default: true },
      enableHomeScreenInstall: { type: Boolean, default: true },
      enableFullscreen: { type: Boolean, default: false },
      enableSplashScreen: { type: Boolean, default: true },
      enableAppBadges: { type: Boolean, default: true }
    }
  },
  
  // A/B Testing and Experiments
  experiments: [{
    name: String,
    variant: String,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    metrics: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  
  // User Feedback and Ratings
  feedback: {
    performanceRating: {
      type: Number,
      min: 1,
      max: 5
    },
    usabilityRating: {
      type: Number,
      min: 1,
      max: 5
    },
    batteryRating: {
      type: Number,
      min: 1,
      max: 5
    },
    lastFeedbackDate: Date,
    comments: [String]
  },
  
  // Optimization History
  optimizationHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: String,
    reason: String,
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    performanceImpact: {
      before: {
        loadTime: Number,
        batteryUsage: Number,
        memoryUsage: Number
      },
      after: {
        loadTime: Number,
        batteryUsage: Number,
        memoryUsage: Number
      }
    }
  }],
  
  // Last Updated and Version
  lastOptimizationCheck: {
    type: Date,
    default: Date.now
  },
  
  optimizationVersion: {
    type: String,
    default: '1.0.0'
  },
  
  // Analytics and Tracking
  analytics: {
    trackingEnabled: { type: Boolean, default: true },
    anonymizeData: { type: Boolean, default: true },
    shareUsageData: { type: Boolean, default: false },
    dataRetentionDays: { type: Number, default: 90 }
  }
  
}, {
  timestamps: true,
  collection: 'mobile_optimizations'
});

// Indexes for performance
MobileOptimizationSchema.index({ user: 1 });
MobileOptimizationSchema.index({ 'deviceInfo.deviceType': 1 });
MobileOptimizationSchema.index({ 'deviceInfo.operatingSystem': 1 });
MobileOptimizationSchema.index({ lastOptimizationCheck: -1 });
MobileOptimizationSchema.index({ 'performanceMetrics.pageLoadMetrics.firstContentfulPaint': 1 });

// Virtual for overall performance score
MobileOptimizationSchema.virtual('performanceScore').get(function() {
  const metrics = this.performanceMetrics;
  if (!metrics || !metrics.pageLoadMetrics) return 0;
  
  // Calculate score based on key metrics (0-100)
  let score = 100;
  
  // Deduct points based on load time
  if (metrics.pageLoadMetrics.firstContentfulPaint > 3000) score -= 20;
  if (metrics.pageLoadMetrics.timeToInteractive > 5000) score -= 20;
  
  // Deduct points based on resource usage
  if (metrics.resourceMetrics && metrics.resourceMetrics.batteryUsage > 10) score -= 15;
  if (metrics.resourceMetrics && metrics.resourceMetrics.memoryUsage > 100) score -= 15;
  
  // Deduct points based on user experience
  if (metrics.interactionMetrics && metrics.interactionMetrics.bounceRate > 70) score -= 15;
  if (metrics.networkMetrics && metrics.networkMetrics.errorRate > 5) score -= 15;
  
  return Math.max(0, score);
});

// Virtual for optimization status
MobileOptimizationSchema.virtual('optimizationStatus').get(function() {
  const score = this.performanceScore;
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
});

// Method to check if optimization is needed
MobileOptimizationSchema.methods.needsOptimization = function() {
  const score = this.performanceScore;
  const lastCheck = this.lastOptimizationCheck;
  const hoursSinceLastCheck = (Date.now() - lastCheck) / (1000 * 60 * 60);
  
  return score < 75 || hoursSinceLastCheck > 24;
};

// Method to apply automatic optimizations
MobileOptimizationSchema.methods.applyAutoOptimizations = function() {
  const optimizations = [];
  
  // Check connection speed and adjust settings
  if (this.deviceInfo.connectionSpeed === 'slow') {
    this.performanceSettings.imageOptimization.compressionLevel = 'high';
    this.performanceSettings.contentOptimization.enableMinification = true;
    this.mobileFeatures.offlineCapabilities.enableOfflineReading = true;
    optimizations.push('Enabled aggressive compression for slow connection');
  }
  
  // Check battery level and adjust settings
  if (this.deviceInfo.isLowPowerMode) {
    this.performanceSettings.batteryOptimization.reducedAnimations = true;
    this.performanceSettings.batteryOptimization.reducedBackgroundActivity = true;
    this.uxSettings.notificationSettings.notificationFrequency = 'hourly';
    optimizations.push('Enabled battery saving mode');
  }
  
  // Check device type and adjust settings
  if (this.deviceInfo.deviceType === 'mobile') {
    this.uxSettings.navigationOptimization.enableBottomNavigation = true;
    this.uxSettings.touchOptimization.touchTargetSize = Math.max(44, this.uxSettings.touchOptimization.touchTargetSize);
    optimizations.push('Optimized for mobile touch interface');
  }
  
  return optimizations;
};

// Method to record performance metrics
MobileOptimizationSchema.methods.recordMetrics = function(metrics) {
  // Update performance metrics
  if (metrics.pageLoad) {
    this.performanceMetrics.pageLoadMetrics = {
      ...this.performanceMetrics.pageLoadMetrics,
      ...metrics.pageLoad
    };
  }
  
  if (metrics.interaction) {
    this.performanceMetrics.interactionMetrics = {
      ...this.performanceMetrics.interactionMetrics,
      ...metrics.interaction
    };
  }
  
  if (metrics.network) {
    this.performanceMetrics.networkMetrics = {
      ...this.performanceMetrics.networkMetrics,
      ...metrics.network
    };
  }
  
  if (metrics.resources) {
    this.performanceMetrics.resourceMetrics = {
      ...this.performanceMetrics.resourceMetrics,
      ...metrics.resources
    };
  }
  
  this.lastOptimizationCheck = new Date();
  
  return this.save();
};

// Method to get optimization recommendations
MobileOptimizationSchema.methods.getRecommendations = function() {
  const recommendations = [];
  const metrics = this.performanceMetrics;
  
  // Page load recommendations
  if (metrics.pageLoadMetrics && metrics.pageLoadMetrics.firstContentfulPaint > 2500) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'Improve page load speed',
      description: 'Your pages are loading slowly. Consider enabling image optimization and compression.',
      actions: ['Enable WebP images', 'Increase compression level', 'Enable lazy loading']
    });
  }
  
  // Battery usage recommendations
  if (metrics.resourceMetrics && metrics.resourceMetrics.batteryUsage > 15) {
    recommendations.push({
      type: 'battery',
      priority: 'medium',
      title: 'Reduce battery usage',
      description: 'The app is using more battery than expected.',
      actions: ['Enable battery saver mode', 'Reduce background activity', 'Optimize polling frequency']
    });
  }
  
  // Memory usage recommendations
  if (metrics.resourceMetrics && metrics.resourceMetrics.memoryUsage > 150) {
    recommendations.push({
      type: 'memory',
      priority: 'medium',
      title: 'Optimize memory usage',
      description: 'Memory usage is higher than recommended.',
      actions: ['Enable content caching', 'Reduce image sizes', 'Enable lazy loading']
    });
  }
  
  // User experience recommendations
  if (metrics.interactionMetrics && metrics.interactionMetrics.bounceRate > 60) {
    recommendations.push({
      type: 'ux',
      priority: 'high',
      title: 'Improve user experience',
      description: 'Users are leaving quickly. Consider UX improvements.',
      actions: ['Optimize navigation', 'Improve content loading', 'Enhance touch interactions']
    });
  }
  
  return recommendations;
};

// Static method to find users needing optimization
MobileOptimizationSchema.statics.findUsersNeedingOptimization = function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.find({
    $or: [
      { lastOptimizationCheck: { $lt: oneDayAgo } },
      { 'performanceMetrics.pageLoadMetrics.firstContentfulPaint': { $gt: 3000 } },
      { 'performanceMetrics.resourceMetrics.batteryUsage': { $gt: 15 } },
      { 'performanceMetrics.interactionMetrics.bounceRate': { $gt: 70 } }
    ]
  });
};

// Static method to get global optimization statistics
MobileOptimizationSchema.statics.getGlobalStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        averagePerformanceScore: { $avg: '$performanceScore' },
        deviceTypes: {
          $push: '$deviceInfo.deviceType'
        },
        operatingSystems: {
          $push: '$deviceInfo.operatingSystem'
        },
        averageLoadTime: {
          $avg: '$performanceMetrics.pageLoadMetrics.firstContentfulPaint'
        },
        averageBatteryUsage: {
          $avg: '$performanceMetrics.resourceMetrics.batteryUsage'
        }
      }
    }
  ]);
};

module.exports = mongoose.model('MobileOptimization', MobileOptimizationSchema);