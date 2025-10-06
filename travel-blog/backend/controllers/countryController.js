const Country = require('../models/Country');
const Blog = require('../models/Blog');
const Package = require('../models/Package');

// Get all countries with optional filters
exports.getCountries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { 
      continent, 
      region, 
      isIndia, 
      featured, 
      search,
      sortBy = 'name'
    } = req.query;

    // Build query
    let query = { isActive: true };
    
    if (continent) query.continent = continent;
    if (region) query.region = region;
    if (isIndia !== undefined) query.isIndia = isIndia === 'true';
    if (featured === 'true') query.featured = true;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { popularDestinations: { $in: [new RegExp(search, 'i')] } },
        { capital: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'popularity':
        sortCriteria = { popularity: -1, blogsCount: -1 };
        break;
      case 'blogs':
        sortCriteria = { blogsCount: -1 };
        break;
      case 'packages':
        sortCriteria = { packagesCount: -1 };
        break;
      case 'name':
      default:
        sortCriteria = { name: 1 };
        break;
    }

    const countries = await Country.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const total = await Country.countDocuments(query);

    res.json({
      countries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCountries: total
    });
  } catch (err) {
    console.error('Get countries error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get single country by slug or ID
exports.getCountry = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by slug first, then by ID
    let country = await Country.findOne({ slug: identifier, isActive: true });
    if (!country) {
      country = await Country.findById(identifier);
    }
    
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    // Get related blogs and packages
    const [blogs, packages] = await Promise.all([
      Blog.find({ 
        'geotag.country': country.name, 
        status: 'published' 
      })
      .populate('author', 'name avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(6),
      
      Package.find({ 
        'location.country': country.name,
        isActive: true 
      })
      .sort({ createdAt: -1 })
      .limit(6)
    ]);

    res.json({
      country,
      relatedBlogs: blogs,
      relatedPackages: packages
    });
  } catch (err) {
    console.error('Get country error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Search countries
exports.searchCountries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const {
      q: searchQuery,
      continent,
      region,
      isIndia,
      sortBy = 'relevance'
    } = req.query;

    // Build search query
    let query = { isActive: true };
    
    // Text search
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { popularDestinations: { $in: [new RegExp(searchQuery, 'i')] } },
        { capital: { $regex: searchQuery, $options: 'i' } },
        { languages: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Filters
    if (continent) query.continent = continent;
    if (region) query.region = region;
    if (isIndia !== undefined) query.isIndia = isIndia === 'true';

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'popularity':
        sortCriteria = { featured: -1, popularity: -1, blogsCount: -1 };
        break;
      case 'name':
        sortCriteria = { name: 1 };
        break;
      case 'blogs':
        sortCriteria = { blogsCount: -1 };
        break;
      case 'packages':
        sortCriteria = { packagesCount: -1 };
        break;
      case 'relevance':
      default:
        sortCriteria = { featured: -1, popularity: -1, name: 1 };
        break;
    }

    const countries = await Country.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const total = await Country.countDocuments(query);

    res.json({
      results: countries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      query: searchQuery
    });
  } catch (err) {
    console.error('Search countries error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get featured countries
exports.getFeaturedCountries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const countries = await Country.find({ 
      isActive: true, 
      featured: true 
    })
    .sort({ popularity: -1, blogsCount: -1 })
    .limit(limit);

    res.json(countries);
  } catch (err) {
    console.error('Get featured countries error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get countries by continent
exports.getCountriesByContinent = async (req, res) => {
  try {
    const { continent } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const countries = await Country.find({ 
      continent: continent,
      isActive: true 
    })
    .sort({ popularity: -1, name: 1 })
    .limit(limit);

    res.json(countries);
  } catch (err) {
    console.error('Get countries by continent error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get Indian states/regions
exports.getIndianRegions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const regions = await Country.find({ 
      isIndia: true,
      isActive: true 
    })
    .sort({ popularity: -1, name: 1 })
    .limit(limit);

    res.json(regions);
  } catch (err) {
    console.error('Get Indian regions error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get currency information for a country
exports.getCountryCurrency = async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    const country = await Country.findOne({ 
      code: countryCode.toUpperCase(),
      isActive: true 
    }).select('name code currency');
    
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    res.json({
      country: country.name,
      code: country.code,
      currency: country.currency
    });
  } catch (err) {
    console.error('Get country currency error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get popular destinations for a country
exports.getPopularDestinations = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let country = await Country.findOne({ slug: identifier, isActive: true });
    if (!country) {
      country = await Country.findById(identifier);
    }
    
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    // Get blogs grouped by destinations
    const destinations = await Blog.aggregate([
      {
        $match: {
          'geotag.country': country.name,
          status: 'published'
        }
      },
      {
        $group: {
          _id: '$geotag.city',
          count: { $sum: 1 },
          blogs: { $push: { _id: '$_id', title: '$title', featuredImage: '$featuredImage' } }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      country: country.name,
      destinations: destinations.filter(d => d._id), // Remove null cities
      popularDestinations: country.popularDestinations
    });
  } catch (err) {
    console.error('Get popular destinations error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};