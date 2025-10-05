const MobileOptimization = require('../models/MobileOptimization');
const User = require('../models/User');

class RealMobileOptimizationService {
  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the mobile optimization service
   */
  initializeService() {
    console.log('📱 MOBILE: Optimization service initializing...');
    
    // Start background optimization tasks
    this.startOptimizationScheduler();
    this.startPerformanceMonitoring();
    this.startAdaptiveBehaviorManager();
    
    console.log('✅ MOBILE: Optimization service initialized successfully');
  }

  /**
   * Optimize content and settings for specific device
   */
  static async optimizeForDevice(userId, deviceData) {
    try {
      console.log(`📱 Optimizing for device: ${deviceData.userAgent || 'unknown device'}`);
      
      const deviceInfo = this.parseDeviceInfo(deviceData.userAgent);
      
      const optimization = {
        userId,
        deviceType: deviceInfo.deviceType,
        screenSize: {
          width: deviceData.screenWidth,
          height: deviceData.screenHeight,
          pixelRatio: deviceData.devicePixelRatio
        },
        connectionType: deviceData.connectionType,
        optimizations: {
          imageQuality: this.getOptimalImageQuality(deviceData),
          contentLength: this.getOptimalContentLength(deviceInfo.deviceType),
          loadPriority: this.getLoadPriority(deviceData.connectionType)
        },
        timestamp: new Date()
      };
      
      // Save optimization settings
      await MobileOptimization.findOneAndUpdate(
        { user: userId },
        optimization,
        { upsert: true, new: true }
      );
      
      return {
        success: true,
        data: {
          optimization,
          recommendations: this.generateOptimizationRecommendations(optimization)
        }
      };
      
    } catch (error) {
      console.error(`❌ Device optimization error:`, error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Record performance metrics
   */
  static async recordPerformanceMetrics(userId, performanceData) {
    try {
      const metrics = {
        userId,
        loadTime: performanceData.loadTime,
        renderTime: performanceData.renderTime,
        interactionTime: performanceData.interactionTime,
        timestamp: new Date()
      };
      
      // Update mobile optimization with performance data
      await MobileOptimization.findOneAndUpdate(
        { user: userId },
        { 
          $push: { 
            performanceHistory: {
              $each: [metrics],
              $slice: -50 // Keep last 50 metrics
            }
          }
        },
        { upsert: true }
      );
      
      return {
        success: true,
        data: { metrics }
      };
      
    } catch (error) {
      console.error(`❌ Performance metrics error:`, error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Parse device info from user agent
   */
  static parseDeviceInfo(userAgent) {
    if (!userAgent) {
      return { deviceType: 'mobile', browser: 'unknown', os: 'unknown' };
    }

    const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop';
    const browser = userAgent.includes('Chrome') ? 'chrome' : 
                   userAgent.includes('Firefox') ? 'firefox' : 
                   userAgent.includes('Safari') ? 'safari' : 'unknown';
    const os = userAgent.includes('Android') ? 'android' : 
               userAgent.includes('iPhone') ? 'ios' : 
               userAgent.includes('Windows') ? 'windows' : 'unknown';

    return { deviceType, browser, os };
  }

  /**
   * Get optimal image quality for device
   */
  static getOptimalImageQuality(deviceData) {
    const { connectionType, screenWidth, devicePixelRatio } = deviceData;
    
    let quality = 80; // Default quality
    
    // Adjust for connection type
    if (connectionType === '2g') quality = 40;
    else if (connectionType === '3g') quality = 60;
    else if (connectionType === '4g') quality = 80;
    else if (connectionType === '5g' || connectionType === 'wifi') quality = 90;
    
    // Adjust for screen resolution
    if (screenWidth > 1920 && devicePixelRatio > 2) quality = Math.min(quality + 10, 95);
    else if (screenWidth < 768) quality = Math.max(quality - 10, 30);
    
    return quality;
  }

  /**
   * Get optimal content length for device type
   */
  static getOptimalContentLength(deviceType) {
    return deviceType === 'mobile' ? 200 : 500; // Characters
  }

  /**
   * Get load priority for connection type
   */
  static getLoadPriority(connectionType) {
    const priorities = {
      '2g': ['text', 'critical-images'],
      '3g': ['text', 'critical-images', 'images'],
      '4g': ['text', 'images', 'videos'],
      '5g': ['text', 'images', 'videos', 'animations'],
      'wifi': ['text', 'images', 'videos', 'animations', 'interactive']
    };
    
    return priorities[connectionType] || priorities['4g'];
  }

  /**
   * Generate optimization recommendations
   */
  static generateOptimizationRecommendations(optimization) {
    const recommendations = [];
    
    if (optimization.optimizations.imageQuality < 60) {
      recommendations.push({
        type: 'image_compression',
        message: 'Images will be compressed for faster loading'
      });
    }
    
    if (optimization.deviceType === 'mobile') {
      recommendations.push({
        type: 'mobile_layout',
        message: 'Layout optimized for mobile viewing'
      });
    }
    
    if (optimization.connectionType === '2g' || optimization.connectionType === '3g') {
      recommendations.push({
        type: 'data_saving',
        message: 'Data saving mode enabled for slow connections'
      });
    }
    
    return recommendations;
  }

  /**
   * Initialize mobile optimization for a user
   */
  async initializeUserOptimization(userId, deviceInfo) {
    try {
      console.log(`📱 MOBILE: Initializing optimization for user ${userId}`);
      
      // Check if optimization already exists
      let optimization = await MobileOptimization.findOne({ user: userId });
      
      if (optimization) {
        // Update device info if provided
        if (deviceInfo) {
          optimization.deviceInfo = { ...optimization.deviceInfo, ...deviceInfo };
          await optimization.save();
        }
        
        console.log(`📱 MOBILE: Existing optimization updated for user ${userId}`);
        return optimization;
      }
      
      // Create new optimization profile
      optimization = new MobileOptimization({
        user: userId,
        deviceInfo: {
          deviceType: deviceInfo?.deviceType || 'mobile',
          operatingSystem: deviceInfo?.operatingSystem || 'android',
          browser: deviceInfo?.browser || 'chrome',
          browserVersion: deviceInfo?.browserVersion || '91.0',
          screenResolution: deviceInfo?.screenResolution || { width: 375, height: 667 },
          devicePixelRatio: deviceInfo?.devicePixelRatio || 2,
          connectionType: deviceInfo?.connectionType || 'wifi',
          connectionSpeed: deviceInfo?.connectionSpeed || 'fast'
        }
      });
      
      // Apply initial optimizations based on device
      await this.applyInitialOptimizations(optimization);
      
      await optimization.save();
      
      console.log(`✅ MOBILE: New optimization profile created for user ${userId}`);
      
      return optimization;
      
    } catch (error) {
      console.error('❌ MOBILE: Initialize optimization failed:', error.message);
      throw error;
    }
  }

  /**
   * Update device information and re-optimize
   */
  async updateDeviceInfo(userId, deviceInfo) {
    try {
      console.log(`📱 MOBILE: Updating device info for user ${userId}`);
      
      const optimization = await MobileOptimization.findOne({ user: userId });
      
      if (!optimization) {
        throw new Error('Optimization profile not found');
      }
      
      // Store previous device info for comparison
      const previousDeviceInfo = { ...optimization.deviceInfo };
      
      // Update device info
      optimization.deviceInfo = { ...optimization.deviceInfo, ...deviceInfo };
      
      // Check if significant changes require re-optimization
      const needsReOptimization = this.checkSignificantDeviceChange(previousDeviceInfo, deviceInfo);
      
      if (needsReOptimization) {
        await this.applyAdaptiveOptimizations(optimization);
        
        optimization.optimizationHistory.push({
          action: 'Device Update Re-optimization',
          reason: 'Significant device change detected',
          settings: { deviceInfo },
          date: new Date()
        });
      }
      
      optimization.lastOptimizationCheck = new Date();
      await optimization.save();
      
      console.log(`✅ MOBILE: Device info updated and optimized for user ${userId}`);
      
      return {
        success: true,
        optimization: optimization.toObject(),
        reOptimized: needsReOptimization
      };
      
    } catch (error) {
      console.error('❌ MOBILE: Update device info failed:', error.message);
      throw error;
    }
  }

  /**
   * Record performance metrics
   */
  async recordPerformanceMetrics(userId, metrics) {
    try {
      console.log(`📊 MOBILE: Recording performance metrics for user ${userId}`);
      
      const optimization = await MobileOptimization.findOne({ user: userId });
      
      if (!optimization) {
        throw new Error('Optimization profile not found');
      }
      
      // Record metrics
      await optimization.recordMetrics(metrics);
      
      // Check if performance has degraded and needs optimization
      const performanceScore = optimization.performanceScore;
      
      if (performanceScore < 60) {
        console.log(`⚠️ MOBILE: Performance degraded (score: ${performanceScore}), applying optimizations`);
        await this.applyAdaptiveOptimizations(optimization);
        
        optimization.optimizationHistory.push({
          action: 'Performance-based Optimization',
          reason: `Performance score dropped to ${performanceScore}`,
          settings: { metrics },
          date: new Date()
        });
        
        await optimization.save();
      }
      
      console.log(`✅ MOBILE: Performance metrics recorded (score: ${performanceScore})`);
      
      return {
        success: true,
        performanceScore,
        recommendations: optimization.getRecommendations()
      };
      
    } catch (error) {
      console.error('❌ MOBILE: Record metrics failed:', error.message);
      throw error;
    }
  }

  /**
   * Get optimized content based on device capabilities
   */
  async getOptimizedContent(userId, contentType, originalContent) {
    try {
      console.log(`🎨 MOBILE: Getting optimized content for user ${userId}, type: ${contentType}`);
      
      const optimization = await MobileOptimization.findOne({ user: userId });
      
      if (!optimization) {
        // Return original content if no optimization profile
        return originalContent;
      }
      
      let optimizedContent = { ...originalContent };
      
      // Apply optimizations based on content type
      switch (contentType) {
        case 'blog':
          optimizedContent = await this.optimizeBlogContent(optimization, originalContent);
          break;
          
        case 'image':
          optimizedContent = await this.optimizeImageContent(optimization, originalContent);
          break;
          
        case 'video':
          optimizedContent = await this.optimizeVideoContent(optimization, originalContent);
          break;
          
        case 'list':
          optimizedContent = await this.optimizeListContent(optimization, originalContent);
          break;
          
        default:
          optimizedContent = await this.optimizeGenericContent(optimization, originalContent);
      }
      
      console.log(`✅ MOBILE: Content optimized for ${contentType}`);
      
      return optimizedContent;
      
    } catch (error) {
      console.error('❌ MOBILE: Content optimization failed:', error.message);
      return originalContent; // Fallback to original content
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(userId, period = '30d') {
    try {
      console.log(`📊 MOBILE: Getting performance analytics for user ${userId}, period: ${period}`);
      
      const optimization = await MobileOptimization.findOne({ user: userId });
      
      if (!optimization) {
        throw new Error('Optimization profile not found');
      }
      
      const days = this.parsePeriod(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Filter optimization history for the period
      const relevantHistory = optimization.optimizationHistory.filter(
        h => h.date >= startDate
      );
      
      // Calculate analytics
      const analytics = {
        period,
        performanceScore: optimization.performanceScore,
        optimizationStatus: optimization.optimizationStatus,
        
        // Performance trends
        loadTimeMetrics: {
          current: optimization.performanceMetrics.pageLoadMetrics?.firstContentfulPaint || 0,
          target: 2500,
          trend: this.calculateTrend(relevantHistory, 'loadTime')
        },
        
        batteryMetrics: {
          current: optimization.performanceMetrics.resourceMetrics?.batteryUsage || 0,
          target: 10,
          trend: this.calculateTrend(relevantHistory, 'batteryUsage')
        },
        
        memoryMetrics: {
          current: optimization.performanceMetrics.resourceMetrics?.memoryUsage || 0,
          target: 100,
          trend: this.calculateTrend(relevantHistory, 'memoryUsage')
        },
        
        // User experience metrics
        userExperience: {
          bounceRate: optimization.performanceMetrics.interactionMetrics?.bounceRate || 0,
          sessionDuration: optimization.performanceMetrics.interactionMetrics?.averageSessionDuration || 0,
          pagesPerSession: optimization.performanceMetrics.interactionMetrics?.pagesPerSession || 0
        },
        
        // Optimization history
        optimizationHistory: relevantHistory.slice(-10), // Last 10 optimizations
        
        // Recommendations
        recommendations: optimization.getRecommendations(),
        
        // Device info
        deviceInfo: optimization.deviceInfo,
        
        // Settings summary
        settingsSummary: {
          imageOptimization: optimization.performanceSettings.imageOptimization.compressionLevel,
          contentCaching: optimization.performanceSettings.contentOptimization.enableContentCaching,
          batteryOptimization: optimization.performanceSettings.batteryOptimization.enableBatterySaver,
          offlineMode: optimization.mobileFeatures.offlineCapabilities.enableOfflineReading
        }
      };
      
      console.log(`✅ MOBILE: Performance analytics generated`);
      
      return {
        success: true,
        analytics
      };
      
    } catch (error) {
      console.error('❌ MOBILE: Get analytics failed:', error.message);
      throw error;
    }
  }

  /**
   * Apply specific optimization settings
   */
  async applyOptimizationSettings(userId, settings) {
    try {
      console.log(`⚙️ MOBILE: Applying optimization settings for user ${userId}`);
      
      const optimization = await MobileOptimization.findOne({ user: userId });
      
      if (!optimization) {
        throw new Error('Optimization profile not found');
      }
      
      // Store previous settings for comparison
      const previousSettings = {
        performanceSettings: { ...optimization.performanceSettings },
        uxSettings: { ...optimization.uxSettings },
        mobileFeatures: { ...optimization.mobileFeatures }
      };
      
      // Apply new settings
      if (settings.performanceSettings) {
        optimization.performanceSettings = {
          ...optimization.performanceSettings,
          ...settings.performanceSettings
        };
      }
      
      if (settings.uxSettings) {
        optimization.uxSettings = {
          ...optimization.uxSettings,
          ...settings.uxSettings
        };
      }
      
      if (settings.mobileFeatures) {
        optimization.mobileFeatures = {
          ...optimization.mobileFeatures,
          ...settings.mobileFeatures
        };
      }
      
      // Record the optimization change
      optimization.optimizationHistory.push({
        action: 'Manual Settings Update',
        reason: 'User-requested optimization settings change',
        settings: {
          previous: previousSettings,
          new: settings
        },
        date: new Date()
      });
      
      optimization.lastOptimizationCheck = new Date();
      await optimization.save();
      
      console.log(`✅ MOBILE: Optimization settings applied successfully`);
      
      return {
        success: true,
        optimization: optimization.toObject(),
        message: 'Optimization settings applied successfully'
      };
      
    } catch (error) {
      console.error('❌ MOBILE: Apply settings failed:', error.message);
      throw error;
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(userId) {
    try {
      console.log(`💡 MOBILE: Getting optimization recommendations for user ${userId}`);
      
      const optimization = await MobileOptimization.findOne({ user: userId });
      
      if (!optimization) {
        throw new Error('Optimization profile not found');
      }
      
      const recommendations = optimization.getRecommendations();
      
      // Add device-specific recommendations
      const deviceRecommendations = this.getDeviceSpecificRecommendations(optimization);
      recommendations.push(...deviceRecommendations);
      
      // Add usage pattern recommendations
      const usageRecommendations = this.getUsagePatternRecommendations(optimization);
      recommendations.push(...usageRecommendations);
      
      // Sort by priority
      recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      console.log(`✅ MOBILE: Generated ${recommendations.length} recommendations`);
      
      return {
        success: true,
        recommendations: recommendations.slice(0, 10), // Top 10 recommendations
        performanceScore: optimization.performanceScore,
        optimizationStatus: optimization.optimizationStatus
      };
      
    } catch (error) {
      console.error('❌ MOBILE: Get recommendations failed:', error.message);
      throw error;
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Apply initial optimizations based on device
   */
  async applyInitialOptimizations(optimization) {
    const deviceInfo = optimization.deviceInfo;
    
    // Optimize based on device type
    if (deviceInfo.deviceType === 'mobile') {
      optimization.uxSettings.navigationOptimization.enableBottomNavigation = true;
      optimization.uxSettings.touchOptimization.touchTargetSize = 44;
      optimization.performanceSettings.imageOptimization.maxImageWidth = 800;
    } else if (deviceInfo.deviceType === 'tablet') {
      optimization.uxSettings.navigationOptimization.enableSideDrawer = true;
      optimization.performanceSettings.imageOptimization.maxImageWidth = 1200;
    }
    
    // Optimize based on connection speed
    if (deviceInfo.connectionSpeed === 'slow') {
      optimization.performanceSettings.imageOptimization.compressionLevel = 'high';
      optimization.performanceSettings.contentOptimization.enableMinification = true;
      optimization.adaptiveBehavior.bandwidthManagement.enableDataSaver = true;
    }
    
    // Optimize based on operating system
    if (deviceInfo.operatingSystem === 'ios') {
      optimization.uxSettings.displayOptimization.fontSizeMultiplier = 1.0;
      optimization.mobileFeatures.appFeatures.enablePWA = true;
    } else if (deviceInfo.operatingSystem === 'android') {
      optimization.uxSettings.displayOptimization.fontSizeMultiplier = 1.1;
      optimization.mobileFeatures.appFeatures.enableHomeScreenInstall = true;
    }
    
    return optimization;
  }

  /**
   * Apply adaptive optimizations based on current conditions
   */
  async applyAdaptiveOptimizations(optimization) {
    const autoOptimizations = optimization.applyAutoOptimizations();
    
    // Additional adaptive optimizations based on performance metrics
    const metrics = optimization.performanceMetrics;
    
    if (metrics.pageLoadMetrics && metrics.pageLoadMetrics.firstContentfulPaint > 3000) {
      optimization.performanceSettings.imageOptimization.enableLazyLoading = true;
      optimization.performanceSettings.contentOptimization.enableMinification = true;
      optimization.performanceSettings.loadingOptimization.enableProgressiveLoading = true;
    }
    
    if (metrics.resourceMetrics && metrics.resourceMetrics.batteryUsage > 15) {
      optimization.performanceSettings.batteryOptimization.enableBatterySaver = true;
      optimization.performanceSettings.batteryOptimization.reducedAnimations = true;
      optimization.uxSettings.notificationSettings.notificationFrequency = 'daily';
    }
    
    if (metrics.networkMetrics && metrics.networkMetrics.errorRate > 10) {
      optimization.mobileFeatures.offlineCapabilities.enableOfflineReading = true;
      optimization.adaptiveBehavior.bandwidthManagement.enableBackgroundSync = false;
    }
    
    return autoOptimizations;
  }

  /**
   * Check if device changes require re-optimization
   */
  checkSignificantDeviceChange(previous, current) {
    const significantChanges = [
      previous.deviceType !== current.deviceType,
      previous.operatingSystem !== current.operatingSystem,
      previous.connectionSpeed !== current.connectionSpeed,
      Math.abs((previous.screenResolution?.width || 0) - (current.screenResolution?.width || 0)) > 100
    ];
    
    return significantChanges.some(change => change);
  }

  /**
   * Content optimization methods
   */
  async optimizeBlogContent(optimization, content) {
    const optimized = { ...content };
    
    // Optimize text display
    if (optimization.uxSettings.displayOptimization.fontSizeMultiplier !== 1.0) {
      optimized.fontSize = `${optimization.uxSettings.displayOptimization.fontSizeMultiplier}em`;
    }
    
    // Optimize for reading mode
    if (optimization.deviceInfo.connectionSpeed === 'slow') {
      optimized.removeNonEssentialElements = true;
      optimized.preloadNextArticle = false;
    }
    
    // Optimize for dark mode
    if (optimization.uxSettings.displayOptimization.enableDarkMode) {
      optimized.theme = 'dark';
    }
    
    return optimized;
  }

  async optimizeImageContent(optimization, content) {
    const optimized = { ...content };
    const imageSettings = optimization.performanceSettings.imageOptimization;
    
    // Apply image compression
    if (imageSettings.compressionLevel === 'high') {
      optimized.quality = 60;
    } else if (imageSettings.compressionLevel === 'medium') {
      optimized.quality = 80;
    }
    
    // Apply size constraints
    optimized.maxWidth = imageSettings.maxImageWidth;
    optimized.maxHeight = imageSettings.maxImageHeight;
    
    // Apply format optimization
    if (imageSettings.enableWebP) {
      optimized.preferredFormat = 'webp';
    }
    
    // Apply lazy loading
    if (imageSettings.enableLazyLoading) {
      optimized.lazyLoad = true;
    }
    
    return optimized;
  }

  async optimizeVideoContent(optimization, content) {
    const optimized = { ...content };
    
    // Optimize for connection speed
    if (optimization.deviceInfo.connectionSpeed === 'slow') {
      optimized.autoplay = false;
      optimized.preload = 'none';
      optimized.quality = 'low';
    } else if (optimization.deviceInfo.connectionSpeed === 'moderate') {
      optimized.quality = 'medium';
      optimized.preload = 'metadata';
    }
    
    // Battery optimization
    if (optimization.performanceSettings.batteryOptimization.enableBatterySaver) {
      optimized.autoplay = false;
      optimized.reducedQuality = true;
    }
    
    return optimized;
  }

  async optimizeListContent(optimization, content) {
    const optimized = { ...content };
    
    // Optimize pagination for mobile
    if (optimization.deviceInfo.deviceType === 'mobile') {
      optimized.itemsPerPage = Math.min(10, optimized.itemsPerPage || 20);
      optimized.enableInfiniteScroll = true;
    }
    
    // Optimize for slow connections
    if (optimization.deviceInfo.connectionSpeed === 'slow') {
      optimized.itemsPerPage = 5;
      optimized.preloadImages = false;
    }
    
    return optimized;
  }

  async optimizeGenericContent(optimization, content) {
    const optimized = { ...content };
    
    // Apply general optimizations based on settings
    if (optimization.performanceSettings.contentOptimization.enableMinification) {
      optimized.minified = true;
    }
    
    if (optimization.performanceSettings.contentOptimization.enableContentCaching) {
      optimized.cacheable = true;
      optimized.cacheTimeout = optimization.performanceSettings.contentOptimization.cacheTimeout;
    }
    
    return optimized;
  }

  /**
   * Get device-specific recommendations
   */
  getDeviceSpecificRecommendations(optimization) {
    const recommendations = [];
    const deviceInfo = optimization.deviceInfo;
    
    if (deviceInfo.deviceType === 'mobile' && !optimization.uxSettings.navigationOptimization.enableBottomNavigation) {
      recommendations.push({
        type: 'navigation',
        priority: 'medium',
        title: 'Enable bottom navigation',
        description: 'Bottom navigation improves usability on mobile devices',
        actions: ['Enable bottom navigation bar', 'Optimize for thumb-friendly interaction']
      });
    }
    
    if (deviceInfo.connectionSpeed === 'slow' && optimization.performanceSettings.imageOptimization.compressionLevel !== 'high') {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Increase image compression',
        description: 'High compression reduces data usage on slow connections',
        actions: ['Set compression to high', 'Enable WebP format', 'Reduce image dimensions']
      });
    }
    
    return recommendations;
  }

  /**
   * Get usage pattern recommendations
   */
  getUsagePatternRecommendations(optimization) {
    const recommendations = [];
    const metrics = optimization.performanceMetrics;
    
    if (metrics.interactionMetrics && metrics.interactionMetrics.averageSessionDuration < 60) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        title: 'Improve content engagement',
        description: 'Users are leaving quickly. Consider improving content loading and presentation.',
        actions: ['Optimize page load speed', 'Improve content layout', 'Add interactive elements']
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate performance trend
   */
  calculateTrend(history, metric) {
    if (history.length < 2) return 'stable';
    
    const recent = history.slice(-5);
    let improvements = 0;
    let degradations = 0;
    
    for (let i = 1; i < recent.length; i++) {
      const current = recent[i].performanceImpact?.after?.[metric] || 0;
      const previous = recent[i-1].performanceImpact?.after?.[metric] || 0;
      
      if (current < previous) improvements++;
      else if (current > previous) degradations++;
    }
    
    if (improvements > degradations) return 'improving';
    if (degradations > improvements) return 'degrading';
    return 'stable';
  }

  /**
   * Parse period string to days
   */
  parsePeriod(period) {
    const matches = period.match(/^(\d+)([hdwmy])$/);
    if (!matches) return 30;
    
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
  startOptimizationScheduler() {
    // Run optimization checks every hour
    setInterval(async () => {
      try {
        const usersNeedingOptimization = await MobileOptimization.findUsersNeedingOptimization();
        
        console.log(`📱 MOBILE: Processing optimization for ${usersNeedingOptimization.length} users`);
        
        for (const optimization of usersNeedingOptimization) {
          try {
            await this.applyAdaptiveOptimizations(optimization);
            optimization.lastOptimizationCheck = new Date();
            await optimization.save();
          } catch (error) {
            console.error(`❌ MOBILE: Auto-optimization failed for user ${optimization.user}:`, error.message);
          }
        }
        
      } catch (error) {
        console.error('❌ MOBILE: Optimization scheduler error:', error.message);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  startPerformanceMonitoring() {
    // Monitor performance metrics every 30 minutes
    setInterval(async () => {
      try {
        const stats = await MobileOptimization.getGlobalStats();
        console.log('📊 MOBILE: Global performance stats:', stats[0]);
      } catch (error) {
        console.error('❌ MOBILE: Performance monitoring error:', error.message);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  startAdaptiveBehaviorManager() {
    // Manage adaptive behavior every 15 minutes
    setInterval(async () => {
      try {
        const lowPerformanceUsers = await MobileOptimization.find({
          'performanceMetrics.pageLoadMetrics.firstContentfulPaint': { $gt: 5000 }
        }).limit(50);
        
        for (const optimization of lowPerformanceUsers) {
          // Apply aggressive optimizations for poor performance
          optimization.performanceSettings.imageOptimization.compressionLevel = 'max';
          optimization.performanceSettings.contentOptimization.enableMinification = true;
          optimization.adaptiveBehavior.bandwidthManagement.enableDataSaver = true;
          
          await optimization.save();
        }
        
      } catch (error) {
        console.error('❌ MOBILE: Adaptive behavior error:', error.message);
      }
    }, 15 * 60 * 1000); // 15 minutes
  }
}

module.exports = new RealMobileOptimizationService();