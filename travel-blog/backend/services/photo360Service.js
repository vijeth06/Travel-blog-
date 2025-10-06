const { Photo360 } = require('../models/MediaContent');
const cloudinary = require('../config/cloudinary');

class Photo360Service {
  constructor() {
    this.supportedFormats = ['jpg', 'jpeg', 'png', 'tiff'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.minResolution = { width: 2048, height: 1024 }; // Minimum for 360° photos
  }

  async upload360Photo(userId, photoFile, metadata) {
    try {
      // Validate file
      if (!this.supportedFormats.includes(metadata.format.toLowerCase())) {
        throw new Error('Unsupported image format for 360° photos');
      }

      if (photoFile.size > this.maxFileSize) {
        throw new Error('Photo file too large. Maximum size is 50MB');
      }

      // Validate 360° photo dimensions (should be 2:1 ratio for equirectangular)
      if (metadata.width && metadata.height) {
        const ratio = metadata.width / metadata.height;
        if (ratio < 1.8 || ratio > 2.2) {
          console.warn('Image ratio suggests this might not be a proper 360° photo');
        }
      }

      // Upload to Cloudinary with 360° optimizations
      const uploadResult = await cloudinary.uploader.upload(photoFile.path, {
        folder: 'travel-blog/360-photos',
        public_id: `360_${userId}_${Date.now()}`,
        quality: 'auto:best',
        format: 'jpg',
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ],
        eager: [
          // Generate different quality versions for different devices
          { width: 4096, height: 2048, crop: 'fill', quality: 'auto:best' }, // High quality
          { width: 2048, height: 1024, crop: 'fill', quality: 'auto:good' }, // Medium quality
          { width: 1024, height: 512, crop: 'fill', quality: 'auto:low' }    // Low quality
        ],
        eager_async: true
      });

      // Generate thumbnail (standard perspective view)
      const thumbnailResult = await cloudinary.uploader.upload(photoFile.path, {
        folder: 'travel-blog/360-thumbnails',
        public_id: `360_thumb_${userId}_${Date.now()}`,
        transformation: [
          { width: 400, height: 300, crop: 'fill' },
          { quality: 'auto:good' }
        ]
      });

      return {
        imageUrl: uploadResult.secure_url,
        thumbnailUrl: thumbnailResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.bytes,
        publicId: uploadResult.public_id,
        format: uploadResult.format
      };

    } catch (error) {
      console.error('360° photo upload error:', error);
      throw new Error('Failed to upload 360° photo');
    }
  }

  async create360Photo(userId, photoData) {
    try {
      const photo360 = new Photo360({
        ...photoData,
        author: userId
      });

      await photo360.save();

      return await Photo360.findById(photo360._id)
        .populate('author', 'name avatar')
        .populate('category', 'name color');

    } catch (error) {
      console.error('Create 360° photo error:', error);
      throw new Error('Failed to create 360° photo');
    }
  }

  async get360Photos(filters = {}) {
    try {
      const {
        author,
        category,
        tags,
        location,
        visibility = 'public',
        sortBy = 'newest',
        page = 1,
        limit = 20
      } = filters;

      // Build query
      let query = { visibility };

      if (author) query.author = author;
      if (category) query.category = category;
      
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
          sortQuery = { createdAt: -1 };
          break;
        case 'oldest':
          sortQuery = { createdAt: 1 };
          break;
        case 'popular':
          sortQuery = { views: -1 };
          break;
        case 'liked':
          sortQuery = { likes: -1 };
          break;
      }

      const skip = (page - 1) * limit;

      const photos = await Photo360.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name color')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

      const total = await Photo360.countDocuments(query);

      return {
        photos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Get 360° photos error:', error);
      throw new Error('Failed to get 360° photos');
    }
  }

  async get360Photo(photoId, userId = null) {
    try {
      const photo = await Photo360.findById(photoId)
        .populate('author', 'name avatar bio')
        .populate('category', 'name color description')
        .populate('comments');

      if (!photo) {
        throw new Error('360° photo not found');
      }

      // Increment view count
      if (userId) {
        photo.views++;
        await photo.save();
      }

      // Get nearby 360° photos
      const nearbyPhotos = await Photo360.find({
        _id: { $ne: photoId },
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [photo.location.coordinates.lng, photo.location.coordinates.lat]
            },
            $maxDistance: 10000 // 10km
          }
        },
        visibility: 'public'
      })
      .populate('author', 'name avatar')
      .limit(5);

      return {
        photo,
        nearbyPhotos
      };

    } catch (error) {
      console.error('Get 360° photo error:', error);
      throw new Error('Failed to get 360° photo');
    }
  }

  async update360Photo(userId, photoId, updateData) {
    try {
      const photo = await Photo360.findById(photoId);

      if (!photo) {
        throw new Error('360° photo not found');
      }

      if (photo.author.toString() !== userId) {
        throw new Error('Unauthorized to update this photo');
      }

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          photo[key] = updateData[key];
        }
      });

      await photo.save();

      return await Photo360.findById(photoId)
        .populate('author', 'name avatar')
        .populate('category', 'name color');

    } catch (error) {
      console.error('Update 360° photo error:', error);
      throw new Error('Failed to update 360° photo');
    }
  }

  async delete360Photo(userId, photoId) {
    try {
      const photo = await Photo360.findById(photoId);

      if (!photo) {
        throw new Error('360° photo not found');
      }

      if (photo.author.toString() !== userId) {
        throw new Error('Unauthorized to delete this photo');
      }

      // Delete from Cloudinary
      if (photo.imageUrl) {
        const publicId = this.extractPublicIdFromUrl(photo.imageUrl);
        await cloudinary.uploader.destroy(publicId);
      }

      if (photo.thumbnailUrl) {
        const publicId = this.extractPublicIdFromUrl(photo.thumbnailUrl);
        await cloudinary.uploader.destroy(publicId);
      }

      await Photo360.findByIdAndDelete(photoId);

      return { success: true };

    } catch (error) {
      console.error('Delete 360° photo error:', error);
      throw new Error('Failed to delete 360° photo');
    }
  }

  async addHotspot(userId, photoId, hotspotData) {
    try {
      const photo = await Photo360.findById(photoId);

      if (!photo) {
        throw new Error('360° photo not found');
      }

      if (photo.author.toString() !== userId) {
        throw new Error('Unauthorized to modify this photo');
      }

      // Generate unique ID for hotspot
      const hotspotId = `hotspot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const hotspot = {
        id: hotspotId,
        ...hotspotData
      };

      photo.hotspots.push(hotspot);
      await photo.save();

      return hotspot;

    } catch (error) {
      console.error('Add hotspot error:', error);
      throw new Error('Failed to add hotspot');
    }
  }

  async updateHotspot(userId, photoId, hotspotId, updateData) {
    try {
      const photo = await Photo360.findById(photoId);

      if (!photo) {
        throw new Error('360° photo not found');
      }

      if (photo.author.toString() !== userId) {
        throw new Error('Unauthorized to modify this photo');
      }

      const hotspot = photo.hotspots.id(hotspotId);
      if (!hotspot) {
        throw new Error('Hotspot not found');
      }

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          hotspot[key] = updateData[key];
        }
      });

      await photo.save();

      return hotspot;

    } catch (error) {
      console.error('Update hotspot error:', error);
      throw new Error('Failed to update hotspot');
    }
  }

  async deleteHotspot(userId, photoId, hotspotId) {
    try {
      const photo = await Photo360.findById(photoId);

      if (!photo) {
        throw new Error('360° photo not found');
      }

      if (photo.author.toString() !== userId) {
        throw new Error('Unauthorized to modify this photo');
      }

      photo.hotspots = photo.hotspots.filter(h => h.id !== hotspotId);
      await photo.save();

      return { success: true };

    } catch (error) {
      console.error('Delete hotspot error:', error);
      throw new Error('Failed to delete hotspot');
    }
  }

  async search360Photos(query, filters = {}) {
    try {
      const searchQuery = {
        visibility: 'public',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { 'location.name': { $regex: query, $options: 'i' } },
          { 'location.country': { $regex: query, $options: 'i' } }
        ]
      };

      if (filters.category) searchQuery.category = filters.category;

      const photos = await Photo360.find(searchQuery)
        .populate('author', 'name avatar')
        .populate('category', 'name color')
        .sort({ views: -1 })
        .limit(filters.limit || 20);

      return photos;

    } catch (error) {
      console.error('Search 360° photos error:', error);
      throw new Error('Failed to search 360° photos');
    }
  }

  async getFeatured360Photos(limit = 10) {
    try {
      const featuredPhotos = await Photo360.find({
        visibility: 'public',
        featured: true
      })
      .populate('author', 'name avatar')
      .populate('category', 'name color')
      .sort({ views: -1 })
      .limit(limit);

      return featuredPhotos;

    } catch (error) {
      console.error('Get featured 360° photos error:', error);
      throw new Error('Failed to get featured 360° photos');
    }
  }

  async getPhotosByLocation(location, radius = 50, limit = 20) {
    try {
      const { lat, lng } = location;

      const photos = await Photo360.find({
        visibility: 'public',
        'location.coordinates': {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radius * 1000
          }
        }
      })
      .populate('author', 'name avatar')
      .populate('category', 'name color')
      .limit(limit);

      return photos;

    } catch (error) {
      console.error('Get photos by location error:', error);
      throw new Error('Failed to get photos by location');
    }
  }

  async generate360PhotoTour(photoIds, tourData) {
    try {
      // Create a virtual tour from multiple 360° photos
      const photos = await Photo360.find({
        _id: { $in: photoIds },
        visibility: 'public'
      })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });

      if (photos.length === 0) {
        throw new Error('No photos found for tour');
      }

      const tour = {
        id: `tour_${Date.now()}`,
        title: tourData.title || 'Virtual Tour',
        description: tourData.description || '',
        photos: photos.map((photo, index) => ({
          id: photo._id,
          title: photo.title,
          imageUrl: photo.imageUrl,
          hotspots: photo.hotspots,
          location: photo.location,
          order: index + 1,
          // Add navigation hotspots to connect photos
          navigationHotspots: this.generateNavigationHotspots(photos, index)
        })),
        startingPhoto: photos[0]._id,
        metadata: {
          totalPhotos: photos.length,
          createdAt: new Date(),
          author: tourData.author
        }
      };

      return tour;

    } catch (error) {
      console.error('Generate 360° photo tour error:', error);
      throw new Error('Failed to generate 360° photo tour');
    }
  }

  generateNavigationHotspots(photos, currentIndex) {
    const hotspots = [];

    // Add previous photo hotspot
    if (currentIndex > 0) {
      hotspots.push({
        id: `nav_prev_${currentIndex}`,
        x: 10, // Left side
        y: 50, // Center vertically
        type: 'link',
        title: 'Previous Location',
        content: photos[currentIndex - 1].title,
        action: {
          type: 'navigate',
          target: photos[currentIndex - 1]._id
        }
      });
    }

    // Add next photo hotspot
    if (currentIndex < photos.length - 1) {
      hotspots.push({
        id: `nav_next_${currentIndex}`,
        x: 90, // Right side
        y: 50, // Center vertically
        type: 'link',
        title: 'Next Location',
        content: photos[currentIndex + 1].title,
        action: {
          type: 'navigate',
          target: photos[currentIndex + 1]._id
        }
      });
    }

    return hotspots;
  }

  extractPublicIdFromUrl(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}

module.exports = new Photo360Service();