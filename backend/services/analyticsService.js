const { 
  TravelTimeline, 
  CarbonFootprint, 
  TripStatistics, 
  TravelInsights, 
  TravelGoals 
} = require('../models/Analytics');
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const User = require('../models/User');

class AnalyticsService {
  constructor() {
    this.carbonEmissionFactors = {
      // kg CO2 per km
      flight: {
        economy: 0.255,
        business: 0.433,
        first: 0.602
      },
      car: 0.192,
      bus: 0.082,
      train: 0.041,
      taxi: 0.192,
      metro: 0.055,
      // kg CO2 per night
      accommodation: {
        hotel: 12.5,
        hostel: 8.2,
        apartment: 6.1,
        villa: 15.3,
        camping: 2.1
      }
    };
  }

  // Travel Timeline Management
  async createTimelineEvent(userId, eventData) {
    try {
      const year = new Date(eventData.date).getFullYear();
      
      let timeline = await TravelTimeline.findOne({ user: userId, year });
      
      if (!timeline) {
        timeline = new TravelTimeline({
          user: userId,
          year,
          events: []
        });
      }

      // Add new event
      timeline.events.push({
        type: eventData.type,
        title: eventData.title,
        description: eventData.description,
        date: new Date(eventData.date),
        location: eventData.location,
        relatedId: eventData.relatedId,
        relatedModel: eventData.relatedModel,
        metadata: eventData.metadata,
        photos: eventData.photos || [],
        isPrivate: eventData.isPrivate || false
      });

      // Sort events by date
      timeline.events.sort((a, b) => new Date(a.date) - new Date(b.date));

      await timeline.save();
      return timeline;
    } catch (error) {
      console.error('Create timeline event error:', error);
      throw new Error('Failed to create timeline event');
    }
  }

  async getUserTimeline(userId, year = null) {
    try {
      const query = { user: userId };
      if (year) query.year = year;

      const timelines = await TravelTimeline.find(query)
        .populate('user', 'name avatar')
        .sort({ year: -1 });

      return timelines;
    } catch (error) {
      console.error('Get user timeline error:', error);
      throw new Error('Failed to get user timeline');
    }
  }

  async updateTimelineEvent(userId, year, eventId, updateData) {
    try {
      const timeline = await TravelTimeline.findOne({ user: userId, year });
      
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      const event = timeline.events.id(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      Object.assign(event, updateData);
      await timeline.save();

      return timeline;
    } catch (error) {
      console.error('Update timeline event error:', error);
      throw new Error('Failed to update timeline event');
    }
  }

  // Carbon Footprint Tracking
  async calculateFlightEmissions(fromLocation, toLocation, flightClass = 'economy', passengers = 1) {
    try {
      // Simplified distance calculation (in real implementation, use proper aviation distance API)
      const distance = this.calculateDistance(fromLocation, toLocation);
      const emissionFactor = this.carbonEmissionFactors.flight[flightClass];
      
      // Add additional factors for short vs long flights
      let adjustedFactor = emissionFactor;
      if (distance < 500) {
        adjustedFactor *= 1.3; // Short flights are less efficient
      } else if (distance > 3000) {
        adjustedFactor *= 0.9; // Long flights are more efficient per km
      }

      const emissions = distance * adjustedFactor * passengers;
      
      return {
        distance,
        emissions: Math.round(emissions * 100) / 100,
        emissionFactor: adjustedFactor,
        passengers
      };
    } catch (error) {
      console.error('Calculate flight emissions error:', error);
      throw new Error('Failed to calculate flight emissions');
    }
  }

  async recordCarbonFootprint(userId, emissionData) {
    try {
      const date = new Date(emissionData.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      let footprint = await CarbonFootprint.findOne({ user: userId, year, month });

      if (!footprint) {
        footprint = new CarbonFootprint({
          user: userId,
          year,
          month,
          breakdown: {
            flights: { emissions: 0, details: [] },
            accommodation: { emissions: 0, details: [] },
            localTransport: { emissions: 0, details: [] },
            activities: { emissions: 0, details: [] }
          }
        });
      }

      // Add emission data to appropriate category
      const category = emissionData.category; // flights, accommodation, localTransport, activities
      if (footprint.breakdown[category]) {
        footprint.breakdown[category].details.push(emissionData.details);
        footprint.breakdown[category].emissions += emissionData.emissions;
        footprint.totalEmissions += emissionData.emissions;
      }

      await footprint.save();
      
      // Update comparison data
      await this.updateCarbonComparisons(footprint);

      return footprint;
    } catch (error) {
      console.error('Record carbon footprint error:', error);
      throw new Error('Failed to record carbon footprint');
    }
  }

  async updateCarbonComparisons(footprint) {
    try {
      const { user, year, month } = footprint;

      // Previous month comparison
      const prevMonth = await CarbonFootprint.findOne({
        user,
        year: month === 1 ? year - 1 : year,
        month: month === 1 ? 12 : month - 1
      });
      
      footprint.comparison.previousMonth = prevMonth ? prevMonth.totalEmissions : 0;

      // Previous year comparison
      const prevYear = await CarbonFootprint.findOne({
        user,
        year: year - 1,
        month
      });
      
      footprint.comparison.previousYear = prevYear ? prevYear.totalEmissions : 0;

      // Average user comparison (simplified - use real data in production)
      const avgUser = await CarbonFootprint.aggregate([
        { $match: { year, month } },
        { $group: { _id: null, avgEmissions: { $avg: '$totalEmissions' } } }
      ]);
      
      footprint.comparison.averageUser = avgUser[0]?.avgEmissions || 0;
      footprint.comparison.globalAverage = 1000; // kg CO2 per month global average

      await footprint.save();
    } catch (error) {
      console.error('Update carbon comparisons error:', error);
    }
  }

  async getCarbonFootprint(userId, year = null, month = null) {
    try {
      const query = { user: userId };
      if (year) query.year = year;
      if (month) query.month = month;

      const footprints = await CarbonFootprint.find(query)
        .sort({ year: -1, month: -1 });

      return footprints;
    } catch (error) {
      console.error('Get carbon footprint error:', error);
      throw new Error('Failed to get carbon footprint');
    }
  }

  // Trip Statistics Generation
  async generateTripStatistics(userId) {
    try {
      // Get all user's travel data
      const timelines = await TravelTimeline.find({ user: userId });
      const bookings = await Booking.find({ user: userId });
      const blogs = await Blog.find({ author: userId });

      let statistics = await TripStatistics.findOne({ user: userId });
      
      if (!statistics) {
        statistics = new TripStatistics({ user: userId });
      }

      // Calculate lifetime statistics
      const allEvents = timelines.flatMap(t => t.events);
      const tripEvents = allEvents.filter(e => e.type === 'trip');

      statistics.lifetime = {
        totalTrips: tripEvents.length,
        totalDays: tripEvents.reduce((sum, trip) => sum + (trip.metadata?.duration || 0), 0),
        totalCost: tripEvents.reduce((sum, trip) => sum + (trip.metadata?.cost || 0), 0),
        totalDistance: tripEvents.reduce((sum, trip) => sum + (trip.metadata?.distance || 0), 0),
        uniqueCountries: new Set(allEvents.map(e => e.location?.country).filter(Boolean)).size,
        uniqueCities: new Set(allEvents.map(e => e.location?.city).filter(Boolean)).size
      };

      // Calculate averages
      if (statistics.lifetime.totalTrips > 0) {
        statistics.lifetime.averageTripDuration = Math.round(statistics.lifetime.totalDays / statistics.lifetime.totalTrips);
        statistics.lifetime.averageTripCost = Math.round(statistics.lifetime.totalCost / statistics.lifetime.totalTrips);
      }

      // Calculate yearly breakdown
      const yearlyData = {};
      timelines.forEach(timeline => {
        const year = timeline.year;
        const tripEvents = timeline.events.filter(e => e.type === 'trip');
        
        yearlyData[year] = {
          year,
          trips: tripEvents.length,
          days: tripEvents.reduce((sum, trip) => sum + (trip.metadata?.duration || 0), 0),
          cost: tripEvents.reduce((sum, trip) => sum + (trip.metadata?.cost || 0), 0),
          countries: new Set(timeline.events.map(e => e.location?.country).filter(Boolean)).size,
          cities: new Set(timeline.events.map(e => e.location?.city).filter(Boolean)).size,
          distance: tripEvents.reduce((sum, trip) => sum + (trip.metadata?.distance || 0), 0)
        };
      });

      statistics.yearly = Object.values(yearlyData);

      // Calculate preferences
      await this.calculateTravelPreferences(statistics, allEvents);

      // Generate achievements
      await this.generateAchievements(statistics, userId);

      statistics.lastCalculated = new Date();
      await statistics.save();

      return statistics;
    } catch (error) {
      console.error('Generate trip statistics error:', error);
      throw new Error('Failed to generate trip statistics');
    }
  }

  async calculateTravelPreferences(statistics, events) {
    try {
      // Favorite destinations
      const destinationCount = {};
      const destinationDays = {};
      const destinationRatings = {};

      events.forEach(event => {
        if (event.location?.country) {
          const dest = `${event.location.city}, ${event.location.country}`;
          destinationCount[dest] = (destinationCount[dest] || 0) + 1;
          destinationDays[dest] = (destinationDays[dest] || 0) + (event.metadata?.duration || 1);
          
          if (event.metadata?.rating) {
            if (!destinationRatings[dest]) destinationRatings[dest] = [];
            destinationRatings[dest].push(event.metadata.rating);
          }
        }
      });

      statistics.preferences.favoriteDestinations = Object.entries(destinationCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([destination, visits]) => ({
          destination,
          visits,
          totalDays: destinationDays[destination] || 0,
          averageRating: destinationRatings[destination] ? 
            destinationRatings[destination].reduce((a, b) => a + b, 0) / destinationRatings[destination].length : 0,
          lastVisit: events
            .filter(e => `${e.location?.city}, ${e.location?.country}` === destination)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date
        }));

      // Favorite categories
      const categoryCount = {};
      events.forEach(event => {
        if (event.metadata?.category) {
          categoryCount[event.metadata.category] = (categoryCount[event.metadata.category] || 0) + 1;
        }
      });

      const totalEvents = Object.values(categoryCount).reduce((a, b) => a + b, 0);
      statistics.preferences.favoriteCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({
          category,
          count,
          percentage: Math.round((count / totalEvents) * 100)
        }));

      // Travel style analysis
      const costs = events.map(e => e.metadata?.cost).filter(Boolean);
      const durations = events.map(e => e.metadata?.duration).filter(Boolean);

      if (costs.length > 0) {
        statistics.preferences.travelStyle.budgetRange = {
          min: Math.min(...costs),
          max: Math.max(...costs),
          average: Math.round(costs.reduce((a, b) => a + b, 0) / costs.length)
        };
      }

      if (durations.length > 0) {
        statistics.preferences.travelStyle.durationPreference = {
          average: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          shortest: Math.min(...durations),
          longest: Math.max(...durations)
        };
      }

      // Seasonality analysis
      const monthlyTrips = Array(12).fill(0);
      events.forEach(event => {
        const month = new Date(event.date).getMonth();
        monthlyTrips[month]++;
      });

      statistics.preferences.travelStyle.seasonality = monthlyTrips.map((trips, index) => ({
        month: index + 1,
        trips
      }));

    } catch (error) {
      console.error('Calculate travel preferences error:', error);
    }
  }

  async generateAchievements(statistics, userId) {
    try {
      const achievements = [];
      const { lifetime } = statistics;

      // Define achievement criteria
      const achievementCriteria = [
        {
          type: 'first_trip',
          title: 'First Adventure',
          description: 'Completed your first trip',
          threshold: 1,
          metric: 'totalTrips',
          badge: '🎒'
        },
        {
          type: 'world_traveler',
          title: 'World Traveler',
          description: 'Visited 10 different countries',
          threshold: 10,
          metric: 'uniqueCountries',
          badge: '🌍'
        },
        {
          type: 'continent_hopper',
          title: 'Continent Hopper',
          description: 'Visited all 7 continents',
          threshold: 7,
          metric: 'continents',
          badge: '🗺️'
        },
        {
          type: 'budget_master',
          title: 'Budget Master',
          description: 'Completed 5 trips under $500 each',
          threshold: 5,
          metric: 'budgetTrips',
          badge: '💰'
        },
        {
          type: 'eco_warrior',
          title: 'Eco Warrior',
          description: 'Offset 1000kg of CO2 emissions',
          threshold: 1000,
          metric: 'carbonOffset',
          badge: '🌱'
        }
      ];

      for (const criteria of achievementCriteria) {
        let currentValue = 0;
        
        switch (criteria.metric) {
          case 'totalTrips':
            currentValue = lifetime.totalTrips;
            break;
          case 'uniqueCountries':
            currentValue = lifetime.uniqueCountries;
            break;
          // Add more metric calculations as needed
        }

        if (currentValue >= criteria.threshold) {
          const existingAchievement = statistics.achievements.find(a => a.type === criteria.type);
          
          if (!existingAchievement) {
            achievements.push({
              type: criteria.type,
              title: criteria.title,
              description: criteria.description,
              unlockedAt: new Date(),
              criteria: {
                threshold: criteria.threshold,
                metric: criteria.metric
              },
              badge: criteria.badge,
              isVisible: true
            });
          }
        }
      }

      statistics.achievements = [...statistics.achievements, ...achievements];
    } catch (error) {
      console.error('Generate achievements error:', error);
    }
  }

  // Travel Insights Generation
  async generateTravelInsights(userId, period = 'monthly') {
    try {
      const statistics = await TripStatistics.findOne({ user: userId });
      const timelines = await TravelTimeline.find({ user: userId });
      const carbonData = await CarbonFootprint.find({ user: userId });

      if (!statistics) {
        throw new Error('No travel statistics found for user');
      }

      const insights = new TravelInsights({
        user: userId,
        period,
        insights: [],
        recommendations: {
          destinations: [],
          experiences: [],
          budgetOptimizations: [],
          sustainabilityTips: []
        }
      });

      // Generate spending pattern insights
      await this.generateSpendingInsights(insights, statistics);

      // Generate travel frequency insights
      await this.generateFrequencyInsights(insights, statistics);

      // Generate destination preference insights
      await this.generateDestinationInsights(insights, statistics);

      // Generate sustainability insights
      await this.generateSustainabilityInsights(insights, carbonData);

      // Generate personalized recommendations
      await this.generateRecommendations(insights, statistics, userId);

      // Calculate overall metrics
      insights.metrics = {
        engagementScore: this.calculateEngagementScore(statistics),
        explorationScore: this.calculateExplorationScore(statistics),
        sustainabilityScore: this.calculateSustainabilityScore(carbonData),
        budgetEfficiencyScore: this.calculateBudgetEfficiencyScore(statistics),
        socialScore: this.calculateSocialScore(userId),
        overallScore: 0
      };

      insights.metrics.overallScore = Object.values(insights.metrics)
        .filter(score => score !== insights.metrics.overallScore)
        .reduce((sum, score) => sum + score, 0) / 5;

      await insights.save();
      return insights;
    } catch (error) {
      console.error('Generate travel insights error:', error);
      throw new Error('Failed to generate travel insights');
    }
  }

  async generateSpendingInsights(insights, statistics) {
    // Analyze spending patterns and generate insights
    const { lifetime, yearly } = statistics;
    
    if (yearly.length >= 2) {
      const lastYear = yearly[yearly.length - 1];
      const prevYear = yearly[yearly.length - 2];
      
      const spendingChange = ((lastYear.cost - prevYear.cost) / prevYear.cost) * 100;
      
      insights.insights.push({
        type: 'spending_pattern',
        title: 'Spending Trend Analysis',
        description: `Your travel spending ${spendingChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(spendingChange).toFixed(1)}% compared to last year`,
        data: {
          currentYear: lastYear.cost,
          previousYear: prevYear.cost,
          change: spendingChange
        },
        visualization: 'chart',
        actionable: {
          suggestions: spendingChange > 20 ? [
            'Consider budget-friendly destinations',
            'Look for off-season travel deals',
            'Use travel rewards credit cards'
          ] : [
            'Great job managing your travel budget!',
            'Consider investing in premium experiences'
          ]
        },
        confidence: 0.8
      });
    }
  }

  async generateFrequencyInsights(insights, statistics) {
    const { yearly } = statistics;
    
    if (yearly.length > 0) {
      const avgTripsPerYear = yearly.reduce((sum, year) => sum + year.trips, 0) / yearly.length;
      
      insights.insights.push({
        type: 'travel_frequency',
        title: 'Travel Frequency Pattern',
        description: `You take an average of ${avgTripsPerYear.toFixed(1)} trips per year`,
        data: {
          averageTripsPerYear: avgTripsPerYear,
          yearlyBreakdown: yearly
        },
        visualization: 'timeline',
        actionable: {
          suggestions: avgTripsPerYear < 2 ? [
            'Consider planning shorter weekend getaways',
            'Explore destinations closer to home'
          ] : [
            'You\'re an active traveler!',
            'Consider longer trips to reduce travel fatigue'
          ]
        },
        confidence: 0.9
      });
    }
  }

  async generateDestinationInsights(insights, statistics) {
    const { favoriteDestinations } = statistics.preferences;
    
    if (favoriteDestinations.length > 0) {
      const topDestination = favoriteDestinations[0];
      
      insights.insights.push({
        type: 'destination_preference',
        title: 'Favorite Destination',
        description: `${topDestination.destination} is your most visited destination with ${topDestination.visits} visits`,
        data: {
          topDestination: topDestination,
          allFavorites: favoriteDestinations.slice(0, 5)
        },
        visualization: 'map',
        actionable: {
          suggestions: [
            'Explore similar destinations in the same region',
            'Try a different season in your favorite destination',
            'Share your expertise about this destination with others'
          ]
        },
        confidence: 0.85
      });
    }
  }

  async generateSustainabilityInsights(insights, carbonData) {
    if (carbonData.length > 0) {
      const totalEmissions = carbonData.reduce((sum, footprint) => sum + footprint.totalEmissions, 0);
      const avgMonthlyEmissions = totalEmissions / carbonData.length;
      
      insights.insights.push({
        type: 'carbon_impact',
        title: 'Environmental Impact',
        description: `Your average monthly travel carbon footprint is ${avgMonthlyEmissions.toFixed(1)} kg CO2`,
        data: {
          totalEmissions,
          averageMonthly: avgMonthlyEmissions,
          breakdown: carbonData[carbonData.length - 1]?.breakdown
        },
        visualization: 'gauge',
        actionable: {
          suggestions: [
            'Consider train travel over flights for shorter distances',
            'Choose eco-friendly accommodations',
            'Purchase carbon offsets for your flights'
          ]
        },
        confidence: 0.75
      });
    }
  }

  async generateRecommendations(insights, statistics, userId) {
    // Generate personalized destination recommendations based on preferences
    const { favoriteCategories, favoriteDestinations } = statistics.preferences;
    
    // Simplified recommendation logic (in production, use ML algorithms)
    if (favoriteCategories.length > 0) {
      const topCategory = favoriteCategories[0].category;
      
      const recommendations = await this.getDestinationRecommendations(topCategory, favoriteDestinations, userId);
      insights.recommendations.destinations = recommendations;
    }
  }

  async getDestinationRecommendations(category, visited, userId) {
    // Simplified recommendation system
    const recommendationData = {
      'adventure': [
        { name: 'Patagonia', country: 'Chile/Argentina', score: 0.95 },
        { name: 'Nepal', country: 'Nepal', score: 0.90 },
        { name: 'New Zealand', country: 'New Zealand', score: 0.88 }
      ],
      'culture': [
        { name: 'Kyoto', country: 'Japan', score: 0.93 },
        { name: 'Rome', country: 'Italy', score: 0.91 },
        { name: 'Istanbul', country: 'Turkey', score: 0.89 }
      ],
      'beach': [
        { name: 'Maldives', country: 'Maldives', score: 0.96 },
        { name: 'Santorini', country: 'Greece', score: 0.92 },
        { name: 'Bali', country: 'Indonesia', score: 0.88 }
      ]
    };

    const recommendations = recommendationData[category] || recommendationData['adventure'];
    
    return recommendations.map(rec => ({
      ...rec,
      reasoning: [`Perfect for ${category} lovers`, 'Highly rated by similar travelers'],
      bestTime: 'Spring/Fall',
      estimatedCost: { min: 1500, max: 3000, currency: 'USD' },
      matchedPreferences: [category],
      alternativeOptions: []
    }));
  }

  // Helper methods for score calculations
  calculateEngagementScore(statistics) {
    const { totalTrips, totalDays } = statistics.lifetime;
    return Math.min((totalTrips * 10 + totalDays) / 100, 100);
  }

  calculateExplorationScore(statistics) {
    const { uniqueCountries, uniqueCities } = statistics.lifetime;
    return Math.min((uniqueCountries * 5 + uniqueCities * 2) / 100, 100);
  }

  calculateSustainabilityScore(carbonData) {
    if (carbonData.length === 0) return 50;
    
    const avgEmissions = carbonData.reduce((sum, data) => sum + data.totalEmissions, 0) / carbonData.length;
    const globalAverage = 1000; // kg CO2 per month
    
    return Math.max(0, 100 - (avgEmissions / globalAverage) * 100);
  }

  calculateBudgetEfficiencyScore(statistics) {
    const { averageTripCost, totalTrips } = statistics.lifetime;
    if (totalTrips === 0) return 50;
    
    // Lower cost per trip = higher efficiency score
    const efficiencyFactor = Math.max(0, 100 - (averageTripCost / 100));
    return Math.min(efficiencyFactor, 100);
  }

  async calculateSocialScore(userId) {
    try {
      // Calculate based on blog posts, likes, comments, etc.
      const blogs = await Blog.find({ author: userId });
      const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
      const totalComments = blogs.reduce((sum, blog) => sum + (blog.comments?.length || 0), 0);
      
      return Math.min((blogs.length * 5 + totalLikes + totalComments * 2) / 10, 100);
    } catch (error) {
      return 50; // Default score
    }
  }

  // Utility function for distance calculation (simplified)
  calculateDistance(from, to) {
    // This is a simplified calculation - in production, use proper geolocation APIs
    // Return distance in kilometers
    return Math.floor(Math.random() * 5000) + 500; // Placeholder
  }
}

module.exports = new AnalyticsService();