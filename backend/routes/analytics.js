const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const analyticsService = require('../services/analyticsService');
const { 
  TravelTimeline, 
  CarbonFootprint, 
  TripStatistics, 
  TravelInsights, 
  TravelGoals 
} = require('../models/Analytics');

// Travel Timeline Routes
router.post('/timeline/events', protect, async (req, res) => {
  try {
    const eventData = {
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      relatedId: req.body.relatedId,
      relatedModel: req.body.relatedModel,
      metadata: req.body.metadata,
      photos: req.body.photos,
      isPrivate: req.body.isPrivate
    };

    const timeline = await analyticsService.createTimelineEvent(req.user.id, eventData);
    
    res.status(201).json({
      success: true,
      message: 'Timeline event created successfully',
      data: timeline
    });
  } catch (error) {
    console.error('Create timeline event error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/timeline', protect, async (req, res) => {
  try {
    const { year } = req.query;
    const timelines = await analyticsService.getUserTimeline(
      req.user.id, 
      year ? parseInt(year) : null
    );
    
    res.json({
      success: true,
      data: timelines
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.put('/timeline/:year/events/:eventId', protect, async (req, res) => {
  try {
    const { year, eventId } = req.params;
    const timeline = await analyticsService.updateTimelineEvent(
      req.user.id,
      parseInt(year),
      eventId,
      req.body
    );

    res.json({
      success: true,
      message: 'Timeline event updated successfully',
      data: timeline
    });
  } catch (error) {
    console.error('Update timeline event error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Carbon Footprint Routes
router.post('/carbon-footprint', protect, async (req, res) => {
  try {
    const emissionData = {
      date: req.body.date,
      category: req.body.category, // flights, accommodation, localTransport, activities
      emissions: req.body.emissions,
      details: req.body.details
    };

    const footprint = await analyticsService.recordCarbonFootprint(req.user.id, emissionData);
    
    res.status(201).json({
      success: true,
      message: 'Carbon footprint recorded successfully',
      data: footprint
    });
  } catch (error) {
    console.error('Record carbon footprint error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/carbon-footprint', protect, async (req, res) => {
  try {
    const { year, month } = req.query;
    const footprints = await analyticsService.getCarbonFootprint(
      req.user.id,
      year ? parseInt(year) : null,
      month ? parseInt(month) : null
    );

    res.json({
      success: true,
      data: footprints
    });
  } catch (error) {
    console.error('Get carbon footprint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/carbon-footprint/flight-emissions', protect, async (req, res) => {
  try {
    const { fromLocation, toLocation, flightClass, passengers } = req.body;
    
    if (!fromLocation || !toLocation) {
      return res.status(400).json({
        success: false,
        error: 'From and to locations are required'
      });
    }

    const emissions = await analyticsService.calculateFlightEmissions(
      fromLocation,
      toLocation,
      flightClass || 'economy',
      passengers || 1
    );

    res.json({
      success: true,
      data: emissions
    });
  } catch (error) {
    console.error('Calculate flight emissions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Trip Statistics Routes
router.get('/statistics', protect, async (req, res) => {
  try {
    const statistics = await analyticsService.generateTripStatistics(req.user.id);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get trip statistics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/statistics/refresh', protect, async (req, res) => {
  try {
    const statistics = await analyticsService.generateTripStatistics(req.user.id);
    
    res.json({
      success: true,
      message: 'Statistics refreshed successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Refresh statistics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Travel Insights Routes
router.get('/insights', protect, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    const insights = await analyticsService.generateTravelInsights(req.user.id, period);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Get travel insights error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/insights/history', protect, async (req, res) => {
  try {
    const { period, limit = 10 } = req.query;
    
    const query = { user: req.user.id };
    if (period) query.period = period;

    const insights = await TravelInsights.find(query)
      .sort({ generatedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Get insights history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insights history'
    });
  }
});

// Travel Goals Routes
router.post('/goals', protect, async (req, res) => {
  try {
    const goalData = {
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      target: req.body.target,
      deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      priority: req.body.priority || 'medium',
      category: req.body.category
    };

    let goals = await TravelGoals.findOne({ user: req.user.id });
    
    if (!goals) {
      goals = new TravelGoals({ user: req.user.id, goals: [] });
    }

    goals.goals.push({
      ...goalData,
      current: { value: 0, unit: goalData.target.unit }
    });

    // Update summary
    goals.summary.totalGoals = goals.goals.length;
    goals.summary.activeGoals = goals.goals.filter(g => g.status === 'active').length;
    goals.summary.completedGoals = goals.goals.filter(g => g.status === 'completed').length;

    await goals.save();

    res.status(201).json({
      success: true,
      message: 'Travel goal created successfully',
      data: goals
    });
  } catch (error) {
    console.error('Create travel goal error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create travel goal'
    });
  }
});

router.get('/goals', protect, async (req, res) => {
  try {
    const goals = await TravelGoals.findOne({ user: req.user.id });
    
    res.json({
      success: true,
      data: goals || { user: req.user.id, goals: [], summary: { totalGoals: 0, activeGoals: 0, completedGoals: 0, overallProgress: 0 } }
    });
  } catch (error) {
    console.error('Get travel goals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get travel goals'
    });
  }
});

router.put('/goals/:goalId', protect, async (req, res) => {
  try {
    const { goalId } = req.params;
    const updateData = req.body;

    const goals = await TravelGoals.findOne({ user: req.user.id });
    
    if (!goals) {
      return res.status(404).json({
        success: false,
        error: 'Goals not found'
      });
    }

    const goal = goals.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Update goal fields
    Object.assign(goal, updateData);
    
    // Calculate progress percentage
    if (goal.target.value > 0) {
      goal.progress.percentage = Math.min(
        Math.round((goal.current.value / goal.target.value) * 100),
        100
      );
    }

    // Check if goal is completed
    if (goal.progress.percentage >= 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    goal.progress.lastUpdated = new Date();

    // Update summary
    goals.summary.activeGoals = goals.goals.filter(g => g.status === 'active').length;
    goals.summary.completedGoals = goals.goals.filter(g => g.status === 'completed').length;
    
    const totalProgress = goals.goals.reduce((sum, g) => sum + g.progress.percentage, 0);
    goals.summary.overallProgress = goals.goals.length > 0 ? 
      Math.round(totalProgress / goals.goals.length) : 0;

    await goals.save();

    res.json({
      success: true,
      message: 'Travel goal updated successfully',
      data: goals
    });
  } catch (error) {
    console.error('Update travel goal error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update travel goal'
    });
  }
});

router.delete('/goals/:goalId', protect, async (req, res) => {
  try {
    const { goalId } = req.params;

    const goals = await TravelGoals.findOne({ user: req.user.id });
    
    if (!goals) {
      return res.status(404).json({
        success: false,
        error: 'Goals not found'
      });
    }

    goals.goals.id(goalId).remove();

    // Update summary
    goals.summary.totalGoals = goals.goals.length;
    goals.summary.activeGoals = goals.goals.filter(g => g.status === 'active').length;
    goals.summary.completedGoals = goals.goals.filter(g => g.status === 'completed').length;

    await goals.save();

    res.json({
      success: true,
      message: 'Travel goal deleted successfully',
      data: goals
    });
  } catch (error) {
    console.error('Delete travel goal error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to delete travel goal'
    });
  }
});

// Dashboard Summary Route
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get latest data from all analytics components
    const [statistics, insights, goals, carbonFootprint] = await Promise.all([
      TripStatistics.findOne({ user: req.user.id }),
      TravelInsights.findOne({ user: req.user.id }).sort({ generatedAt: -1 }),
      TravelGoals.findOne({ user: req.user.id }),
      CarbonFootprint.find({ user: req.user.id }).sort({ year: -1, month: -1 }).limit(12)
    ]);

    // Calculate summary metrics
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const thisYearFootprint = carbonFootprint.filter(cf => cf.year === currentYear);
    const thisMonthFootprint = carbonFootprint.find(cf => cf.year === currentYear && cf.month === currentMonth);

    const dashboard = {
      tripStatistics: {
        totalTrips: statistics?.lifetime.totalTrips || 0,
        totalCountries: statistics?.lifetime.uniqueCountries || 0,
        totalDays: statistics?.lifetime.totalDays || 0,
        averageTripCost: statistics?.lifetime.averageTripCost || 0
      },
      carbonFootprint: {
        thisMonth: thisMonthFootprint?.totalEmissions || 0,
        thisYear: thisYearFootprint.reduce((sum, cf) => sum + cf.totalEmissions, 0),
        trend: thisYearFootprint.length >= 2 ? 
          ((thisYearFootprint[0].totalEmissions - thisYearFootprint[1].totalEmissions) > 0 ? 'increasing' : 'decreasing') : 'stable'
      },
      goals: {
        total: goals?.summary.totalGoals || 0,
        active: goals?.summary.activeGoals || 0,
        completed: goals?.summary.completedGoals || 0,
        overallProgress: goals?.summary.overallProgress || 0
      },
      insights: {
        lastGenerated: insights?.generatedAt || null,
        overallScore: insights?.metrics.overallScore || 0,
        topInsight: insights?.insights[0] || null
      },
      recentAchievements: statistics?.achievements
        .filter(a => a.unlockedAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .slice(0, 3) || []
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics dashboard'
    });
  }
});

// Admin Analytics Routes
router.get('/admin/overview', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const [userStats, carbonStats, goalStats] = await Promise.all([
      TripStatistics.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalTrips: { $sum: '$lifetime.totalTrips' },
            totalCountries: { $sum: '$lifetime.uniqueCountries' },
            averageTripCost: { $avg: '$lifetime.averageTripCost' }
          }
        }
      ]),
      CarbonFootprint.aggregate([
        {
          $group: {
            _id: null,
            totalEmissions: { $sum: '$totalEmissions' },
            averageEmissions: { $avg: '$totalEmissions' }
          }
        }
      ]),
      TravelGoals.aggregate([
        {
          $group: {
            _id: null,
            totalGoals: { $sum: '$summary.totalGoals' },
            completedGoals: { $sum: '$summary.completedGoals' },
            averageProgress: { $avg: '$summary.overallProgress' }
          }
        }
      ])
    ]);

    const overview = {
      users: userStats[0] || { totalUsers: 0, totalTrips: 0, totalCountries: 0, averageTripCost: 0 },
      carbon: carbonStats[0] || { totalEmissions: 0, averageEmissions: 0 },
      goals: goalStats[0] || { totalGoals: 0, completedGoals: 0, averageProgress: 0 }
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Get admin analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get admin analytics overview'
    });
  }
});

module.exports = router;
