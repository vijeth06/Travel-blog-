const { ARLocation, MapFeature, MapCollection } = require('../models/MediaContent');
const User = require('../models/User');

class ARLocationService {
  constructor() {
    this.maxProximityRadius = 1000; // meters
    this.supportedARTypes = ['model', 'image', 'video', 'text', 'audio'];
  }

  async createARLocation(userId, arLocationData) {
    try {
      const arLocation = new ARLocation({
        ...arLocationData,
        author: userId
      });

      await arLocation.save();

      return await ARLocation.findById(arLocation._id)
        .populate('author', 'name avatar')
        .populate('category', 'name color');

    } catch (error) {
      console.error('Create AR location error:', error);
      throw new Error('Failed to create AR location');
    }
  }

  async getARLocations(filters = {}) {
    try {
      const {
        location,
        radius = 50,
        category,
        tags,
        difficulty,
        status = 'active',
        visibility = 'public',
        sortBy = 'nearest',
        page = 1,
        limit = 50
      } = filters;

      let query = { status, visibility };

      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      
      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      let sortQuery = {};
      
      if (location && (sortBy === 'nearest' || filters.lat && filters.lng)) {
        const { lat, lng } = location || { lat: filters.lat, lng: filters.lng };
        
        query['location.coordinates'] = {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radius * 1000
          }
        };
        
        // MongoDB $near automatically sorts by distance
      } else {
        switch (sortBy) {
          case 'newest':
            sortQuery = { createdAt: -1 };
            break;
          case 'popular':
            sortQuery = { 'interactions.total': -1 };
            break;
          case 'difficulty':
            sortQuery = { difficulty: 1 };
            break;
          default:
            sortQuery = { createdAt: -1 };
        }
      }

      const skip = (page - 1) * limit;

      let arQuery = ARLocation.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name color')
        .skip(skip)
        .limit(limit);

      if (Object.keys(sortQuery).length > 0) {
        arQuery = arQuery.sort(sortQuery);
      }

      const arLocations = await arQuery;
      const total = await ARLocation.countDocuments(query);

      return {
        arLocations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Get AR locations error:', error);
      throw new Error('Failed to get AR locations');
    }
  }

  async getARLocation(arLocationId, userLocation = null) {
    try {
      const arLocation = await ARLocation.findById(arLocationId)
        .populate('author', 'name avatar bio')
        .populate('category', 'name color description');

      if (!arLocation) {
        throw new Error('AR location not found');
      }

      // Calculate distance if user location provided
      let distance = null;
      if (userLocation) {
        distance = this.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          arLocation.location.coordinates.lat,
          arLocation.location.coordinates.lng
        );
      }

      // Check if AR content should be triggered
      let shouldTrigger = false;
      if (userLocation && distance !== null) {
        shouldTrigger = this.checkTriggerConditions(arLocation, userLocation, distance);
      }

      return {
        arLocation,
        distance,
        shouldTrigger,
        triggerInfo: shouldTrigger ? this.getTriggerInfo(arLocation, distance) : null
      };

    } catch (error) {
      console.error('Get AR location error:', error);
      throw new Error('Failed to get AR location');
    }
  }

  async updateARLocation(userId, arLocationId, updateData) {
    try {
      const arLocation = await ARLocation.findById(arLocationId);

      if (!arLocation) {
        throw new Error('AR location not found');
      }

      if (arLocation.author.toString() !== userId) {
        throw new Error('Unauthorized to update this AR location');
      }

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          arLocation[key] = updateData[key];
        }
      });

      await arLocation.save();

      return await ARLocation.findById(arLocationId)
        .populate('author', 'name avatar')
        .populate('category', 'name color');

    } catch (error) {
      console.error('Update AR location error:', error);
      throw new Error('Failed to update AR location');
    }
  }

  async deleteARLocation(userId, arLocationId) {
    try {
      const arLocation = await ARLocation.findById(arLocationId);

      if (!arLocation) {
        throw new Error('AR location not found');
      }

      if (arLocation.author.toString() !== userId) {
        throw new Error('Unauthorized to delete this AR location');
      }

      await ARLocation.findByIdAndDelete(arLocationId);

      return { success: true };

    } catch (error) {
      console.error('Delete AR location error:', error);
      throw new Error('Failed to delete AR location');
    }
  }

  async recordInteraction(arLocationId, userId, deviceInfo = {}) {
    try {
      const arLocation = await ARLocation.findById(arLocationId);

      if (!arLocation) {
        throw new Error('AR location not found');
      }

      // Increment total interactions
      arLocation.interactions.total++;

      // Track device interactions
      const deviceType = deviceInfo.type || 'unknown';
      let deviceStat = arLocation.interactions.byDevice.find(d => d.device === deviceType);
      
      if (deviceStat) {
        deviceStat.count++;
      } else {
        arLocation.interactions.byDevice.push({
          device: deviceType,
          count: 1
        });
      }

      // Track location interactions (if user location provided)
      if (deviceInfo.country) {
        let locationStat = arLocation.interactions.byLocation.find(l => l.country === deviceInfo.country);
        
        if (locationStat) {
          locationStat.count++;
        } else {
          arLocation.interactions.byLocation.push({
            country: deviceInfo.country,
            count: 1
          });
        }
      }

      await arLocation.save();

      return {
        totalInteractions: arLocation.interactions.total,
        success: true
      };

    } catch (error) {
      console.error('Record AR interaction error:', error);
      throw new Error('Failed to record AR interaction');
    }
  }

  async searchARLocations(query, filters = {}) {
    try {
      const searchQuery = {
        status: 'active',
        visibility: 'public',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { 'location.address': { $regex: query, $options: 'i' } },
          { 'location.city': { $regex: query, $options: 'i' } },
          { 'location.country': { $regex: query, $options: 'i' } }
        ]
      };

      if (filters.category) searchQuery.category = filters.category;
      if (filters.difficulty) searchQuery.difficulty = filters.difficulty;
      if (filters.arType) searchQuery['arContent.type'] = filters.arType;

      const arLocations = await ARLocation.find(searchQuery)
        .populate('author', 'name avatar')
        .populate('category', 'name color')
        .sort({ 'interactions.total': -1 })
        .limit(filters.limit || 20);

      return arLocations;

    } catch (error) {
      console.error('Search AR locations error:', error);
      throw new Error('Failed to search AR locations');
    }
  }

  async getPopularARLocations(timeframe = 'week', limit = 20) {
    try {
      // This would ideally track interactions over time
      const popularLocations = await ARLocation.find({
        status: 'active',
        visibility: 'public'
      })
      .populate('author', 'name avatar')
      .populate('category', 'name color')
      .sort({ 'interactions.total': -1 })
      .limit(limit);

      return popularLocations;

    } catch (error) {
      console.error('Get popular AR locations error:', error);
      throw new Error('Failed to get popular AR locations');
    }
  }

  checkTriggerConditions(arLocation, userLocation, distance) {
    const triggers = arLocation.triggers;

    // Check proximity trigger
    if (triggers.proximity.enabled) {
      if (distance > triggers.proximity.radius) {
        return false;
      }
    }

    // Check time of day trigger
    if (triggers.timeOfDay.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime < triggers.timeOfDay.startTime || currentTime > triggers.timeOfDay.endTime) {
        return false;
      }
    }

    // Check weather trigger (would need weather API integration)
    if (triggers.weather.enabled) {
      // This would check current weather conditions
      // For now, return true as placeholder
    }

    return true;
  }

  getTriggerInfo(arLocation, distance) {
    return {
      proximity: {
        distance: Math.round(distance),
        withinRange: distance <= arLocation.triggers.proximity.radius
      },
      arContent: {
        type: arLocation.arContent.type,
        url: arLocation.arContent.url,
        scale: arLocation.arContent.scale,
        rotation: arLocation.arContent.rotation,
        position: arLocation.arContent.position
      },
      estimatedDuration: arLocation.duration || 5
    };
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}

class InteractiveMapService {
  constructor() {
    this.supportedGeometryTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint'];
    this.maxFeaturesPerCollection = 1000;
  }

  async createMapFeature(userId, featureData) {
    try {
      const mapFeature = new MapFeature({
        ...featureData,
        author: userId
      });

      await mapFeature.save();

      return await MapFeature.findById(mapFeature._id)
        .populate('author', 'name avatar')
        .populate('collections');

    } catch (error) {
      console.error('Create map feature error:', error);
      throw new Error('Failed to create map feature');
    }
  }

  async getMapFeatures(filters = {}) {
    try {
      const {
        bounds,
        category,
        tags,
        status = 'published',
        visibility = 'public',
        collection,
        sortBy = 'newest',
        page = 1,
        limit = 100
      } = filters;

      let query = { status, visibility };

      if (category) query['properties.category'] = category;
      if (collection) query.collections = collection;
      
      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      // Geographic bounds filtering
      if (bounds) {
        const { northeast, southwest } = bounds;
        query.geometry = {
          $geoWithin: {
            $box: [
              [southwest.lng, southwest.lat],
              [northeast.lng, northeast.lat]
            ]
          }
        };
      }

      let sortQuery = {};
      switch (sortBy) {
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
        case 'popular':
          sortQuery = { views: -1 };
          break;
        case 'rating':
          sortQuery = { 'properties.rating': -1 };
          break;
      }

      const skip = (page - 1) * limit;

      const features = await MapFeature.find(query)
        .populate('author', 'name avatar')
        .populate('collections', 'name')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

      const total = await MapFeature.countDocuments(query);

      return {
        features,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Get map features error:', error);
      throw new Error('Failed to get map features');
    }
  }

  async createMapCollection(userId, collectionData) {
    try {
      const mapCollection = new MapCollection({
        ...collectionData,
        author: userId
      });

      await mapCollection.save();

      return await MapCollection.findById(mapCollection._id)
        .populate('author', 'name avatar')
        .populate('features');

    } catch (error) {
      console.error('Create map collection error:', error);
      throw new Error('Failed to create map collection');
    }
  }

  async addFeatureToCollection(userId, collectionId, featureId) {
    try {
      const collection = await MapCollection.findById(collectionId);
      const feature = await MapFeature.findById(featureId);

      if (!collection || !feature) {
        throw new Error('Collection or feature not found');
      }

      if (collection.author.toString() !== userId) {
        throw new Error('Unauthorized to modify this collection');
      }

      if (collection.features.length >= this.maxFeaturesPerCollection) {
        throw new Error('Collection has reached maximum feature limit');
      }

      // Add feature to collection
      if (!collection.features.includes(featureId)) {
        collection.features.push(featureId);
        await collection.save();
      }

      // Add collection to feature
      if (!feature.collections.includes(collectionId)) {
        feature.collections.push(collectionId);
        await feature.save();
      }

      return collection;

    } catch (error) {
      console.error('Add feature to collection error:', error);
      throw new Error('Failed to add feature to collection');
    }
  }

  async generateGeoJSON(collectionId) {
    try {
      const collection = await MapCollection.findById(collectionId)
        .populate('features');

      if (!collection) {
        throw new Error('Collection not found');
      }

      const geoJSON = {
        type: 'FeatureCollection',
        metadata: {
          name: collection.name,
          description: collection.description,
          author: collection.author,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt
        },
        features: collection.features.map(feature => ({
          type: 'Feature',
          id: feature._id,
          geometry: feature.geometry,
          properties: {
            ...feature.properties,
            title: feature.title,
            description: feature.description,
            media: feature.media,
            author: feature.author,
            createdAt: feature.createdAt
          }
        }))
      };

      return geoJSON;

    } catch (error) {
      console.error('Generate GeoJSON error:', error);
      throw new Error('Failed to generate GeoJSON');
    }
  }

  async searchMapFeatures(query, filters = {}) {
    try {
      const searchQuery = {
        status: 'published',
        visibility: 'public',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { 'properties.name': { $regex: query, $options: 'i' } }
        ]
      };

      if (filters.category) searchQuery['properties.category'] = filters.category;
      if (filters.bounds) {
        const { northeast, southwest } = filters.bounds;
        searchQuery.geometry = {
          $geoWithin: {
            $box: [
              [southwest.lng, southwest.lat],
              [northeast.lng, northeast.lat]
            ]
          }
        };
      }

      const features = await MapFeature.find(searchQuery)
        .populate('author', 'name avatar')
        .sort({ views: -1 })
        .limit(filters.limit || 50);

      return features;

    } catch (error) {
      console.error('Search map features error:', error);
      throw new Error('Failed to search map features');
    }
  }
}

module.exports = {
  ARLocationService: new ARLocationService(),
  InteractiveMapService: new InteractiveMapService()
};