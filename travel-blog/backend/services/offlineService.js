const { ServiceWorker, OfflineContent, MobileConfig } = require('../models/Mobile');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class OfflineService {
  constructor() {
    this.cachePriorities = {
      high: ['core', 'navigation', 'user_profile'],
      medium: ['recent_blogs', 'favorite_destinations', 'upcoming_trips'],
      low: ['recommendations', 'archived_content']
    };
    
    this.maxCacheSize = 100 * 1024 * 1024; // 100MB default
  }

  async initializeServiceWorker(userId) {
    try {
      let sw = await ServiceWorker.findOne({ user: userId });
      
      if (!sw) {
        sw = new ServiceWorker({
          user: userId,
          cacheVersion: this.generateCacheVersion(),
          cachedResources: [],
          syncQueue: [],
          settings: {
            maxCacheSize: this.maxCacheSize,
            autoSync: true,
            backgroundSync: true,
            preloadContent: true
          }
        });
        await sw.save();
      }

      return sw;
    } catch (error) {
      console.error('Initialize service worker error:', error);
      throw new Error('Failed to initialize service worker');
    }
  }

  async addToCache(userId, resourceData) {
    try {
      const sw = await ServiceWorker.findOne({ user: userId });
      if (!sw) {
        throw new Error('Service worker not initialized');
      }

      // Check if resource already cached
      const existingIndex = sw.cachedResources.findIndex(r => r.url === resourceData.url);
      
      if (existingIndex !== -1) {
        // Update existing resource
        sw.cachedResources[existingIndex] = {
          ...sw.cachedResources[existingIndex],
          ...resourceData,
          cachedAt: new Date()
        };
      } else {
        // Add new resource
        sw.cachedResources.push({
          url: resourceData.url,
          type: resourceData.type,
          size: resourceData.size || 0,
          cachedAt: new Date(),
          expiresAt: resourceData.expiresAt || this.calculateExpiration(resourceData.type),
          priority: resourceData.priority || 'medium'
        });
      }

      // Clean cache if size limit exceeded
      await this.cleanCache(sw);
      
      await sw.save();
      return sw;
    } catch (error) {
      console.error('Add to cache error:', error);
      throw new Error('Failed to add resource to cache');
    }
  }

  async removeFromCache(userId, url) {
    try {
      const sw = await ServiceWorker.findOne({ user: userId });
      if (!sw) {
        throw new Error('Service worker not initialized');
      }

      sw.cachedResources = sw.cachedResources.filter(resource => resource.url !== url);
      await sw.save();

      return sw;
    } catch (error) {
      console.error('Remove from cache error:', error);
      throw new Error('Failed to remove resource from cache');
    }
  }

  async getCacheStatus(userId) {
    try {
      const sw = await ServiceWorker.findOne({ user: userId });
      if (!sw) {
        return { initialized: false };
      }

      const totalSize = sw.cachedResources.reduce((sum, resource) => sum + (resource.size || 0), 0);
      const resourcesByType = {};
      const resourcesByPriority = {};

      sw.cachedResources.forEach(resource => {
        resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1;
        resourcesByPriority[resource.priority] = (resourcesByPriority[resource.priority] || 0) + 1;
      });

      return {
        initialized: true,
        cacheVersion: sw.cacheVersion,
        totalResources: sw.cachedResources.length,
        totalSize,
        maxSize: sw.settings.maxCacheSize,
        usagePercentage: Math.round((totalSize / sw.settings.maxCacheSize) * 100),
        resourcesByType,
        resourcesByPriority,
        syncQueueLength: sw.syncQueue.length,
        settings: sw.settings
      };
    } catch (error) {
      console.error('Get cache status error:', error);
      throw new Error('Failed to get cache status');
    }
  }

  async addToSyncQueue(userId, action, resourceType, resourceId, data) {
    try {
      const sw = await ServiceWorker.findOne({ user: userId });
      if (!sw) {
        throw new Error('Service worker not initialized');
      }

      const syncItem = {
        action,
        resourceType,
        resourceId: resourceId.toString(),
        data,
        timestamp: new Date(),
        retryCount: 0,
        status: 'pending'
      };

      sw.syncQueue.push(syncItem);
      await sw.save();

      // If online, attempt immediate sync
      if (sw.settings.autoSync) {
        await this.processSyncQueue(userId);
      }

      return syncItem;
    } catch (error) {
      console.error('Add to sync queue error:', error);
      throw new Error('Failed to add to sync queue');
    }
  }

  async processSyncQueue(userId) {
    try {
      const sw = await ServiceWorker.findOne({ user: userId });
      if (!sw) {
        throw new Error('Service worker not initialized');
      }

      const pendingItems = sw.syncQueue.filter(item => item.status === 'pending');
      const results = [];

      for (const item of pendingItems) {
        try {
          const result = await this.processSyncItem(item);
          
          if (result.success) {
            item.status = 'synced';
          } else {
            item.retryCount += 1;
            if (item.retryCount >= 3) {
              item.status = 'failed';
            }
          }

          results.push({ item: item._id, success: result.success, error: result.error });
        } catch (error) {
          console.error(`Sync item ${item._id} failed:`, error);
          item.retryCount += 1;
          if (item.retryCount >= 3) {
            item.status = 'failed';
          }
          results.push({ item: item._id, success: false, error: error.message });
        }
      }

      // Remove successfully synced items
      sw.syncQueue = sw.syncQueue.filter(item => item.status !== 'synced');
      await sw.save();

      return results;
    } catch (error) {
      console.error('Process sync queue error:', error);
      throw new Error('Failed to process sync queue');
    }
  }

  async processSyncItem(item) {
    try {
      // This would contain the actual sync logic for different resource types
      // For now, we'll simulate the sync process
      
      switch (item.resourceType) {
        case 'blog':
          return await this.syncBlog(item);
        case 'booking':
          return await this.syncBooking(item);
        case 'like':
          return await this.syncLike(item);
        case 'comment':
          return await this.syncComment(item);
        default:
          throw new Error(`Unknown resource type: ${item.resourceType}`);
      }
    } catch (error) {
      console.error('Process sync item error:', error);
      return { success: false, error: error.message };
    }
  }

  async syncBlog(item) {
    // Implement blog sync logic
    // This would make API calls to sync blog data
    return { success: true };
  }

  async syncBooking(item) {
    // Implement booking sync logic
    return { success: true };
  }

  async syncLike(item) {
    // Implement like sync logic
    return { success: true };
  }

  async syncComment(item) {
    // Implement comment sync logic
    return { success: true };
  }

  async downloadContentForOffline(userId, contentId, contentType) {
    try {
      let content = await OfflineContent.findOne({
        user: userId,
        contentId,
        contentType
      });

      if (!content) {
        content = new OfflineContent({
          user: userId,
          contentId,
          contentType,
          priority: 'medium'
        });
      }

      // Get content details based on type
      const contentData = await this.getContentData(contentId, contentType);
      
      content.title = contentData.title;
      content.description = contentData.description;
      content.thumbnail = contentData.thumbnail;

      // Download and cache files
      const files = [];
      for (const fileUrl of contentData.files || []) {
        try {
          const fileData = await this.downloadFile(fileUrl);
          files.push({
            type: this.getFileType(fileUrl),
            url: fileUrl,
            localPath: fileData.localPath,
            size: fileData.size,
            checksum: fileData.checksum
          });
        } catch (error) {
          console.error(`Failed to download file ${fileUrl}:`, error);
        }
      }

      content.files = files;
      content.isDownloaded = files.length > 0;
      content.downloadedAt = new Date();
      content.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      content.syncStatus = 'synced';

      await content.save();
      return content;
    } catch (error) {
      console.error('Download content for offline error:', error);
      throw new Error('Failed to download content for offline use');
    }
  }

  async getOfflineContent(userId, options = {}) {
    try {
      const {
        contentType,
        isDownloaded,
        syncStatus,
        page = 1,
        limit = 20
      } = options;

      const query = { user: userId };
      
      if (contentType) query.contentType = contentType;
      if (isDownloaded !== undefined) query.isDownloaded = isDownloaded;
      if (syncStatus) query.syncStatus = syncStatus;

      const content = await OfflineContent.find(query)
        .sort({ downloadedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await OfflineContent.countDocuments(query);

      return {
        content,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get offline content error:', error);
      throw new Error('Failed to get offline content');
    }
  }

  async removeOfflineContent(userId, contentId) {
    try {
      const content = await OfflineContent.findOneAndDelete({
        user: userId,
        _id: contentId
      });

      if (content) {
        // Remove downloaded files
        for (const file of content.files) {
          try {
            if (file.localPath) {
              await fs.unlink(file.localPath);
            }
          } catch (error) {
            console.error(`Failed to delete file ${file.localPath}:`, error);
          }
        }
      }

      return content;
    } catch (error) {
      console.error('Remove offline content error:', error);
      throw new Error('Failed to remove offline content');
    }
  }

  async updateMobileConfig(userId, configData) {
    try {
      let config = await MobileConfig.findOne({ user: userId });
      
      if (!config) {
        config = new MobileConfig({ user: userId });
      }

      // Deep merge configuration
      Object.keys(configData).forEach(key => {
        if (typeof configData[key] === 'object' && !Array.isArray(configData[key])) {
          config[key] = { ...config[key], ...configData[key] };
        } else {
          config[key] = configData[key];
        }
      });

      await config.save();
      return config;
    } catch (error) {
      console.error('Update mobile config error:', error);
      throw new Error('Failed to update mobile configuration');
    }
  }

  async getMobileConfig(userId) {
    try {
      let config = await MobileConfig.findOne({ user: userId });
      
      if (!config) {
        config = new MobileConfig({ user: userId });
        await config.save();
      }

      return config;
    } catch (error) {
      console.error('Get mobile config error:', error);
      throw new Error('Failed to get mobile configuration');
    }
  }

  async generatePWAManifest(userId) {
    try {
      const config = await this.getMobileConfig(userId);
      
      const manifest = {
        name: 'Travel Blog',
        short_name: 'TravelBlog',
        description: 'Your personal travel companion and blog platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: config.theme.primaryColor,
        orientation: 'portrait-primary',
        categories: ['travel', 'lifestyle', 'social'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/desktop-home.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshots/mobile-home.png',
            sizes: '375x667',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        shortcuts: [
          {
            name: 'New Blog Post',
            short_name: 'New Post',
            description: 'Create a new blog post',
            url: '/blogs/new',
            icons: [{ src: '/icons/shortcut-blog.png', sizes: '96x96' }]
          },
          {
            name: 'My Trips',
            short_name: 'Trips',
            description: 'View your travel itinerary',
            url: '/trips',
            icons: [{ src: '/icons/shortcut-trips.png', sizes: '96x96' }]
          },
          {
            name: 'Discover',
            short_name: 'Discover',
            description: 'Explore new destinations',
            url: '/discover',
            icons: [{ src: '/icons/shortcut-discover.png', sizes: '96x96' }]
          }
        ],
        prefer_related_applications: false,
        related_applications: []
      };

      return manifest;
    } catch (error) {
      console.error('Generate PWA manifest error:', error);
      throw new Error('Failed to generate PWA manifest');
    }
  }

  async cleanCache(sw) {
    const currentSize = sw.cachedResources.reduce((sum, resource) => sum + (resource.size || 0), 0);
    
    if (currentSize <= sw.settings.maxCacheSize) {
      return;
    }

    // Sort by priority (low first) and last accessed
    sw.cachedResources.sort((a, b) => {
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return new Date(a.cachedAt) - new Date(b.cachedAt);
    });

    // Remove resources until under limit
    let removedSize = 0;
    const targetSize = sw.settings.maxCacheSize * 0.8; // Leave 20% buffer
    
    while (currentSize - removedSize > targetSize && sw.cachedResources.length > 0) {
      const removed = sw.cachedResources.shift();
      removedSize += removed.size || 0;
    }
  }

  calculateExpiration(resourceType) {
    const expirationTimes = {
      static: 30 * 24 * 60 * 60 * 1000, // 30 days
      dynamic: 7 * 24 * 60 * 60 * 1000, // 7 days
      api: 60 * 60 * 1000, // 1 hour
      image: 14 * 24 * 60 * 60 * 1000, // 14 days
      document: 24 * 60 * 60 * 1000 // 1 day
    };

    return new Date(Date.now() + (expirationTimes[resourceType] || expirationTimes.dynamic));
  }

  generateCacheVersion() {
    return `v${Date.now()}`;
  }

  async getContentData(contentId, contentType) {
    // This would fetch content data from the appropriate model
    // For now, return mock data
    return {
      title: 'Sample Content',
      description: 'Sample description',
      thumbnail: '/images/sample-thumb.jpg',
      files: []
    };
  }

  async downloadFile(url) {
    // This would download and store the file locally
    // For now, return mock data
    const filename = path.basename(url);
    const localPath = path.join('offline_cache', filename);
    
    return {
      localPath,
      size: 1024,
      checksum: crypto.createHash('md5').update(url).digest('hex')
    };
  }

  getFileType(url) {
    const ext = path.extname(url).toLowerCase();
    const typeMap = {
      '.html': 'html',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.png': 'image',
      '.gif': 'image',
      '.mp4': 'video',
      '.mp3': 'audio',
      '.pdf': 'pdf',
      '.json': 'json'
    };
    
    return typeMap[ext] || 'document';
  }
}

module.exports = new OfflineService();