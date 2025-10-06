const photo360Service = require('../services/photo360Service');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const multer = require('multer');
const path = require('path');

// Configure multer for 360° photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/360-photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format for 360° photos'), false);
    }
  }
});

const photo360Controller = {
  // Upload 360° photo
  upload360Photo: [
    upload.single('photo'),
    async (req, res) => {
      try {
        if (!req.file) {
          return errorResponse(res, 'No photo file provided', 400);
        }

        const userId = req.user.id;
        const metadata = {
          format: path.extname(req.file.originalname).substring(1),
          originalName: req.file.originalname,
          // You would get these from image processing library
          width: req.body.width ? parseInt(req.body.width) : null,
          height: req.body.height ? parseInt(req.body.height) : null
        };

        const uploadResult = await photo360Service.upload360Photo(userId, req.file, metadata);

        successResponse(res, uploadResult, '360° photo uploaded successfully');
      } catch (error) {
        errorResponse(res, error.message);
      }
    }
  ],

  // Create 360° photo
  async create360Photo(req, res) {
    try {
      const userId = req.user.id;
      const photoData = req.body;

      const photo = await photo360Service.create360Photo(userId, photoData);

      successResponse(res, photo, '360° photo created successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get 360° photos with filters
  async get360Photos(req, res) {
    try {
      const filters = req.query;
      const result = await photo360Service.get360Photos(filters);

      successResponse(res, result, '360° photos retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get single 360° photo
  async get360Photo(req, res) {
    try {
      const { photoId } = req.params;
      const userId = req.user?.id;

      const result = await photo360Service.get360Photo(photoId, userId);

      successResponse(res, result, '360° photo retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update 360° photo
  async update360Photo(req, res) {
    try {
      const userId = req.user.id;
      const { photoId } = req.params;
      const updateData = req.body;

      const photo = await photo360Service.update360Photo(userId, photoId, updateData);

      successResponse(res, photo, '360° photo updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Delete 360° photo
  async delete360Photo(req, res) {
    try {
      const userId = req.user.id;
      const { photoId } = req.params;

      await photo360Service.delete360Photo(userId, photoId);

      successResponse(res, null, '360° photo deleted successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Add hotspot to 360° photo
  async addHotspot(req, res) {
    try {
      const userId = req.user.id;
      const { photoId } = req.params;
      const hotspotData = req.body;

      const hotspot = await photo360Service.addHotspot(userId, photoId, hotspotData);

      successResponse(res, hotspot, 'Hotspot added successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update hotspot
  async updateHotspot(req, res) {
    try {
      const userId = req.user.id;
      const { photoId, hotspotId } = req.params;
      const updateData = req.body;

      const hotspot = await photo360Service.updateHotspot(userId, photoId, hotspotId, updateData);

      successResponse(res, hotspot, 'Hotspot updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Delete hotspot
  async deleteHotspot(req, res) {
    try {
      const userId = req.user.id;
      const { photoId, hotspotId } = req.params;

      await photo360Service.deleteHotspot(userId, photoId, hotspotId);

      successResponse(res, null, 'Hotspot deleted successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Search 360° photos
  async search360Photos(req, res) {
    try {
      const { q: query } = req.query;
      const filters = req.query;

      if (!query) {
        return errorResponse(res, 'Search query is required', 400);
      }

      const photos = await photo360Service.search360Photos(query, filters);

      successResponse(res, photos, '360° photo search completed successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get featured 360° photos
  async getFeatured360Photos(req, res) {
    try {
      const { limit = 10 } = req.query;

      const photos = await photo360Service.getFeatured360Photos(parseInt(limit));

      successResponse(res, photos, 'Featured 360° photos retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get 360° photos by location
  async getPhotosByLocation(req, res) {
    try {
      const { lat, lng, radius, limit } = req.query;

      if (!lat || !lng) {
        return errorResponse(res, 'Latitude and longitude are required', 400);
      }

      const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
      const searchRadius = radius ? parseInt(radius) : 50;
      const searchLimit = limit ? parseInt(limit) : 20;

      const photos = await photo360Service.getPhotosByLocation(location, searchRadius, searchLimit);

      successResponse(res, photos, '360° photos by location retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Generate 360° photo tour
  async generate360PhotoTour(req, res) {
    try {
      const { photoIds, tourData } = req.body;

      if (!photoIds || photoIds.length === 0) {
        return errorResponse(res, 'Photo IDs are required for tour generation', 400);
      }

      const tour = await photo360Service.generate360PhotoTour(photoIds, {
        ...tourData,
        author: req.user.id
      });

      successResponse(res, tour, '360° photo tour generated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get user's 360° photos
  async getUser360Photos(req, res) {
    try {
      const { userId } = req.params;
      const filters = { ...req.query, author: userId };

      const result = await photo360Service.get360Photos(filters);

      successResponse(res, result, 'User 360° photos retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Like/unlike 360° photo
  async toggleLike(req, res) {
    try {
      const userId = req.user.id;
      const { photoId } = req.params;

      const result = await photo360Service.toggleLike(userId, photoId);

      successResponse(res, result, '360° photo like status updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get 360° photo metadata
  async getPhotoMetadata(req, res) {
    try {
      const { photoId } = req.params;

      const metadata = await photo360Service.getPhotoMetadata(photoId);

      successResponse(res, metadata, '360° photo metadata retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Update photo projection settings
  async updateProjectionSettings(req, res) {
    try {
      const userId = req.user.id;
      const { photoId } = req.params;
      const { projection, fieldOfView } = req.body;

      const photo = await photo360Service.updateProjectionSettings(userId, photoId, {
        projection,
        fieldOfView
      });

      successResponse(res, photo, 'Projection settings updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get nearby 360° photos
  async getNearby360Photos(req, res) {
    try {
      const { photoId } = req.params;
      const { radius = 10 } = req.query; // km

      const nearbyPhotos = await photo360Service.getNearby360Photos(photoId, parseInt(radius));

      successResponse(res, nearbyPhotos, 'Nearby 360° photos retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Validate 360° photo format
  async validate360Format(req, res) {
    try {
      const { photoId } = req.params;

      const validation = await photo360Service.validate360Format(photoId);

      successResponse(res, validation, '360° photo format validation completed');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Get 360° photo statistics
  async getPhotoStats(req, res) {
    try {
      const { photoId } = req.params;
      const userId = req.user.id;

      const stats = await photo360Service.getPhotoStats(userId, photoId);

      successResponse(res, stats, '360° photo statistics retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  },

  // Bulk upload 360° photos
  bulkUpload360Photos: [
    upload.array('photos', 10), // Maximum 10 photos at once
    async (req, res) => {
      try {
        if (!req.files || req.files.length === 0) {
          return errorResponse(res, 'No photo files provided', 400);
        }

        const userId = req.user.id;
        const uploadResults = [];

        for (const file of req.files) {
          try {
            const metadata = {
              format: path.extname(file.originalname).substring(1),
              originalName: file.originalname
            };

            const uploadResult = await photo360Service.upload360Photo(userId, file, metadata);
            uploadResults.push({
              filename: file.originalname,
              success: true,
              data: uploadResult
            });
          } catch (error) {
            uploadResults.push({
              filename: file.originalname,
              success: false,
              error: error.message
            });
          }
        }

        const successCount = uploadResults.filter(r => r.success).length;
        const message = `${successCount} of ${req.files.length} photos uploaded successfully`;

        successResponse(res, uploadResults, message);
      } catch (error) {
        errorResponse(res, error.message);
      }
    }
  ]
};

module.exports = photo360Controller;