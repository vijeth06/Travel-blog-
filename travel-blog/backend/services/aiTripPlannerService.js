const OpenAI = require('openai');
const TripPlan = require('../models/TripPlan');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Package = require('../models/Package');

class AITripPlannerService {
  constructor() {
    // Initialize with your OpenAI API key or use a free alternative
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
  }

  async generateTripPlan(userId, tripDetails) {
    try {
      const user = await User.findById(userId);
      
      // Create a comprehensive prompt for AI
      const prompt = this.createTripPlanPrompt(user, tripDetails);
      
      let aiResponse;
      if (this.openai) {
        // Use OpenAI GPT
        aiResponse = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "You are a professional travel planner. Create detailed, practical travel itineraries."
          }, {
            role: "user", 
            content: prompt
          }],
          max_tokens: 2000,
          temperature: 0.7
        });
      } else {
        // Fallback to rule-based AI (free alternative)
        aiResponse = await this.generateRuleBasedPlan(tripDetails);
      }

      // Parse and structure the AI response
      const structuredPlan = await this.parseAIResponse(aiResponse, tripDetails);
      
      // Create and save trip plan
      const tripPlan = new TripPlan({
        user: userId,
        title: `${tripDetails.destination.name} Adventure`,
        destination: tripDetails.destination,
        tripDetails,
        preferences: tripDetails.preferences,
        aiGenerated: {
          isAiGenerated: true,
          confidence: this.openai ? 0.85 : 0.65,
          model: this.openai ? 'gpt-3.5-turbo' : 'rule-based',
          generatedAt: new Date()
        },
        itinerary: structuredPlan.itinerary,
        estimatedCosts: structuredPlan.costs,
        recommendations: structuredPlan.recommendations
      });

      await tripPlan.save();
      return tripPlan;

    } catch (error) {
      console.error('AI Trip Planner Error:', error);
      throw new Error('Failed to generate trip plan');
    }
  }

  createTripPlanPrompt(user, tripDetails) {
    return `
    Create a detailed ${tripDetails.duration}-day travel itinerary for ${tripDetails.destination.name}, ${tripDetails.destination.country}.
    
    Traveler Profile:
    - Name: ${user.name}
    - Travel Style: ${tripDetails.travelStyle}
    - Budget: ${tripDetails.budget.min}-${tripDetails.budget.max} ${tripDetails.budget.currency}
    - Travelers: ${tripDetails.travelers.adults} adults, ${tripDetails.travelers.children} children
    - Interests: ${tripDetails.preferences.interests.join(', ')}
    - Accommodation: ${tripDetails.preferences.accommodation}
    
    Please provide:
    1. Daily itinerary with specific activities and timings
    2. Estimated costs for each activity
    3. Restaurant recommendations with cuisine types
    4. Must-visit attractions
    5. Transportation suggestions
    6. Accommodation recommendations
    
    Format as structured data that can be parsed programmatically.
    `;
  }

  async generateRuleBasedPlan(tripDetails) {
    // Rule-based AI fallback for when OpenAI is not available
    const destination = tripDetails.destination.name.toLowerCase();
    const duration = tripDetails.duration;
    const interests = tripDetails.preferences.interests;
    
    // Base activities database (you can expand this)
    const activitiesDB = {
      'paris': {
        cultural: ['Visit Louvre Museum', 'Explore Notre-Dame Cathedral', 'Walk through Montmartre'],
        food: ['Seine River dinner cruise', 'Cooking class in Le Marais', 'Wine tasting in Saint-Germain'],
        adventure: ['Climb Eiffel Tower', 'Bike tour of Paris', 'Day trip to Versailles']
      },
      'tokyo': {
        cultural: ['Visit Senso-ji Temple', 'Explore Meiji Shrine', 'Traditional tea ceremony'],
        food: ['Tsukiji Fish Market tour', 'Ramen cooking class', 'Izakaya food tour'],
        adventure: ['Mount Fuji day trip', 'Shibuya crossing experience', 'Harajuku street exploration']
      },
      'default': {
        cultural: ['Visit local museums', 'Explore historical sites', 'Cultural walking tour'],
        food: ['Local food tour', 'Cooking class', 'Market visit'],
        adventure: ['City bike tour', 'Nature excursion', 'Adventure activities']
      }
    };

    const locationActivities = activitiesDB[destination] || activitiesDB['default'];
    const itinerary = [];

    for (let day = 1; day <= duration; day++) {
      const dayActivities = [];
      
      // Mix activities based on interests
      interests.forEach(interest => {
        if (locationActivities[interest]) {
          const activity = locationActivities[interest][Math.floor(Math.random() * locationActivities[interest].length)];
          dayActivities.push({
            time: `${8 + Math.floor(Math.random() * 8)}:00`,
            title: activity,
            description: `Enjoy ${activity.toLowerCase()} with local guide`,
            duration: 120 + Math.floor(Math.random() * 120),
            cost: {
              amount: 50 + Math.floor(Math.random() * 100),
              currency: tripDetails.budget.currency
            },
            category: interest
          });
        }
      });

      itinerary.push({
        day,
        activities: dayActivities.slice(0, 3) // Limit to 3 activities per day
      });
    }

    return {
      itinerary,
      costs: {
        total: duration * 150, // Base estimate
        currency: tripDetails.budget.currency
      },
      recommendations: {
        restaurants: [],
        attractions: [],
        accommodations: []
      }
    };
  }

  async parseAIResponse(aiResponse, tripDetails) {
    try {
      if (this.openai && aiResponse.choices) {
        // Parse OpenAI response
        const content = aiResponse.choices[0].message.content;
        // This would need sophisticated parsing logic
        // For now, return structured data
        return this.createStructuredResponse(content, tripDetails);
      } else {
        // Return rule-based response
        return aiResponse;
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.generateRuleBasedPlan(tripDetails);
    }
  }

  createStructuredResponse(content, tripDetails) {
    // Parse AI text response into structured data
    // This is a simplified version - you'd want more sophisticated parsing
    const lines = content.split('\n');
    const itinerary = [];
    
    let currentDay = 1;
    let dayActivities = [];
    
    lines.forEach(line => {
      if (line.includes('Day ') || line.includes('day ')) {
        if (dayActivities.length > 0) {
          itinerary.push({
            day: currentDay,
            activities: dayActivities
          });
          dayActivities = [];
          currentDay++;
        }
      } else if (line.trim() && !line.includes('Estimated') && !line.includes('Total')) {
        dayActivities.push({
          time: '09:00',
          title: line.trim(),
          description: line.trim(),
          duration: 120,
          cost: {
            amount: 50,
            currency: tripDetails.budget.currency
          },
          category: 'sightseeing'
        });
      }
    });

    // Add last day
    if (dayActivities.length > 0) {
      itinerary.push({
        day: currentDay,
        activities: dayActivities
      });
    }

    return {
      itinerary,
      costs: {
        total: tripDetails.duration * 150,
        currency: tripDetails.budget.currency
      },
      recommendations: {
        restaurants: [],
        attractions: [],
        accommodations: []
      }
    };
  }

  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      const userBlogs = await Blog.find({ author: userId });
      const userInterests = user.travelPreferences?.preferredDestinations || [];
      
      // Get similar users based on interests
      const similarUsers = await User.find({
        'travelPreferences.preferredDestinations': { $in: userInterests },
        _id: { $ne: userId }
      }).limit(5);

      // Get packages they might like
      const recommendedPackages = await Package.find({
        'location.country': { $in: userInterests }
      }).limit(limit);

      // Get trending blogs
      const trendingBlogs = await Blog.find({
        status: 'published',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ views: -1, likesCount: -1 }).limit(limit);

      return {
        packages: recommendedPackages,
        blogs: trendingBlogs,
        similarUsers: similarUsers.map(u => ({
          _id: u._id,
          name: u.name,
          avatar: u.avatar
        }))
      };

    } catch (error) {
      console.error('Recommendation Error:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  async optimizeTripPlan(tripPlanId, optimizationCriteria) {
    try {
      const tripPlan = await TripPlan.findById(tripPlanId);
      
      if (!tripPlan) {
        throw new Error('Trip plan not found');
      }

      // AI optimization based on criteria (budget, time, interests)
      const optimized = await this.applyOptimizations(tripPlan, optimizationCriteria);
      
      // Update trip plan
      tripPlan.itinerary = optimized.itinerary;
      tripPlan.estimatedCosts = optimized.costs;
      await tripPlan.save();

      return tripPlan;

    } catch (error) {
      console.error('Trip optimization error:', error);
      throw new Error('Failed to optimize trip plan');
    }
  }

  async applyOptimizations(tripPlan, criteria) {
    // Apply optimization logic based on criteria
    const { itinerary } = tripPlan;
    
    if (criteria.includes('budget')) {
      // Reduce expensive activities
      itinerary.forEach(day => {
        day.activities = day.activities.filter(activity => 
          activity.cost.amount <= tripPlan.tripDetails.budget.max / tripPlan.tripDetails.duration
        );
      });
    }

    if (criteria.includes('time')) {
      // Optimize for travel time between activities
      // This would include geolocation-based optimization
    }

    return {
      itinerary,
      costs: this.calculateOptimizedCosts(itinerary)
    };
  }

  calculateOptimizedCosts(itinerary) {
    let total = 0;
    
    itinerary.forEach(day => {
      day.activities.forEach(activity => {
        total += activity.cost.amount;
      });
    });

    return {
      total,
      accommodation: Math.floor(total * 0.4),
      food: Math.floor(total * 0.3),
      activities: Math.floor(total * 0.2),
      transportation: Math.floor(total * 0.1),
      currency: 'USD'
    };
  }
}

module.exports = new AITripPlannerService();