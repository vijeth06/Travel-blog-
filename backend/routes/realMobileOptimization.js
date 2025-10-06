const express = require('express');
const router = express.Router();
const RealMobileOptimizationController = require('../controllers/realMobileOptimizationController');

// Debug: log controller methods
console.log('Available mobile controller methods:', Object.getOwnPropertyNames(RealMobileOptimizationController));
console.log('Mobile controller prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(RealMobileOptimizationController)));
console.log('Mobile controller initializeOptimization type:', typeof RealMobileOptimizationController.initializeOptimization);
console.log('Mobile controller constructor name:', RealMobileOptimizationController.constructor.name);

const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for mobile optimization operations
const mobileOptimizationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 optimization requests per windowMs
  message: {
    success: false,
    message: 'Too many optimization requests, please try again later'
  }
});

// Rate limiting for metrics recording (more permissive)
const metricsRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 metrics recordings per minute
  message: {
    success: false,
    message: 'Too many metrics requests, please try again later'
  }
});

// Rate limiting for content optimization (more restrictive)
const contentRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 content optimizations per minute
  message: {
    success: false,
    message: 'Too many content optimization requests, please try again later'
  }
});

/**
 * @route   POST /api/mobile/optimize/init
 * @desc    Initialize mobile optimization for user with device information
 * @access  Private
 * @body    { deviceType, operatingSystem, browser, screenResolution, connectionType, etc. }
 */
router.post('/optimize/init', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.initializeOptimization.bind(RealMobileOptimizationController)
);

/**
 * @route   GET /api/mobile/optimize/status
 * @desc    Get current optimization status and settings summary
 * @access  Private
 */
router.get('/optimize/status', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.getOptimizationStatus
);

/**
 * @route   PUT /api/mobile/optimize/device
 * @desc    Update device information and trigger re-optimization if needed
 * @access  Private
 * @body    { deviceType, operatingSystem, connectionSpeed, isLowPowerMode, etc. }
 */
router.put('/optimize/device', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.updateDeviceInfo
);

/**
 * @route   POST /api/mobile/optimize/metrics
 * @desc    Record performance metrics for optimization analysis
 * @access  Private
 * @body    { pageLoad: {...}, interaction: {...}, network: {...}, resources: {...} }
 */
router.post('/optimize/metrics', 
  auth, 
  metricsRateLimit, 
  RealMobileOptimizationController.recordMetrics
);

/**
 * @route   POST /api/mobile/optimize/content
 * @desc    Get optimized content based on device capabilities and settings
 * @access  Private
 * @body    { contentType: 'blog'|'image'|'video'|'list', content: {...} }
 */
router.post('/optimize/content', 
  auth, 
  contentRateLimit, 
  RealMobileOptimizationController.getOptimizedContent
);

/**
 * @route   GET /api/mobile/optimize/analytics
 * @desc    Get performance analytics and optimization trends
 * @access  Private
 * @params  ?period=30d (7d, 30d, 90d, 1y)
 */
router.get('/optimize/analytics', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.getAnalytics
);

/**
 * @route   PUT /api/mobile/optimize/settings
 * @desc    Update optimization settings manually
 * @access  Private
 * @body    { performanceSettings: {...}, uxSettings: {...}, mobileFeatures: {...} }
 */
router.put('/optimize/settings', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.updateSettings
);

/**
 * @route   GET /api/mobile/optimize/recommendations
 * @desc    Get personalized optimization recommendations
 * @access  Private
 */
router.get('/optimize/recommendations', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.getRecommendations
);

/**
 * @route   POST /api/mobile/optimize/auto
 * @desc    Apply automatic optimizations based on current conditions
 * @access  Private
 */
router.post('/optimize/auto', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.applyAutoOptimizations
);

/**
 * @route   GET /api/mobile/optimize/presets
 * @desc    Get optimization presets for different use cases
 * @access  Private
 */
router.get('/optimize/presets', 
  auth, 
  RealMobileOptimizationController.getOptimizationPresets
);

/**
 * @route   POST /api/mobile/optimize/preset/:presetName
 * @desc    Apply optimization preset
 * @access  Private
 * @params  presetName: battery_saver|speed_boost|data_saver|balanced|accessibility
 */
router.post('/optimize/preset/:presetName', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.applyPreset
);

/**
 * @route   POST /api/mobile/optimize/feedback
 * @desc    Submit user feedback on optimization performance
 * @access  Private
 * @body    { performanceRating: 1-5, usabilityRating: 1-5, batteryRating: 1-5, comments: string }
 */
router.post('/optimize/feedback', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.submitFeedback
);

/**
 * @route   GET /api/mobile/optimize/compare
 * @desc    Compare optimization settings and their impact over time
 * @access  Private
 */
router.get('/optimize/compare', 
  auth, 
  mobileOptimizationRateLimit, 
  RealMobileOptimizationController.compareOptimizations
);

// ==================== UTILITY ENDPOINTS ====================

/**
 * @route   GET /api/mobile/device-detect
 * @desc    Detect device capabilities and characteristics
 * @access  Private
 */
router.get('/device-detect', auth, (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const acceptHeader = req.headers['accept'] || '';
    
    // Simple device detection based on user agent
    const deviceInfo = {
      deviceType: 'desktop',
      operatingSystem: 'unknown',
      browser: 'unknown',
      capabilities: {
        webp: acceptHeader.includes('image/webp'),
        avif: acceptHeader.includes('image/avif'),
        touchSupport: false,
        serviceWorker: true, // Assume modern browser
        pushNotifications: true,
        geolocation: true
      }
    };
    
    // Detect device type
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceInfo.deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
      deviceInfo.capabilities.touchSupport = true;
    }
    
    // Detect operating system
    if (/iPhone|iPad/.test(userAgent)) {
      deviceInfo.operatingSystem = 'ios';
    } else if (/Android/.test(userAgent)) {
      deviceInfo.operatingSystem = 'android';
    } else if (/Windows/.test(userAgent)) {
      deviceInfo.operatingSystem = 'windows';
    } else if (/Mac/.test(userAgent)) {
      deviceInfo.operatingSystem = 'macos';
    } else if (/Linux/.test(userAgent)) {
      deviceInfo.operatingSystem = 'linux';
    }
    
    // Detect browser
    if (/Chrome/.test(userAgent)) {
      deviceInfo.browser = 'chrome';
    } else if (/Firefox/.test(userAgent)) {
      deviceInfo.browser = 'firefox';
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      deviceInfo.browser = 'safari';
    } else if (/Edge/.test(userAgent)) {
      deviceInfo.browser = 'edge';
    }
    
    res.json({
      success: true,
      message: 'Device information detected',
      data: {
        deviceInfo,
        recommendations: [
          deviceInfo.deviceType === 'mobile' ? 'Enable mobile-specific optimizations' : null,
          !deviceInfo.capabilities.webp ? 'Browser may not support WebP images' : null,
          deviceInfo.capabilities.touchSupport ? 'Enable touch-friendly interface' : null
        ].filter(Boolean),
        suggestedSettings: {
          enableMobileOptimizations: deviceInfo.deviceType === 'mobile',
          enableWebP: deviceInfo.capabilities.webp,
          enableTouchOptimizations: deviceInfo.capabilities.touchSupport,
          enableServiceWorker: deviceInfo.capabilities.serviceWorker
        }
      }
    });
    
  } catch (error) {
    console.error('❌ MOBILE: Device detection failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Device detection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/mobile/connection-test
 * @desc    Test connection speed and quality
 * @access  Private
 */
router.post('/connection-test', auth, async (req, res) => {
  try {
    const { startTime, endTime, bytesTransferred } = req.body;
    
    if (!startTime || !endTime || !bytesTransferred) {
      return res.status(400).json({
        success: false,
        message: 'startTime, endTime, and bytesTransferred are required'
      });
    }
    
    const duration = endTime - startTime; // milliseconds
    const speedBps = (bytesTransferred * 8) / (duration / 1000); // bits per second
    const speedKbps = speedBps / 1000;
    const speedMbps = speedKbps / 1000;
    
    // Classify connection speed
    let connectionType = 'wifi';
    let connectionSpeed = 'fast';
    
    if (speedMbps < 0.5) {
      connectionType = 'slow-2g';
      connectionSpeed = 'slow';
    } else if (speedMbps < 1.6) {
      connectionType = '2g';
      connectionSpeed = 'slow';
    } else if (speedMbps < 10) {
      connectionType = '3g';
      connectionSpeed = 'moderate';
    } else if (speedMbps < 50) {
      connectionType = '4g';
      connectionSpeed = 'fast';
    }
    
    // Provide optimization recommendations based on speed
    const recommendations = [];
    
    if (connectionSpeed === 'slow') {
      recommendations.push('Enable high image compression');
      recommendations.push('Enable data saver mode');
      recommendations.push('Enable offline content caching');
    } else if (connectionSpeed === 'moderate') {
      recommendations.push('Enable medium image compression');
      recommendations.push('Enable content preloading');
    }
    
    res.json({
      success: true,
      message: 'Connection test completed',
      data: {
        speed: {
          bps: Math.round(speedBps),
          kbps: Math.round(speedKbps * 100) / 100,
          mbps: Math.round(speedMbps * 100) / 100
        },
        connectionType,
        connectionSpeed,
        duration,
        bytesTransferred,
        recommendations,
        suggestedSettings: {
          imageCompressionLevel: connectionSpeed === 'slow' ? 'high' : connectionSpeed === 'moderate' ? 'medium' : 'low',
          enableDataSaver: connectionSpeed === 'slow',
          enableOfflineMode: connectionSpeed === 'slow',
          enablePreloading: connectionSpeed !== 'slow'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ MOBILE: Connection test failed:', error.message);
    res.status(400).json({
      success: false,
      message: 'Connection test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Bad request'
    });
  }
});

/**
 * @route   GET /api/mobile/optimization-tips
 * @desc    Get general mobile optimization tips and best practices
 * @access  Public
 */
router.get('/optimization-tips', (req, res) => {
  try {
    const tips = {
      performance: [
        {
          category: 'Images',
          tip: 'Use WebP format for images when supported',
          impact: 'high',
          description: 'WebP images are 25-50% smaller than JPEG with same quality'
        },
        {
          category: 'Loading',
          tip: 'Enable lazy loading for images and content',
          impact: 'high',
          description: 'Load content only when needed to improve initial page load'
        },
        {
          category: 'Caching',
          tip: 'Implement aggressive caching strategies',
          impact: 'medium',
          description: 'Cache static content and API responses to reduce server requests'
        },
        {
          category: 'Compression',
          tip: 'Enable Gzip/Brotli compression',
          impact: 'medium',
          description: 'Compress text-based content to reduce transfer size'
        }
      ],
      
      battery: [
        {
          category: 'Animations',
          tip: 'Reduce animations when battery is low',
          impact: 'medium',
          description: 'CSS animations consume CPU and drain battery faster'
        },
        {
          category: 'Background Activity',
          tip: 'Minimize background processing',
          impact: 'high',
          description: 'Reduce polling, timers, and background sync when on battery'
        },
        {
          category: 'Display',
          tip: 'Use dark mode when possible',
          impact: 'low',
          description: 'Dark pixels consume less energy on OLED screens'
        }
      ],
      
      ux: [
        {
          category: 'Touch Targets',
          tip: 'Make touch targets at least 44px',
          impact: 'high',
          description: 'Ensures easy interaction with fingers on mobile devices'
        },
        {
          category: 'Navigation',
          tip: 'Use bottom navigation on mobile',
          impact: 'medium',
          description: 'Easier to reach with thumbs on larger mobile screens'
        },
        {
          category: 'Text',
          tip: 'Use readable font sizes (16px minimum)',
          impact: 'high',
          description: 'Prevents need for zooming and improves readability'
        }
      ],
      
      data: [
        {
          category: 'Images',
          tip: 'Serve appropriately sized images',
          impact: 'high',
          description: 'Don\'t serve desktop-sized images to mobile devices'
        },
        {
          category: 'Preloading',
          tip: 'Preload critical resources only',
          impact: 'medium',
          description: 'Balance between performance and data usage'
        },
        {
          category: 'API Calls',
          tip: 'Batch API requests when possible',
          impact: 'medium',
          description: 'Reduce number of network requests to save data'
        }
      ]
    };
    
    res.json({
      success: true,
      message: 'Mobile optimization tips retrieved successfully',
      data: {
        tips,
        totalTips: Object.values(tips).reduce((sum, category) => sum + category.length, 0),
        categories: Object.keys(tips),
        description: 'Best practices for mobile web optimization covering performance, battery life, user experience, and data usage'
      }
    });
    
  } catch (error) {
    console.error('❌ MOBILE: Get tips failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve optimization tips',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/mobile/health
 * @desc    Health check for mobile optimization service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile Optimization Service is operational',
    data: {
      status: 'healthy',
      version: '1.0.0',
      features: [
        'Device-specific optimizations',
        'Performance monitoring',
        'Content optimization',
        'Battery usage optimization',
        'Adaptive behavior',
        'Offline capabilities',
        'Progressive Web App features',
        'Accessibility improvements',
        'Analytics and insights'
      ],
      supportedDevices: ['mobile', 'tablet', 'desktop'],
      supportedOS: ['ios', 'android', 'windows', 'macos', 'linux'],
      optimizationTypes: [
        'Image optimization',
        'Content compression',
        'Battery saving',
        'Speed enhancement',
        'Data saving',
        'Accessibility',
        'Touch optimization'
      ],
      uptime: process.uptime(),
      timestamp: new Date()
    }
  });
});

module.exports = router;