const Continent = require('../models/Continent');
const Blog = require('../models/Blog');
const Package = require('../models/Package');

// Get all continents
const getContinents = async (req, res) => {
  try {
    const { featured, limit = 10, page = 1 } = req.query;
    
    const query = { isActive: true };
    if (featured === 'true') {
      query.featured = true;
    }
    
    const continents = await Continent.find(query)
      .sort({ popularity: -1, name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v');
    
    const total = await Continent.countDocuments(query);
    
    res.json({
      success: true,
      data: continents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching continents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching continents',
      error: error.message
    });
  }
};

// Get single continent by slug or ID
const getContinent = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const continent = await Continent.findOne({
      $or: [
        { slug: identifier },
        { _id: identifier },
        { code: identifier.toUpperCase() }
      ],
      isActive: true
    }).select('-__v');
    
    if (!continent) {
      return res.status(404).json({
        success: false,
        message: 'Continent not found'
      });
    }
    
    // Get related blogs and packages
    const [blogs, packages] = await Promise.all([
      Blog.find({ 
        'geotag.continent': continent.name,
        isPublished: true 
      }).limit(6).select('title slug thumbnail author createdAt views likes'),
      
      Package.find({ 
        'location.continent': continent.name,
        isActive: true 
      }).limit(6).select('title slug images price currency duration location rating')
    ]);
    
    res.json({
      success: true,
      data: {
        continent,
        relatedBlogs: blogs,
        relatedPackages: packages
      }
    });
  } catch (error) {
    console.error('Error fetching continent:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching continent',
      error: error.message
    });
  }
};

// Get famous places by continent
const getFamousPlaces = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { category, featured, limit = 20, page = 1 } = req.query;
    
    const continent = await Continent.findOne({
      $or: [
        { slug: identifier },
        { _id: identifier },
        { code: identifier.toUpperCase() }
      ],
      isActive: true
    });
    
    if (!continent) {
      return res.status(404).json({
        success: false,
        message: 'Continent not found'
      });
    }
    
    let places = continent.famousPlaces;
    
    // Apply filters
    if (category) {
      places = places.filter(place => place.category === category);
    }
    
    if (featured === 'true') {
      places = places.filter(place => place.featured);
    }
    
    // Sort by popularity and featured status
    places.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.popularity || 0) - (a.popularity || 0);
    });
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPlaces = places.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        continent: {
          name: continent.name,
          code: continent.code,
          slug: continent.slug
        },
        places: paginatedPlaces,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(places.length / parseInt(limit)),
          total: places.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching famous places:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching famous places',
      error: error.message
    });
  }
};

// Get place categories by continent
const getPlaceCategories = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const continent = await Continent.findOne({
      $or: [
        { slug: identifier },
        { _id: identifier },
        { code: identifier.toUpperCase() }
      ],
      isActive: true
    });
    
    if (!continent) {
      return res.status(404).json({
        success: false,
        message: 'Continent not found'
      });
    }
    
    // Get unique categories with counts
    const categoryStats = {};
    continent.famousPlaces.forEach(place => {
      if (categoryStats[place.category]) {
        categoryStats[place.category]++;
      } else {
        categoryStats[place.category] = 1;
      }
    });
    
    const categories = Object.entries(categoryStats).map(([category, count]) => ({
      name: category,
      count,
      slug: category.toLowerCase().replace(/\s+/g, '-')
    }));
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching place categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching place categories',
      error: error.message
    });
  }
};

// Search continents and places
const searchContinents = async (req, res) => {
  try {
    const { q, category, continent } = req.query;
    
    let query = { isActive: true };
    let searchResults = [];
    
    if (q) {
      // Search in continents
      const continentResults = await Continent.find({
        ...query,
        $text: { $search: q }
      }).select('name slug description heroImage famousPlaces');
      
      // Search in famous places
      const placeResults = await Continent.aggregate([
        { $match: query },
        { $unwind: '$famousPlaces' },
        {
          $match: {
            $or: [
              { 'famousPlaces.name': { $regex: q, $options: 'i' } },
              { 'famousPlaces.description': { $regex: q, $options: 'i' } },
              { 'famousPlaces.tags': { $in: [new RegExp(q, 'i')] } }
            ]
          }
        },
        {
          $project: {
            continentName: '$name',
            continentSlug: '$slug',
            place: '$famousPlaces'
          }
        }
      ]);
      
      searchResults = {
        continents: continentResults,
        places: placeResults
      };
    } else {
      // Get all continents if no search query
      const continents = await Continent.find(query)
        .sort({ featured: -1, popularity: -1 })
        .select('name slug description heroImage touristPlacesCount');
      
      searchResults = { continents };
    }
    
    res.json({
      success: true,
      data: searchResults
    });
  } catch (error) {
    console.error('Error searching continents:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching continents',
      error: error.message
    });
  }
};

// Get continent statistics
const getContinentStats = async (req, res) => {
  try {
    const stats = await Continent.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalContinents: { $sum: 1 },
          totalFamousPlaces: { $sum: '$touristPlacesCount' },
          featuredContinents: {
            $sum: { $cond: ['$featured', 1, 0] }
          },
          avgPlacesPerContinent: { $avg: '$touristPlacesCount' }
        }
      }
    ]);
    
    // Get category distribution
    const categoryStats = await Continent.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$famousPlaces' },
      {
        $group: {
          _id: '$famousPlaces.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalContinents: 0,
          totalFamousPlaces: 0,
          featuredContinents: 0,
          avgPlacesPerContinent: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching continent stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching continent statistics',
      error: error.message
    });
  }
};

module.exports = {
  getContinents,
  getContinent,
  getFamousPlaces,
  getPlaceCategories,
  searchContinents,
  getContinentStats
};