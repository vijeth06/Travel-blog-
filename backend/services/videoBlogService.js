const { VideoBlog, VideoSeries } = require('../models/MediaContent');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('./emailService');

class VideoBlogService {
  constructor() {
    this.supportedFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    this.maxFileSize = 500 * 1024 * 1024; // 500MB
    this.qualitySettings = {
      '720p': { width: 1280, height: 720, bitrate: '2000k' },
      '1080p': { width: 1920, height: 1080, bitrate: '4000k' },
      '4K': { width: 3840, height: 2160, bitrate: '8000k' }
    };
  }

  async uploadVideo(userId, videoFile, metadata) {
    try {
      // Validate file
      if (!this.supportedFormats.includes(metadata.format.toLowerCase())) {
        throw new Error('Unsupported video format');
      }

      if (videoFile.size > this.maxFileSize) {
        throw new Error('Video file too large. Maximum size is 500MB');
      }

      // Upload to Cloudinary with video transformations
      const uploadResult = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: 'video',
        folder: 'travel-blog/videos',
        public_id: `video_${userId}_${Date.now()}`,
        eager: [
          // Generate different quality versions
          { quality: 'auto:best', format: 'mp4' },
          { quality: 'auto:good', format: 'mp4' },
          { quality: 'auto:low', format: 'mp4' }
        ],
        eager_async: true
      });

      // Generate thumbnail from video
      const thumbnailResult = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: 'video',
        folder: 'travel-blog/thumbnails',
        public_id: `thumb_${userId}_${Date.now()}`,
        transformation: [
          { start_offset: '30%' }, // Take frame at 30% of video
          { width: 1280, height: 720, crop: 'fill' },
          { format: 'jpg', quality: 'auto' }
        ]
      });

      return {
        videoUrl: uploadResult.secure_url,
        thumbnailUrl: thumbnailResult.secure_url,
        duration: uploadResult.duration,
        size: uploadResult.bytes,
        publicId: uploadResult.public_id,
        format: uploadResult.format
      };

    } catch (error) {
      console.error('Video upload error:', error);
      throw new Error('Failed to upload video');
    }
  }

  async createVideoBlog(userId, videoBlogData) {
    try {
      const videoBlog = new VideoBlog({
        ...videoBlogData,
        author: userId,
        publishedAt: videoBlogData.status === 'published' ? new Date() : null
      });

      await videoBlog.save();

      return await VideoBlog.findById(videoBlog._id)
        .populate('author', 'name avatar')
        .populate('category', 'name color');

    } catch (error) {
      console.error('Create video blog error:', error);
      throw new Error('Failed to create video blog');
    }
  }

  async getVideoBlogs(filters = {}) {
    try {
      const {
        category,
        author,
        status = 'published',
        quality,
        minDuration,
        maxDuration,
        tags,
        location,
        sortBy = 'newest',
        page = 1,
        limit = 20
      } = filters;

      // Build query
      let query = { status };

      if (category) query.category = category;
      if (author) query.author = author;
      if (quality) query.quality = quality;
      
      if (minDuration || maxDuration) {
        query.duration = {};
        if (minDuration) query.duration.$gte = minDuration;
        if (maxDuration) query.duration.$lte = maxDuration;
      }

      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      if (location) {
        const { lat, lng, radius = 50 } = location;
        query['location.coordinates'] = {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radius * 1000
          }
        };
      }

      // Build sort
      let sortQuery = {};
      switch (sortBy) {
        case 'newest':
          sortQuery = { publishedAt: -1 };
          break;
        case 'oldest':
          sortQuery = { publishedAt: 1 };
          break;
        case 'popular':
          sortQuery = { 'analytics.totalViews': -1 };
          break;
        case 'trending':
          sortQuery = { 'analytics.engagementRate': -1 };
          break;
        case 'duration_asc':
          sortQuery = { duration: 1 };
          break;
        case 'duration_desc':
          sortQuery = { duration: -1 };
          break;
      }

      const skip = (page - 1) * limit;

      const videoBlogs = await VideoBlog.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name color')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

      const total = await VideoBlog.countDocuments(query);

      return {
        videoBlogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Get video blogs error:', error);
      throw new Error('Failed to get video blogs');
    }
  }

  async getVideoBlog(videoBlogId, userId = null) {
    try {
      const videoBlog = await VideoBlog.findById(videoBlogId)
        .populate('author', 'name avatar bio')
        .populate('category', 'name color description')
        .populate('comments')
        .populate('series', 'title description');

      if (!videoBlog) {
        throw new Error('Video blog not found');
      }

      // Increment view count (only once per user session)
      if (userId) {
        // In a real app, you'd track unique views per user
        videoBlog.views++;
        videoBlog.analytics.totalViews++;
        await videoBlog.save();
      }

      // Get related videos
      const relatedVideos = await VideoBlog.find({
        _id: { $ne: videoBlogId },
        $or: [
          { category: videoBlog.category },
          { tags: { $in: videoBlog.tags } },
          { author: videoBlog.author }
        ],
        status: 'published'
      })
      .populate('author', 'name avatar')
      .limit(5)
      .sort({ 'analytics.totalViews': -1 });

      return {
        videoBlog,
        relatedVideos
      };

    } catch (error) {
      console.error('Get video blog error:', error);
      throw new Error('Failed to get video blog');
    }
  }

  async updateVideoBlog(userId, videoBlogId, updateData) {
    try {
      const videoBlog = await VideoBlog.findById(videoBlogId);

      if (!videoBlog) {
        throw new Error('Video blog not found');
      }

      if (videoBlog.author.toString() !== userId) {
        throw new Error('Unauthorized to update this video blog');
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          videoBlog[key] = updateData[key];
        }
      });

      await videoBlog.save();

      return await VideoBlog.findById(videoBlogId)
        .populate('author', 'name avatar')
        .populate('category', 'name color');

    } catch (error) {
      console.error('Update video blog error:', error);
      throw new Error('Failed to update video blog');
    }
  }

  async deleteVideoBlog(userId, videoBlogId) {
    try {
      const videoBlog = await VideoBlog.findById(videoBlogId);

      if (!videoBlog) {
        throw new Error('Video blog not found');
      }

      if (videoBlog.author.toString() !== userId) {
        throw new Error('Unauthorized to delete this video blog');
      }

      // Delete video from Cloudinary
      if (videoBlog.videoUrl) {
        const publicId = this.extractPublicIdFromUrl(videoBlog.videoUrl);
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      }

      // Delete thumbnail from Cloudinary
      if (videoBlog.thumbnailUrl) {
        const publicId = this.extractPublicIdFromUrl(videoBlog.thumbnailUrl);
        await cloudinary.uploader.destroy(publicId);
      }

      await VideoBlog.findByIdAndDelete(videoBlogId);

      return { success: true };

    } catch (error) {
      console.error('Delete video blog error:', error);
      throw new Error('Failed to delete video blog');
    }
  }

  async createVideoSeries(userId, seriesData) {
    try {
      const series = new VideoSeries({
        ...seriesData,
        author: userId
      });

      await series.save();

      return await VideoSeries.findById(series._id)
        .populate('author', 'name avatar');

    } catch (error) {
      console.error('Create video series error:', error);
      throw new Error('Failed to create video series');
    }
  }

  async addVideoToSeries(userId, seriesId, videoBlogId) {
    try {
      const series = await VideoSeries.findById(seriesId);
      const videoBlog = await VideoBlog.findById(videoBlogId);

      if (!series || !videoBlog) {
        throw new Error('Series or video blog not found');
      }

      if (series.author.toString() !== userId) {
        throw new Error('Unauthorized to modify this series');
      }

      // Add video to series
      if (!series.videos.includes(videoBlogId)) {
        series.videos.push(videoBlogId);
        series.totalVideos = series.videos.length;
        series.totalDuration += videoBlog.duration;
        await series.save();
      }

      // Update video blog with series reference
      videoBlog.series = seriesId;
      videoBlog.episodeNumber = series.videos.length;
      await videoBlog.save();

      return series;

    } catch (error) {
      console.error('Add video to series error:', error);
      throw new Error('Failed to add video to series');
    }
  }

  async getVideoAnalytics(userId, videoBlogId) {
    try {
      const videoBlog = await VideoBlog.findById(videoBlogId);

      if (!videoBlog) {
        throw new Error('Video blog not found');
      }

      if (videoBlog.author.toString() !== userId) {
        throw new Error('Unauthorized to view analytics');
      }

      // Calculate additional analytics
      const analytics = {
        ...videoBlog.analytics.toObject(),
        performance: {
          likesRatio: videoBlog.likes.length / Math.max(videoBlog.analytics.totalViews, 1),
          commentsRatio: videoBlog.comments.length / Math.max(videoBlog.analytics.totalViews, 1),
          shareRatio: videoBlog.analytics.shareCount / Math.max(videoBlog.analytics.totalViews, 1)
        },
        comparison: {
          // Compare to user's other videos
          avgViews: 0, // You'd calculate this from user's other videos
          avgEngagement: 0
        }
      };

      return analytics;

    } catch (error) {
      console.error('Get video analytics error:', error);
      throw new Error('Failed to get video analytics');
    }
  }

  async generateVideoTranscript(videoBlogId) {
    try {
      const videoBlog = await VideoBlog.findById(videoBlogId);

      if (!videoBlog) {
        throw new Error('Video blog not found');
      }

      // This would integrate with a speech-to-text service
      // For now, return a placeholder
      const transcript = {
        language: 'en',
        confidence: 0.95,
        segments: [
          {
            start: 0,
            end: 10,
            text: 'Welcome to this amazing travel destination...'
          }
          // More segments would be generated by the service
        ],
        fullText: 'Welcome to this amazing travel destination...'
      };

      // Save transcript to video blog
      videoBlog.transcript = transcript;
      await videoBlog.save();

      return transcript;

    } catch (error) {
      console.error('Generate video transcript error:', error);
      throw new Error('Failed to generate video transcript');
    }
  }

  async searchVideoBlogs(query, filters = {}) {
    try {
      const searchQuery = {
        status: 'published',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { 'location.name': { $regex: query, $options: 'i' } },
          { 'location.country': { $regex: query, $options: 'i' } }
        ]
      };

      // Apply additional filters
      if (filters.category) searchQuery.category = filters.category;
      if (filters.quality) searchQuery.quality = filters.quality;
      if (filters.minDuration) {
        searchQuery.duration = { ...searchQuery.duration, $gte: filters.minDuration };
      }
      if (filters.maxDuration) {
        searchQuery.duration = { ...searchQuery.duration, $lte: filters.maxDuration };
      }

      const videoBlogs = await VideoBlog.find(searchQuery)
        .populate('author', 'name avatar')
        .populate('category', 'name color')
        .sort({ 'analytics.totalViews': -1 })
        .limit(filters.limit || 20);

      return videoBlogs;

    } catch (error) {
      console.error('Search video blogs error:', error);
      throw new Error('Failed to search video blogs');
    }
  }

  async getTrendingVideos(timeframe = 'week', limit = 20) {
    try {
      let dateFilter = new Date();
      
      switch (timeframe) {
        case 'day':
          dateFilter.setDate(dateFilter.getDate() - 1);
          break;
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          break;
        case 'year':
          dateFilter.setFullYear(dateFilter.getFullYear() - 1);
          break;
      }

      const trendingVideos = await VideoBlog.find({
        status: 'published',
        publishedAt: { $gte: dateFilter }
      })
      .populate('author', 'name avatar')
      .populate('category', 'name color')
      .sort({ 
        'analytics.engagementRate': -1,
        'analytics.totalViews': -1 
      })
      .limit(limit);

      return trendingVideos;

    } catch (error) {
      console.error('Get trending videos error:', error);
      throw new Error('Failed to get trending videos');
    }
  }

  extractPublicIdFromUrl(url) {
    // Extract public_id from Cloudinary URL
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}

module.exports = new VideoBlogService();