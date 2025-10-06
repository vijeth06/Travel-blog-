const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const pushNotificationService = require('../services/pushNotificationService');
const offlineService = require('../services/offlineService');
const { 
  PushNotification, 
  DeviceRegistration, 
  OfflineContent, 
  MobileConfig,
  PWAInstall 
} = require('../models/Mobile');

// Push Notification Routes
router.post('/push/register', protect, async (req, res) => {
  try {
    const { subscription, deviceInfo } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Valid subscription required'
      });
    }

    const device = await pushNotificationService.registerDevice(
      req.user.id,
      subscription,
      deviceInfo
    );

    res.status(201).json({
      success: true,
      message: 'Device registered for push notifications',
      data: {
        deviceId: device._id,
        preferences: device.preferences
      }
    });
  } catch (error) {
    console.error('Register push device error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/push/unregister', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint required'
      });
    }

    await pushNotificationService.unregisterDevice(endpoint);

    res.json({
      success: true,
      message: 'Device unregistered from push notifications'
    });
  } catch (error) {
    console.error('Unregister push device error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.put('/push/preferences', protect, async (req, res) => {
  try {
    const { endpoint, preferences } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint required'
      });
    }

    const device = await pushNotificationService.updateDevicePreferences(
      req.user.id,
      endpoint,
      preferences
    );

    res.json({
      success: true,
      message: 'Push notification preferences updated',
      data: device.preferences
    });
  } catch (error) {
    console.error('Update push preferences error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/push/devices', protect, async (req, res) => {
  try {
    const devices = await DeviceRegistration.find({
      user: req.user.id,
      isActive: true
    }).select('-keys'); // Don't expose sensitive keys

    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Get push devices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get registered devices'
    });
  }
});

router.post('/push/send', protect, async (req, res) => {
  try {
    const notificationData = {
      title: req.body.title,
      body: req.body.body,
      icon: req.body.icon,
      image: req.body.image,
      data: req.body.data,
      type: req.body.type || 'promotional',
      priority: req.body.priority || 'normal',
      actions: req.body.actions || []
    };

    const notification = await pushNotificationService.createNotification(
      req.user.id,
      notificationData
    );

    res.status(201).json({
      success: true,
      message: 'Notification sent',
      data: notification
    });
  } catch (error) {
    console.error('Send push notification error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/push/notifications', protect, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      type: req.query.type,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await pushNotificationService.getUserNotifications(req.user.id, options);

    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/push/click/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { endpoint } = req.body;

    await pushNotificationService.trackNotificationClick(notificationId, endpoint);

    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Track notification click error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track click'
    });
  }
});

// Offline/Cache Routes
router.post('/offline/initialize', protect, async (req, res) => {
  try {
    const sw = await offlineService.initializeServiceWorker(req.user.id);

    res.json({
      success: true,
      message: 'Service worker initialized',
      data: {
        cacheVersion: sw.cacheVersion,
        settings: sw.settings
      }
    });
  } catch (error) {
    console.error('Initialize service worker error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/offline/status', protect, async (req, res) => {
  try {
    const status = await offlineService.getCacheStatus(req.user.id);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get cache status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/offline/cache', protect, async (req, res) => {
  try {
    const resourceData = {
      url: req.body.url,
      type: req.body.type || 'dynamic',
      size: req.body.size || 0,
      priority: req.body.priority || 'medium',
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null
    };

    await offlineService.addToCache(req.user.id, resourceData);

    res.json({
      success: true,
      message: 'Resource added to cache'
    });
  } catch (error) {
    console.error('Add to cache error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/offline/cache', protect, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL required'
      });
    }

    await offlineService.removeFromCache(req.user.id, url);

    res.json({
      success: true,
      message: 'Resource removed from cache'
    });
  } catch (error) {
    console.error('Remove from cache error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/offline/sync-queue', protect, async (req, res) => {
  try {
    const { action, resourceType, resourceId, data } = req.body;
    
    if (!action || !resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Action, resource type, and resource ID are required'
      });
    }

    const syncItem = await offlineService.addToSyncQueue(
      req.user.id,
      action,
      resourceType,
      resourceId,
      data
    );

    res.status(201).json({
      success: true,
      message: 'Added to sync queue',
      data: syncItem
    });
  } catch (error) {
    console.error('Add to sync queue error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/offline/sync', protect, async (req, res) => {
  try {
    const results = await offlineService.processSyncQueue(req.user.id);

    res.json({
      success: true,
      message: 'Sync queue processed',
      data: results
    });
  } catch (error) {
    console.error('Process sync queue error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Offline Content Routes
router.post('/offline/content/:contentId', protect, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { contentType } = req.body;
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: 'Content type required'
      });
    }

    const content = await offlineService.downloadContentForOffline(
      req.user.id,
      contentId,
      contentType
    );

    res.status(201).json({
      success: true,
      message: 'Content downloaded for offline use',
      data: content
    });
  } catch (error) {
    console.error('Download content for offline error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/offline/content', protect, async (req, res) => {
  try {
    const options = {
      contentType: req.query.contentType,
      isDownloaded: req.query.isDownloaded === 'true',
      syncStatus: req.query.syncStatus,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await offlineService.getOfflineContent(req.user.id, options);

    res.json({
      success: true,
      data: result.content,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get offline content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/offline/content/:contentId', protect, async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = await offlineService.removeOfflineContent(req.user.id, contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Offline content not found'
      });
    }

    res.json({
      success: true,
      message: 'Offline content removed'
    });
  } catch (error) {
    console.error('Remove offline content error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Mobile Configuration Routes
router.get('/config', protect, async (req, res) => {
  try {
    const config = await offlineService.getMobileConfig(req.user.id);

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get mobile config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.put('/config', protect, async (req, res) => {
  try {
    const config = await offlineService.updateMobileConfig(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Mobile configuration updated',
      data: config
    });
  } catch (error) {
    console.error('Update mobile config error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PWA Routes
router.get('/manifest.json', async (req, res) => {
  try {
    // If user is authenticated, get personalized manifest
    const userId = req.user?.id;
    const manifest = await offlineService.generatePWAManifest(userId);
    
    res.json(manifest);
  } catch (error) {
    console.error('Generate PWA manifest error:', error);
    
    // Return default manifest on error
    const defaultManifest = {
      name: 'Travel Blog',
      short_name: 'TravelBlog',
      description: 'Your personal travel companion and blog platform',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#007bff',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };
    
    res.json(defaultManifest);
  }
});

router.post('/pwa/install', async (req, res) => {
  try {
    const installData = {
      user: req.user?.id || null,
      sessionId: req.sessionID,
      platform: req.body.platform,
      source: req.body.source || 'browser_prompt',
      deviceInfo: {
        userAgent: req.get('User-Agent'),
        screen: req.body.screen,
        browser: req.body.browser,
        version: req.body.version,
        language: req.get('Accept-Language'),
        timezone: req.body.timezone
      }
    };

    const install = new PWAInstall(installData);
    await install.save();

    res.status(201).json({
      success: true,
      message: 'PWA installation tracked',
      data: { installId: install._id }
    });
  } catch (error) {
    console.error('Track PWA install error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to track PWA installation'
    });
  }
});

router.post('/pwa/launch', async (req, res) => {
  try {
    const { installId, source, sessionDuration } = req.body;
    
    const install = await PWAInstall.findById(installId);
    if (!install) {
      return res.status(404).json({
        success: false,
        error: 'PWA installation not found'
      });
    }

    install.launches.push({
      timestamp: new Date(),
      source: source || 'homescreen',
      sessionDuration: sessionDuration || 0
    });

    install.totalLaunches += 1;
    install.totalSessionTime += sessionDuration || 0;
    install.averageSessionTime = Math.round(install.totalSessionTime / install.totalLaunches);
    install.lastLaunch = new Date();

    await install.save();

    res.json({
      success: true,
      message: 'PWA launch tracked'
    });
  } catch (error) {
    console.error('Track PWA launch error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to track PWA launch'
    });
  }
});

// Admin Routes
router.get('/admin/push/analytics', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await pushNotificationService.getNotificationAnalytics(
      null,
      { startDate, endDate }
    );

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get push analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get push notification analytics'
    });
  }
});

router.post('/admin/push/broadcast', adminAuth, async (req, res) => {
  try {
    const { userIds, notificationData } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User IDs array required'
      });
    }

    const result = await pushNotificationService.sendBulkNotification(userIds, notificationData);

    res.json({
      success: true,
      message: 'Bulk notification sent',
      data: result
    });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/admin/pwa/analytics', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, platform } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.installedAt = {};
      if (startDate) query.installedAt.$gte = new Date(startDate);
      if (endDate) query.installedAt.$lte = new Date(endDate);
    }
    if (platform) query.platform = platform;

    const analytics = await PWAInstall.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalInstalls: { $sum: 1 },
          avgSessionTime: { $avg: '$averageSessionTime' },
          totalLaunches: { $sum: '$totalLaunches' },
          totalSessionTime: { $sum: '$totalSessionTime' },
          platformBreakdown: { $push: '$platform' },
          sourceBreakdown: { $push: '$source' }
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics[0] || {
        totalInstalls: 0,
        avgSessionTime: 0,
        totalLaunches: 0,
        totalSessionTime: 0,
        platformBreakdown: [],
        sourceBreakdown: []
      }
    });
  } catch (error) {
    console.error('Get PWA analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get PWA analytics'
    });
  }
});

module.exports = router;
