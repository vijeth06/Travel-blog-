const gamificationService = require('../services/realGamificationService');

/**
 * Middleware to automatically track activities and award points
 */
const activityTracker = {
  // Track blog creation
  trackBlogCreated: async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await gamificationService.trackActivity(req.user.id, 'blog_created', {
            blogId: res.locals.createdBlogId
          });
        } catch (error) {
          console.error('Track blog created error:', error);
        }
      }
    });
    next();
  },

  // Track review submission
  trackReviewSubmitted: async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await gamificationService.trackActivity(req.user.id, 'review_written', {
            reviewId: res.locals.createdReviewId,
            targetType: req.body.targetType
          });
        } catch (error) {
          console.error('Track review submitted error:', error);
        }
      }
    });
    next();
  },

  // Track photo upload
  trackPhotoUploaded: async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await gamificationService.trackActivity(req.user.id, 'photo_uploaded', {
            photoId: res.locals.uploadedPhotoId
          });
        } catch (error) {
          console.error('Track photo uploaded error:', error);
        }
      }
    });
    next();
  },

  // Track place visit
  trackPlaceVisited: async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await gamificationService.trackActivity(req.user.id, 'place_visited', {
            placeId: req.body.placeId || req.params.placeId
          });
        } catch (error) {
          console.error('Track place visited error:', error);
        }
      }
    });
    next();
  },

  // Track package booking
  trackPackageBooked: async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await gamificationService.trackActivity(req.user.id, 'package_booked', {
            packageId: req.body.packageId,
            amount: req.body.amount
          });
        } catch (error) {
          console.error('Track package booked error:', error);
        }
      }
    });
    next();
  },

  // Track comment posting
  trackCommentPosted: async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await gamificationService.trackActivity(req.user.id, 'comment_posted', {
            commentId: res.locals.createdCommentId
          });
        } catch (error) {
          console.error('Track comment posted error:', error);
        }
      }
    });
    next();
  },

  // Track trip planning
  trackTripPlanned: async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await gamificationService.trackActivity(req.user.id, 'trip_planned', {
            tripId: res.locals.createdTripId
          });
        } catch (error) {
          console.error('Track trip planned error:', error);
        }
      }
    });
    next();
  },

  // Track daily login
  trackDailyLogin: async (req, res, next) => {
    try {
      if (req.user && req.user.id) {
        // Check if user has already been awarded points today
        const today = new Date().toDateString();
        const lastLogin = req.user.lastLoginDate ? new Date(req.user.lastLoginDate).toDateString() : null;
        
        if (lastLogin !== today) {
          await gamificationService.trackActivity(req.user.id, 'daily_login');
          
          // Update user's last login date
          await require('../models/User').findByIdAndUpdate(req.user.id, {
            lastLoginDate: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Track daily login error:', error);
    }
    next();
  },

  // Track likes received
  trackLikeReceived: async (userId, metadata = {}) => {
    try {
      await gamificationService.trackActivity(userId, 'like_received', metadata);
    } catch (error) {
      console.error('Track like received error:', error);
    }
  },

  // Track shares received
  trackShareReceived: async (userId, metadata = {}) => {
    try {
      await gamificationService.trackActivity(userId, 'share_received', metadata);
    } catch (error) {
      console.error('Track share received error:', error);
    }
  },

  // Track friend referral
  trackFriendReferred: async (userId, metadata = {}) => {
    try {
      await gamificationService.trackActivity(userId, 'friend_referred', metadata);
    } catch (error) {
      console.error('Track friend referred error:', error);
    }
  },

  // Generic activity tracker
  trackActivity: async (userId, activityType, metadata = {}) => {
    try {
      await gamificationService.trackActivity(userId, activityType, metadata);
    } catch (error) {
      console.error('Track activity error:', error);
    }
  }
};

module.exports = activityTracker;