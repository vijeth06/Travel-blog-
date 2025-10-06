const mongoose = require('mongoose');

// Service Worker Schema for PWA caching
const serviceWorkerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  cacheVersion: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  cachedResources: [{
    url: String,
    type: {
      type: String,
      enum: ['static', 'dynamic', 'api', 'image', 'document']
    },
    size: Number, // bytes
    cachedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  syncQueue: [{
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE']
    },
    resourceType: String, // 'blog', 'booking', 'like', etc.
    resourceId: String,
    data: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    },
    retryCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'synced', 'failed'],
      default: 'pending'
    }
  }],
  settings: {
    maxCacheSize: {
      type: Number,
      default: 50 * 1024 * 1024 // 50MB
    },
    autoSync: {
      type: Boolean,
      default: true
    },
    backgroundSync: {
      type: Boolean,
      default: true
    },
    preloadContent: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Push Notification Schema
const pushNotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    maxlength: 300
  },
  icon: String,
  badge: String,
  image: String,
  data: mongoose.Schema.Types.Mixed, // Custom data payload
  
  // Notification targeting
  type: {
    type: String,
    enum: [
      'trip_reminder', 'booking_confirmation', 'weather_update', 'travel_tip',
      'blog_like', 'new_comment', 'travel_buddy', 'price_alert', 'itinerary_change',
      'emergency_alert', 'document_expiry', 'goal_achievement', 'promotional'
    ],
    required: true
  },
  
  // Scheduling
  scheduledFor: Date,
  sentAt: Date,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed', 'cancelled'],
    default: 'draft'
  },
  
  // Delivery settings
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  ttl: {
    type: Number,
    default: 2419200 // 28 days in seconds
  },
  
  // Interaction tracking
  delivered: {
    type: Boolean,
    default: false
  },
  clicked: {
    type: Boolean,
    default: false
  },
  clickedAt: Date,
  
  // Action buttons
  actions: [{
    action: String,
    title: String,
    icon: String
  }],
  
  // Targeting criteria
  targeting: {
    deviceTypes: [{
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    }],
    platforms: [{
      type: String,
      enum: ['android', 'ios', 'web']
    }],
    locations: [String],
    interests: [String],
    lastActivity: {
      since: Date,
      until: Date
    }
  }
}, {
  timestamps: true
});

// Device Registration Schema for push notifications
const deviceRegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  deviceInfo: {
    userAgent: String,
    platform: {
      type: String,
      enum: ['android', 'ios', 'web', 'windows', 'macos', 'linux']
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    },
    browser: String,
    version: String,
    language: String,
    timezone: String
  },
  preferences: {
    enabled: {
      type: Boolean,
      default: true
    },
    types: [{
      type: String,
      enum: [
        'trip_reminder', 'booking_confirmation', 'weather_update', 'travel_tip',
        'blog_like', 'new_comment', 'travel_buddy', 'price_alert', 'itinerary_change',
        'emergency_alert', 'document_expiry', 'goal_achievement', 'promotional'
      ]
    }],
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: String, // HH:mm format
      end: String, // HH:mm format
      timezone: String
    },
    frequency: {
      type: String,
      enum: ['immediate', 'batched', 'daily_digest', 'weekly_digest'],
      default: 'immediate'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Offline Content Schema
const offlineContentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ['blog', 'package', 'destination', 'map', 'document', 'itinerary'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Content metadata
  title: String,
  description: String,
  thumbnail: String,
  
  // Offline availability
  isDownloaded: {
    type: Boolean,
    default: false
  },
  downloadedAt: Date,
  expiresAt: Date,
  
  // File information
  files: [{
    type: {
      type: String,
      enum: ['html', 'image', 'video', 'audio', 'pdf', 'json', 'map_tiles']
    },
    url: String,
    localPath: String,
    size: Number,
    checksum: String
  }],
  
  // Sync status
  lastSyncAt: Date,
  syncStatus: {
    type: String,
    enum: ['pending', 'syncing', 'synced', 'failed', 'outdated'],
    default: 'pending'
  },
  
  // Usage statistics
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: Date,
  
  // User preferences
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  autoUpdate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Mobile App Configuration Schema
const mobileConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Theme and appearance
  theme: {
    mode: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    primaryColor: {
      type: String,
      default: '#007bff'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    compactMode: {
      type: Boolean,
      default: false
    }
  },
  
  // Performance settings
  performance: {
    imageQuality: {
      type: String,
      enum: ['low', 'medium', 'high', 'auto'],
      default: 'auto'
    },
    autoplay: {
      videos: {
        type: Boolean,
        default: false
      },
      gifs: {
        type: Boolean,
        default: true
      }
    },
    preloadImages: {
      type: Boolean,
      default: true
    },
    dataUsage: {
      type: String,
      enum: ['unlimited', 'wifi_only', 'limited'],
      default: 'unlimited'
    }
  },
  
  // Offline settings
  offline: {
    enabled: {
      type: Boolean,
      default: true
    },
    downloadWifiOnly: {
      type: Boolean,
      default: true
    },
    maxStorageSize: {
      type: Number,
      default: 100 * 1024 * 1024 // 100MB
    },
    autoDownload: {
      favoriteBlogs: {
        type: Boolean,
        default: true
      },
      upcomingTrips: {
        type: Boolean,
        default: true
      },
      savedDestinations: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Location and mapping
  location: {
    enabled: {
      type: Boolean,
      default: true
    },
    accuracy: {
      type: String,
      enum: ['high', 'balanced', 'low_power'],
      default: 'balanced'
    },
    backgroundTracking: {
      type: Boolean,
      default: false
    },
    mapProvider: {
      type: String,
      enum: ['google', 'mapbox', 'openstreet'],
      default: 'google'
    },
    mapStyle: {
      type: String,
      enum: ['standard', 'satellite', 'terrain', 'hybrid'],
      default: 'standard'
    }
  },
  
  // Security settings
  security: {
    biometricAuth: {
      type: Boolean,
      default: false
    },
    autoLock: {
      type: Boolean,
      default: false
    },
    autoLockDelay: {
      type: Number,
      default: 300 // seconds
    },
    secureMode: {
      type: Boolean,
      default: false
    }
  },
  
  // Accessibility
  accessibility: {
    screenReader: {
      type: Boolean,
      default: false
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    largeText: {
      type: Boolean,
      default: false
    },
    reduceMotion: {
      type: Boolean,
      default: false
    }
  },
  
  // Data synchronization
  sync: {
    autoSync: {
      type: Boolean,
      default: true
    },
    syncWifiOnly: {
      type: Boolean,
      default: false
    },
    syncFrequency: {
      type: Number,
      default: 300 // seconds
    },
    backgroundSync: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// PWA Install Schema
const pwaInstallSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: String, // For anonymous users
  
  // Installation details
  installedAt: {
    type: Date,
    default: Date.now
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'windows', 'macos', 'linux', 'web'],
    required: true
  },
  source: {
    type: String,
    enum: ['browser_prompt', 'custom_button', 'share_menu', 'other'],
    required: true
  },
  
  // Device information
  deviceInfo: {
    userAgent: String,
    screen: {
      width: Number,
      height: Number,
      pixelRatio: Number
    },
    browser: String,
    version: String,
    language: String,
    timezone: String
  },
  
  // Usage tracking
  launches: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['homescreen', 'url', 'browser', 'notification'],
      default: 'homescreen'
    },
    sessionDuration: Number // minutes
  }],
  
  // Engagement metrics
  totalLaunches: {
    type: Number,
    default: 0
  },
  totalSessionTime: {
    type: Number,
    default: 0 // minutes
  },
  averageSessionTime: {
    type: Number,
    default: 0 // minutes
  },
  lastLaunch: Date,
  
  // Settings
  isActive: {
    type: Boolean,
    default: true
  },
  uninstalledAt: Date
}, {
  timestamps: true
});

// Indexes for performance
serviceWorkerSchema.index({ user: 1, cacheVersion: 1 });
serviceWorkerSchema.index({ 'syncQueue.status': 1, 'syncQueue.timestamp': 1 });

pushNotificationSchema.index({ user: 1, type: 1 });
pushNotificationSchema.index({ scheduledFor: 1, status: 1 });
pushNotificationSchema.index({ status: 1, createdAt: -1 });

deviceRegistrationSchema.index({ user: 1, isActive: 1 });
deviceRegistrationSchema.index({ endpoint: 1 }, { unique: true });

offlineContentSchema.index({ user: 1, contentType: 1 });
offlineContentSchema.index({ user: 1, isDownloaded: 1 });
offlineContentSchema.index({ expiresAt: 1 });

mobileConfigSchema.index({ user: 1 }, { unique: true });

pwaInstallSchema.index({ user: 1 });
pwaInstallSchema.index({ platform: 1, installedAt: -1 });

// Virtual for calculating cache usage
serviceWorkerSchema.virtual('cacheUsage').get(function() {
  return this.cachedResources.reduce((total, resource) => total + (resource.size || 0), 0);
});

// Method to clean expired cache
serviceWorkerSchema.methods.cleanExpiredCache = function() {
  const now = new Date();
  this.cachedResources = this.cachedResources.filter(resource => 
    !resource.expiresAt || resource.expiresAt > now
  );
  return this.save();
};

// Virtual for average session time
pwaInstallSchema.virtual('avgSessionTime').get(function() {
  if (this.totalLaunches === 0) return 0;
  return Math.round(this.totalSessionTime / this.totalLaunches);
});

module.exports = {
  ServiceWorker: mongoose.model('ServiceWorker', serviceWorkerSchema),
  PushNotification: mongoose.model('PushNotification', pushNotificationSchema),
  DeviceRegistration: mongoose.model('DeviceRegistration', deviceRegistrationSchema),
  OfflineContent: mongoose.model('OfflineContent', offlineContentSchema),
  MobileConfig: mongoose.model('MobileConfig', mobileConfigSchema),
  PWAInstall: mongoose.model('PWAInstall', pwaInstallSchema)
};