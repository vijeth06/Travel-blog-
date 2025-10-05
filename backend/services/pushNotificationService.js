const webpush = require('web-push');
const { 
  PushNotification, 
  DeviceRegistration, 
  ServiceWorker, 
  OfflineContent,
  MobileConfig 
} = require('../models/Mobile');

class PushNotificationService {
  constructor() {
    // Configure web-push with VAPID keys (if available)
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:' + (process.env.VAPID_EMAIL || 'test@example.com'),
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } else {
      console.warn('VAPID keys not configured. Push notifications will not work in production.');
    }
    
    this.defaultIcon = '/icons/notification-icon.png';
    this.defaultBadge = '/icons/badge-icon.png';
  }

  async registerDevice(userId, subscription, deviceInfo) {
    try {
      // Check if device already exists
      let device = await DeviceRegistration.findOne({ endpoint: subscription.endpoint });
      
      if (device) {
        // Update existing device
        device.user = userId;
        device.keys = subscription.keys;
        device.deviceInfo = { ...device.deviceInfo, ...deviceInfo };
        device.lastUsed = new Date();
        device.isActive = true;
      } else {
        // Create new device registration
        device = new DeviceRegistration({
          user: userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          deviceInfo,
          preferences: {
            enabled: true,
            types: [
              'trip_reminder', 'booking_confirmation', 'weather_update',
              'blog_like', 'new_comment', 'goal_achievement'
            ]
          }
        });
      }

      await device.save();
      return device;
    } catch (error) {
      console.error('Register device error:', error);
      throw new Error('Failed to register device for push notifications');
    }
  }

  async unregisterDevice(endpoint) {
    try {
      const device = await DeviceRegistration.findOne({ endpoint });
      if (device) {
        device.isActive = false;
        await device.save();
      }
      return true;
    } catch (error) {
      console.error('Unregister device error:', error);
      throw new Error('Failed to unregister device');
    }
  }

  async updateDevicePreferences(userId, endpoint, preferences) {
    try {
      const device = await DeviceRegistration.findOne({
        user: userId,
        endpoint,
        isActive: true
      });

      if (!device) {
        throw new Error('Device not found');
      }

      device.preferences = { ...device.preferences, ...preferences };
      await device.save();

      return device;
    } catch (error) {
      console.error('Update device preferences error:', error);
      throw new Error('Failed to update device preferences');
    }
  }

  async createNotification(userId, notificationData) {
    try {
      const notification = new PushNotification({
        user: userId,
        title: notificationData.title,
        body: notificationData.body,
        icon: notificationData.icon || this.defaultIcon,
        badge: notificationData.badge || this.defaultBadge,
        image: notificationData.image,
        data: notificationData.data,
        type: notificationData.type,
        scheduledFor: notificationData.scheduledFor || new Date(),
        priority: notificationData.priority || 'normal',
        ttl: notificationData.ttl || 2419200, // 28 days
        actions: notificationData.actions || [],
        targeting: notificationData.targeting || {}
      });

      await notification.save();

      // If not scheduled for future, send immediately
      if (!notificationData.scheduledFor || notificationData.scheduledFor <= new Date()) {
        await this.sendNotification(notification._id);
      }

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw new Error('Failed to create notification');
    }
  }

  async sendNotification(notificationId) {
    try {
      const notification = await PushNotification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Get user's devices
      const devices = await DeviceRegistration.find({
        user: notification.user,
        isActive: true,
        'preferences.enabled': true,
        'preferences.types': notification.type
      });

      if (devices.length === 0) {
        notification.status = 'failed';
        await notification.save();
        return { success: false, message: 'No active devices found' };
      }

      const payload = {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        image: notification.image,
        data: {
          ...notification.data,
          notificationId: notification._id,
          type: notification.type,
          timestamp: new Date().toISOString()
        },
        actions: notification.actions
      };

      const pushPromises = devices.map(async (device) => {
        try {
          // Check quiet hours
          if (await this.isQuietHours(device)) {
            return { success: false, reason: 'quiet_hours' };
          }

          const subscription = {
            endpoint: device.endpoint,
            keys: device.keys
          };

          const options = {
            TTL: notification.ttl,
            urgency: this.getPriorityUrgency(notification.priority),
            headers: {}
          };

          await webpush.sendNotification(subscription, JSON.stringify(payload), options);
          
          device.lastUsed = new Date();
          await device.save();

          return { success: true, device: device._id };
        } catch (error) {
          console.error(`Push notification failed for device ${device._id}:`, error);
          
          // Handle expired/invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            device.isActive = false;
            await device.save();
          }

          return { success: false, error: error.message, device: device._id };
        }
      });

      const results = await Promise.all(pushPromises);
      const successCount = results.filter(r => r.success).length;

      // Update notification status
      notification.status = successCount > 0 ? 'sent' : 'failed';
      notification.sentAt = new Date();
      notification.delivered = successCount > 0;
      await notification.save();

      return {
        success: successCount > 0,
        sentToDevices: successCount,
        totalDevices: devices.length,
        results
      };
    } catch (error) {
      console.error('Send notification error:', error);
      throw new Error('Failed to send notification');
    }
  }

  async sendBulkNotification(userIds, notificationData) {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = await this.createNotification(userId, notificationData);
        notifications.push(notification);
      }

      // Send all notifications
      const sendPromises = notifications.map(notification => 
        this.sendNotification(notification._id)
      );

      const results = await Promise.all(sendPromises);
      
      return {
        success: true,
        notifications: notifications.length,
        results
      };
    } catch (error) {
      console.error('Send bulk notification error:', error);
      throw new Error('Failed to send bulk notifications');
    }
  }

  async scheduleNotification(userId, notificationData, scheduledFor) {
    try {
      const notification = await this.createNotification(userId, {
        ...notificationData,
        scheduledFor: new Date(scheduledFor)
      });

      return notification;
    } catch (error) {
      console.error('Schedule notification error:', error);
      throw new Error('Failed to schedule notification');
    }
  }

  async getScheduledNotifications(userId = null) {
    try {
      const query = { 
        status: 'scheduled',
        scheduledFor: { $lte: new Date() }
      };
      
      if (userId) {
        query.user = userId;
      }

      return await PushNotification.find(query).sort({ scheduledFor: 1 });
    } catch (error) {
      console.error('Get scheduled notifications error:', error);
      throw new Error('Failed to get scheduled notifications');
    }
  }

  async processScheduledNotifications() {
    try {
      const notifications = await this.getScheduledNotifications();
      
      const processPromises = notifications.map(async (notification) => {
        try {
          await this.sendNotification(notification._id);
          return { success: true, id: notification._id };
        } catch (error) {
          console.error(`Failed to process scheduled notification ${notification._id}:`, error);
          return { success: false, id: notification._id, error: error.message };
        }
      });

      const results = await Promise.all(processPromises);
      return results;
    } catch (error) {
      console.error('Process scheduled notifications error:', error);
      throw new Error('Failed to process scheduled notifications');
    }
  }

  async trackNotificationClick(notificationId, deviceEndpoint) {
    try {
      const notification = await PushNotification.findById(notificationId);
      if (notification) {
        notification.clicked = true;
        notification.clickedAt = new Date();
        await notification.save();
      }

      // Update device last used
      const device = await DeviceRegistration.findOne({ endpoint: deviceEndpoint });
      if (device) {
        device.lastUsed = new Date();
        await device.save();
      }

      return true;
    } catch (error) {
      console.error('Track notification click error:', error);
      return false;
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        startDate,
        endDate
      } = options;

      const query = { user: userId };
      
      if (type) query.type = type;
      if (status) query.status = status;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const notifications = await PushNotification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await PushNotification.countDocuments(query);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  async getNotificationAnalytics(userId = null, dateRange = {}) {
    try {
      const matchQuery = {};
      
      if (userId) matchQuery.user = userId;
      
      if (dateRange.startDate || dateRange.endDate) {
        matchQuery.createdAt = {};
        if (dateRange.startDate) matchQuery.createdAt.$gte = new Date(dateRange.startDate);
        if (dateRange.endDate) matchQuery.createdAt.$lte = new Date(dateRange.endDate);
      }

      const analytics = await PushNotification.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            sentNotifications: {
              $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
            },
            deliveredNotifications: {
              $sum: { $cond: ['$delivered', 1, 0] }
            },
            clickedNotifications: {
              $sum: { $cond: ['$clicked', 1, 0] }
            },
            typeBreakdown: {
              $push: '$type'
            },
            avgTTL: { $avg: '$ttl' }
          }
        },
        {
          $addFields: {
            deliveryRate: {
              $cond: [
                { $eq: ['$totalNotifications', 0] },
                0,
                { $multiply: [{ $divide: ['$deliveredNotifications', '$totalNotifications'] }, 100] }
              ]
            },
            clickRate: {
              $cond: [
                { $eq: ['$deliveredNotifications', 0] },
                0,
                { $multiply: [{ $divide: ['$clickedNotifications', '$deliveredNotifications'] }, 100] }
              ]
            }
          }
        }
      ]);

      // Count type breakdown
      const typeBreakdown = {};
      if (analytics[0]?.typeBreakdown) {
        analytics[0].typeBreakdown.forEach(type => {
          typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
        });
      }

      return {
        ...analytics[0],
        typeBreakdown
      };
    } catch (error) {
      console.error('Get notification analytics error:', error);
      throw new Error('Failed to get notification analytics');
    }
  }

  // Helper methods
  async isQuietHours(device) {
    if (!device.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const userTimezone = device.preferences.quietHours.timezone || device.deviceInfo.timezone || 'UTC';
    
    // Simplified quiet hours check (in production, use proper timezone library)
    const currentHour = now.getHours();
    const startHour = parseInt(device.preferences.quietHours.start.split(':')[0]);
    const endHour = parseInt(device.preferences.quietHours.end.split(':')[0]);

    if (startHour <= endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  getPriorityUrgency(priority) {
    switch (priority) {
      case 'urgent': return 'high';
      case 'high': return 'high';
      case 'normal': return 'normal';
      case 'low': return 'low';
      default: return 'normal';
    }
  }

  // Predefined notification templates
  async sendTripReminder(userId, tripData) {
    return await this.createNotification(userId, {
      type: 'trip_reminder',
      title: `Trip Reminder: ${tripData.destination}`,
      body: `Your trip to ${tripData.destination} is ${tripData.daysUntil} days away!`,
      data: {
        tripId: tripData._id,
        destination: tripData.destination,
        startDate: tripData.startDate
      },
      actions: [
        { action: 'view_itinerary', title: 'View Itinerary' },
        { action: 'edit_trip', title: 'Edit Trip' }
      ]
    });
  }

  async sendBookingConfirmation(userId, bookingData) {
    return await this.createNotification(userId, {
      type: 'booking_confirmation',
      title: 'Booking Confirmed!',
      body: `Your booking for ${bookingData.title} has been confirmed.`,
      data: {
        bookingId: bookingData._id,
        title: bookingData.title
      },
      actions: [
        { action: 'view_booking', title: 'View Details' }
      ]
    });
  }

  async sendWeatherUpdate(userId, weatherData) {
    return await this.createNotification(userId, {
      type: 'weather_update',
      title: `Weather Update: ${weatherData.location}`,
      body: `${weatherData.condition}, ${weatherData.temperature}°C. ${weatherData.alert || ''}`,
      data: {
        location: weatherData.location,
        temperature: weatherData.temperature,
        condition: weatherData.condition
      }
    });
  }

  async sendBlogLike(userId, blogData, likerData) {
    return await this.createNotification(userId, {
      type: 'blog_like',
      title: 'New Like on Your Blog!',
      body: `${likerData.name} liked your blog "${blogData.title}"`,
      data: {
        blogId: blogData._id,
        likerId: likerData._id
      },
      actions: [
        { action: 'view_blog', title: 'View Blog' }
      ]
    });
  }

  async sendGoalAchievement(userId, goalData) {
    return await this.createNotification(userId, {
      type: 'goal_achievement',
      title: 'Goal Achieved! 🎉',
      body: `Congratulations! You've achieved your goal: ${goalData.title}`,
      data: {
        goalId: goalData._id,
        achievement: goalData.title
      },
      actions: [
        { action: 'view_goals', title: 'View Goals' },
        { action: 'share_achievement', title: 'Share' }
      ]
    });
  }
}

module.exports = new PushNotificationService();