const videoBlogService = require('../services/videoBlogService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const multer = require('multer');
const path = require('path');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format'), false);
    }
  }
});

const videoBlogController = {
  // Upload video
  uploadVideo: [
    upload.single('video'),
    async (req, res) => {
      try {
        if (!req.file) {
          return errorResponse(res, 'No video file provided', 400);
        }

        const userId = req.user.id;
        const metadata = {
          format: path.extname(req.file.originalname).substring(1),
          originalName: req.file.originalname
        };

        const uploadResult = await videoBlogService.uploadVideo(userId, req.file, metadata);

        successResponse(res, uploadResult, 'Video uploaded successfully');
      } catch (error) {
        errorResponse(res, error.message);
      }
    }
  ],

  // Create video blog
  async createVideoBlog(req, res) {
    try {
      const userId = req.user.id;
      const videoBlogData = req.body;

      const videoBlog = await videoBlogService.createVideoBlog(userId, videoBlogData);

      successResponse(res, videoBlog, 'Video blog created successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get video blogs with filters
  async getVideoBlogs(req, res) {
    try {
      const filters = req.query;
      const result = await videoBlogService.getVideoBlogs(filters);

      successResponse(res, result, 'Video blogs retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get single video blog
  async getVideoBlog(req, res) {
    try {
      const { videoBlogId } = req.params;
      const userId = req.user?.id;

      const result = await videoBlogService.getVideoBlog(videoBlogId, userId);

      successResponse(res, result, 'Video blog retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update video blog
  async updateVideoBlog(req, res) {
    try {
      const userId = req.user.id;
      const { videoBlogId } = req.params;
      const updateData = req.body;

      const videoBlog = await videoBlogService.updateVideoBlog(userId, videoBlogId, updateData);

      successResponse(res, videoBlog, 'Video blog updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Delete video blog
  async deleteVideoBlog(req, res) {
    try {
      const userId = req.user.id;
      const { videoBlogId } = req.params;

      await videoBlogService.deleteVideoBlog(userId, videoBlogId);

      successResponse(res, null, 'Video blog deleted successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Create video series
  async createVideoSeries(req, res) {
    try {
      const userId = req.user.id;
      const seriesData = req.body;

      const series = await videoBlogService.createVideoSeries(userId, seriesData);

      successResponse(res, series, 'Video series created successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Add video to series
  async addVideoToSeries(req, res) {
    try {
      const userId = req.user.id;
      const { seriesId, videoBlogId } = req.params;

      const series = await videoBlogService.addVideoToSeries(userId, seriesId, videoBlogId);

      successResponse(res, series, 'Video added to series successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get video analytics
  async getVideoAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { videoBlogId } = req.params;

      const analytics = await videoBlogService.getVideoAnalytics(userId, videoBlogId);

      successResponse(res, analytics, 'Video analytics retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Generate video transcript
  async generateTranscript(req, res) {
    try {
      const { videoBlogId } = req.params;

      const transcript = await videoBlogService.generateVideoTranscript(videoBlogId);

      successResponse(res, transcript, 'Video transcript generated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Search video blogs
  async searchVideoBlogs(req, res) {
    try {
      const { q: query } = req.query;
      const filters = req.query;

      if (!query) {
        return errorResponse(res, 'Search query is required', 400);
      }

      const videoBlogs = await videoBlogService.searchVideoBlogs(query, filters);

      successResponse(res, videoBlogs, 'Video blog search completed successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get trending videos
  async getTrendingVideos(req, res) {
    try {
      const { timeframe = 'week', limit = 20 } = req.query;

      const trendingVideos = await videoBlogService.getTrendingVideos(timeframe, parseInt(limit));

      successResponse(res, trendingVideos, 'Trending videos retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's video blogs
  async getUserVideoBlogs(req, res) {
    try {
      const { userId } = req.params;
      const filters = { ...req.query, author: userId };

      const result = await videoBlogService.getVideoBlogs(filters);

      successResponse(res, result, 'User video blogs retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Like/unlike video
  async toggleLike(req, res) {
    try {
      const userId = req.user.id;
      const { videoBlogId } = req.params;

      const result = await videoBlogService.toggleLike(userId, videoBlogId);

      successResponse(res, result, 'Video like status updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get video series
  async getVideoSeries(req, res) {
    try {
      const filters = req.query;

      const series = await videoBlogService.getVideoSeries(filters);

      successResponse(res, series, 'Video series retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get single video series
  async getVideoSeriesById(req, res) {
    try {
      const { seriesId } = req.params;

      const series = await videoBlogService.getVideoSeriesById(seriesId);

      successResponse(res, series, 'Video series retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update video series
  async updateVideoSeries(req, res) {
    try {
      const userId = req.user.id;
      const { seriesId } = req.params;
      const updateData = req.body;

      const series = await videoBlogService.updateVideoSeries(userId, seriesId, updateData);

      successResponse(res, series, 'Video series updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Delete video series
  async deleteVideoSeries(req, res) {
    try {
      const userId = req.user.id;
      const { seriesId } = req.params;

      await videoBlogService.deleteVideoSeries(userId, seriesId);

      successResponse(res, null, 'Video series deleted successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update video view count (for analytics)
  async updateViewCount(req, res) {
    try {
      const { videoBlogId } = req.params;
      const { watchTime, completed } = req.body;
      const userId = req.user?.id;

      await videoBlogService.updateViewAnalytics(videoBlogId, userId, { watchTime, completed });

      successResponse(res, null, 'View analytics updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
};

module.exports = videoBlogController;