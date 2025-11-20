const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Trip = require('../models/Trip');
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const Badge = require('../models/Badge');
const Collection = require('../models/Collection');

// Get traveler dashboard statistics
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get trip statistics
    const trips = await Trip.find({ user: userId });
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const upcomingTrips = trips.filter(t => t.status === 'upcoming').length;

    // Calculate total days planned
    const totalDaysPlanned = trips.reduce((sum, trip) => {
      if (trip.startDate && trip.endDate) {
        const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0);

    // Get unique destinations (countries)
    const destinationsSet = new Set();
    trips.forEach(trip => {
      trip.items.forEach(item => {
        if (item.destination && item.destination.country) {
          destinationsSet.add(item.destination.country);
        }
      });
    });
    const countriesVisited = destinationsSet.size;

    // Get unique continents
    const continentsSet = new Set();
    trips.forEach(trip => {
      trip.items.forEach(item => {
        if (item.destination && item.destination.continent) {
          continentsSet.add(item.destination.continent);
        }
      });
    });
    const continentsVisited = continentsSet.size;

    // Calculate total cost
    const totalCost = trips.reduce((sum, trip) => {
      return sum + (trip.totalCost || 0);
    }, 0);

    // Get bookings
    const bookings = await Booking.find({ user: userId });
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((sum, booking) => {
      return sum + (booking.totalPrice || 0);
    }, 0);

    // Get blogs created
    const blogs = await Blog.find({ author: userId });
    const totalBlogs = blogs.length;
    const publishedBlogs = blogs.filter(b => b.status === 'published').length;

    // Get badges
    const badges = await Badge.find({ user: userId });
    const totalBadges = badges.length;

    // Get collections
    const collections = await Collection.find({ user: userId });
    const totalCollections = collections.length;
    const publicCollections = collections.filter(c => c.isPublic).length;

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTrips = trips.filter(t => new Date(t.createdAt) >= thirtyDaysAgo).length;
    const recentBlogs = blogs.filter(b => new Date(b.createdAt) >= thirtyDaysAgo).length;
    const recentBookings = bookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo).length;

    res.json({
      success: true,
      data: {
        trips: {
          total: totalTrips,
          completed: completedTrips,
          upcoming: upcomingTrips,
          totalDays: totalDaysPlanned,
          totalCost,
          recent: recentTrips
        },
        destinations: {
          countries: countriesVisited,
          continents: continentsVisited
        },
        bookings: {
          total: totalBookings,
          totalSpent,
          recent: recentBookings
        },
        content: {
          blogs: totalBlogs,
          published: publishedBlogs,
          collections: totalCollections,
          publicCollections,
          recent: recentBlogs
        },
        achievements: {
          badges: totalBadges
        }
      }
    });
  } catch (error) {
    console.error('Get traveler dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard statistics'
    });
  }
});

// Get trip timeline
router.get('/timeline', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    let query = { user: userId };
    
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      query.$or = [
        { startDate: { $gte: startOfYear, $lte: endOfYear } },
        { endDate: { $gte: startOfYear, $lte: endOfYear } }
      ];
    }

    const trips = await Trip.find(query)
      .sort({ startDate: -1 })
      .select('title destination startDate endDate status totalCost');

    const bookings = await Booking.find({ 
      user: userId,
      ...(year ? {
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31, 23, 59, 59)
        }
      } : {})
    })
      .populate('package', 'title destination')
      .sort({ createdAt: -1 })
      .select('package createdAt totalPrice status');

    const blogs = await Blog.find({
      author: userId,
      ...(year ? {
        publishedAt: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31, 23, 59, 59)
        }
      } : {})
    })
      .sort({ publishedAt: -1 })
      .select('title destination publishedAt views');

    // Combine and sort by date
    const timeline = [
      ...trips.map(t => ({
        type: 'trip',
        date: t.startDate || t.createdAt,
        title: t.title,
        destination: t.destination,
        status: t.status,
        cost: t.totalCost
      })),
      ...bookings.map(b => ({
        type: 'booking',
        date: b.createdAt,
        title: b.package?.title || 'Booking',
        destination: b.package?.destination,
        status: b.status,
        cost: b.totalPrice
      })),
      ...blogs.map(b => ({
        type: 'blog',
        date: b.publishedAt,
        title: b.title,
        destination: b.destination,
        views: b.views
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get timeline'
    });
  }
});

// Get travel map data (countries visited)
router.get('/map', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const trips = await Trip.find({ user: userId });
    const blogs = await Blog.find({ author: userId, status: 'published' });

    // Aggregate countries from trips and blogs
    const countryData = {};

    trips.forEach(trip => {
      trip.items.forEach(item => {
        if (item.destination && item.destination.country) {
          const country = item.destination.country;
          if (!countryData[country]) {
            countryData[country] = {
              country,
              continent: item.destination.continent,
              trips: 0,
              blogs: 0
            };
          }
          countryData[country].trips++;
        }
      });
    });

    blogs.forEach(blog => {
      if (blog.destination && blog.destination.country) {
        const country = blog.destination.country;
        if (!countryData[country]) {
          countryData[country] = {
            country,
            continent: blog.destination.continent,
            trips: 0,
            blogs: 0
          };
        }
        countryData[country].blogs++;
      }
    });

    const mapData = Object.values(countryData);

    res.json({
      success: true,
      data: {
        countries: mapData,
        totalCountries: mapData.length
      }
    });
  } catch (error) {
    console.error('Get map data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get map data'
    });
  }
});

module.exports = router;
