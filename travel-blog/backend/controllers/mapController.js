const axios = require('axios');
const User = require('../models/User');

// Geocode location (convert address to coordinates)
exports.geocodeLocation = async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'TravelBlog/1.0'
      }
    });

    if (response.data.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const location = response.data[0];
    res.json({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      address: location.display_name,
      country: location.address?.country,
      city: location.address?.city || location.address?.town || location.address?.village
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Failed to geocode location' });
  }
};

// Get nearby places (simplified version)
exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Using Overpass API to get nearby places (free alternative)
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"](around:${radius},${lat},${lng});
        node["amenity"~"restaurant|cafe|hotel"](around:${radius},${lat},${lng});
      );
      out body;
    `;

    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });

    const places = response.data.elements.map(element => ({
      id: element.id,
      name: element.tags?.name || 'Unknown',
      type: element.tags?.tourism || element.tags?.amenity || 'place',
      lat: element.lat,
      lng: element.lon,
      tags: element.tags
    }));

    res.json(places);
  } catch (error) {
    console.error('Nearby places error:', error);
    res.status(500).json({ message: 'Failed to get nearby places' });
  }
};

// Get route between locations (simplified)
exports.getRoute = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;
    
    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ message: 'Start and end coordinates are required' });
    }

    // Using OpenRouteService API (free with registration)
    // For now, returning a simple direct route
    res.json({
      distance: calculateDistance(startLat, startLng, endLat, endLng),
      duration: 'Estimated',
      route: [
        { lat: parseFloat(startLat), lng: parseFloat(startLng) },
        { lat: parseFloat(endLat), lng: parseFloat(endLng) }
      ]
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ message: 'Failed to get route' });
  }
};

// Save favorite location
exports.saveFavoriteLocation = async (req, res) => {
  try {
    const { name, lat, lng, address, description } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize favoriteLocations if it doesn't exist
    if (!user.favoriteLocations) {
      user.favoriteLocations = [];
    }

    const favoriteLocation = {
      name,
      lat,
      lng,
      address,
      description,
      createdAt: new Date()
    };

    user.favoriteLocations.push(favoriteLocation);
    await user.save();

    res.status(201).json({ message: 'Location saved to favorites', location: favoriteLocation });
  } catch (error) {
    console.error('Save favorite location error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get user's favorite locations
exports.getFavoriteLocations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favoriteLocations');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favoriteLocations || []);
  } catch (error) {
    console.error('Get favorite locations error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete favorite location
exports.deleteFavoriteLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favoriteLocations) {
      return res.status(404).json({ message: 'No favorite locations found' });
    }

    user.favoriteLocations = user.favoriteLocations.filter(
      location => location._id.toString() !== req.params.id
    );

    await user.save();
    res.json({ message: 'Favorite location deleted successfully' });
  } catch (error) {
    console.error('Delete favorite location error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100;
}