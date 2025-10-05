const TravelBuddy = require('../models/TravelBuddy');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

class TravelBuddyService {
  constructor() {
    this.matchingWeights = {
      destination: 0.3,
      dates: 0.25,
      budget: 0.2,
      interests: 0.15,
      age: 0.1
    };
  }

  async createBuddyProfile(userId, profileData) {
    try {
      // Check if profile already exists
      let profile = await TravelBuddy.findOne({ user: userId });
      
      if (profile) {
        // Update existing profile
        Object.keys(profileData).forEach(key => {
          if (key !== 'user') {
            profile[key] = profileData[key];
          }
        });
      } else {
        // Create new profile
        profile = new TravelBuddy({
          user: userId,
          ...profileData
        });
      }

      await profile.save();
      return await TravelBuddy.findById(profile._id).populate('user', 'name email avatar');

    } catch (error) {
      console.error('Create buddy profile error:', error);
      throw new Error('Failed to create travel buddy profile');
    }
  }

  async findTravelBuddies(userId, searchCriteria) {
    try {
      const userProfile = await TravelBuddy.findOne({ user: userId });
      if (!userProfile) {
        throw new Error('User profile not found. Please create a travel buddy profile first.');
      }

      const {
        destination,
        startDate,
        endDate,
        budget,
        ageRange,
        gender,
        interests,
        radius = 100,
        limit = 20
      } = searchCriteria;

      // Build search query
      const query = {
        user: { $ne: userId },
        status: 'active'
      };

      // Destination matching
      if (destination) {
        query['travelPlans.destination.country'] = new RegExp(destination, 'i');
      }

      // Date range matching
      if (startDate && endDate) {
        query.$or = [
          {
            'travelPlans.dates.startDate': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          },
          {
            'travelPlans.dates.endDate': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          },
          {
            'travelPlans.dates.flexible': true
          }
        ];
      }

      // Budget matching
      if (budget) {
        query['travelPlans.budget.amount'] = {
          $gte: budget * 0.7, // Allow 30% variance
          $lte: budget * 1.3
        };
      }

      // Age range matching
      if (ageRange) {
        query['travelProfile.age'] = {
          $gte: ageRange.min,
          $lte: ageRange.max
        };
      }

      // Gender preference
      if (gender && gender !== 'Any') {
        query['travelProfile.gender'] = gender;
      }

      // Interest matching
      if (interests && interests.length > 0) {
        query['travelProfile.interests'] = { $in: interests };
      }

      // Find matching profiles
      const matches = await TravelBuddy.find(query)
        .populate('user', 'name email avatar location')
        .limit(limit);

      // Calculate compatibility scores
      const scoredMatches = matches.map(match => ({
        ...match.toObject(),
        compatibilityScore: this.calculateCompatibility(userProfile, match, searchCriteria)
      }));

      // Sort by compatibility score
      scoredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      return scoredMatches;

    } catch (error) {
      console.error('Find travel buddies error:', error);
      throw new Error('Failed to find travel buddies');
    }
  }

  calculateCompatibility(userProfile, candidateProfile, searchCriteria) {
    let score = 0;
    let maxScore = 0;

    // Destination compatibility
    if (searchCriteria.destination) {
      maxScore += this.matchingWeights.destination;
      const userDestination = searchCriteria.destination.toLowerCase();
      const candidateDestinations = candidateProfile.travelPlans.map(
        plan => plan.destination.country.toLowerCase()
      );
      
      if (candidateDestinations.includes(userDestination)) {
        score += this.matchingWeights.destination;
      }
    }

    // Date compatibility
    if (searchCriteria.startDate && searchCriteria.endDate) {
      maxScore += this.matchingWeights.dates;
      const userStart = new Date(searchCriteria.startDate);
      const userEnd = new Date(searchCriteria.endDate);
      
      const hasDateOverlap = candidateProfile.travelPlans.some(plan => {
        if (plan.dates.flexible) return true;
        
        const planStart = new Date(plan.dates.startDate);
        const planEnd = new Date(plan.dates.endDate);
        
        return (planStart <= userEnd && planEnd >= userStart);
      });
      
      if (hasDateOverlap) {
        score += this.matchingWeights.dates;
      }
    }

    // Budget compatibility
    if (searchCriteria.budget) {
      maxScore += this.matchingWeights.budget;
      const userBudget = searchCriteria.budget;
      const candidateBudgets = candidateProfile.travelPlans.map(plan => plan.budget.amount);
      
      const hasCompatibleBudget = candidateBudgets.some(budget => {
        return budget >= userBudget * 0.7 && budget <= userBudget * 1.3;
      });
      
      if (hasCompatibleBudget) {
        score += this.matchingWeights.budget;
      }
    }

    // Interest compatibility
    if (searchCriteria.interests && searchCriteria.interests.length > 0) {
      maxScore += this.matchingWeights.interests;
      const userInterests = searchCriteria.interests;
      const candidateInterests = candidateProfile.travelProfile.interests;
      
      const commonInterests = userInterests.filter(interest => 
        candidateInterests.includes(interest)
      );
      
      const interestScore = commonInterests.length / Math.max(userInterests.length, candidateInterests.length);
      score += this.matchingWeights.interests * interestScore;
    }

    // Age compatibility
    if (searchCriteria.ageRange) {
      maxScore += this.matchingWeights.age;
      const candidateAge = candidateProfile.travelProfile.age;
      
      if (candidateAge >= searchCriteria.ageRange.min && candidateAge <= searchCriteria.ageRange.max) {
        score += this.matchingWeights.age;
      }
    }

    // Normalize score to percentage
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  async sendBuddyRequest(requesterId, recipientId, message, travelPlanId) {
    try {
      const requester = await User.findById(requesterId);
      const recipient = await User.findById(recipientId);
      const recipientProfile = await TravelBuddy.findOne({ user: recipientId });

      if (!recipient || !recipientProfile) {
        throw new Error('Recipient not found');
      }

      // Create buddy request (you might want a separate BuddyRequest model)
      const requestData = {
        requester: requesterId,
        recipient: recipientId,
        message,
        travelPlan: travelPlanId,
        status: 'pending',
        sentAt: new Date()
      };

      // Send email notification
      await sendEmail({
        to: recipient.email,
        subject: 'New Travel Buddy Request! 🧳',
        template: 'buddy-request',
        data: {
          recipientName: recipient.name,
          requesterName: requester.name,
          message: message || 'Would like to be your travel buddy!',
          requesterAvatar: requester.avatar
        }
      });

      return { success: true, message: 'Buddy request sent successfully' };

    } catch (error) {
      console.error('Send buddy request error:', error);
      throw new Error('Failed to send buddy request');
    }
  }

  async addReview(reviewerId, revieweeId, reviewData) {
    try {
      const revieweeProfile = await TravelBuddy.findOne({ user: revieweeId });
      
      if (!revieweeProfile) {
        throw new Error('Reviewee profile not found');
      }

      // Check if reviewer already reviewed this person
      const existingReview = revieweeProfile.reviews.find(
        review => review.reviewer.toString() === reviewerId
      );

      if (existingReview) {
        throw new Error('You have already reviewed this person');
      }

      // Add review
      revieweeProfile.reviews.push({
        reviewer: reviewerId,
        rating: reviewData.rating,
        review: reviewData.review,
        trip: reviewData.trip
      });

      await revieweeProfile.save();

      return revieweeProfile;

    } catch (error) {
      console.error('Add review error:', error);
      throw new Error('Failed to add review');
    }
  }

  async getNearbyBuddies(userId, coordinates, radius = 50) {
    try {
      const nearbyBuddies = await TravelBuddy.find({
        user: { $ne: userId },
        status: 'active',
        'location.current.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [coordinates.lng, coordinates.lat]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      })
      .populate('user', 'name avatar')
      .limit(20);

      return nearbyBuddies;

    } catch (error) {
      console.error('Get nearby buddies error:', error);
      throw new Error('Failed to get nearby buddies');
    }
  }

  async getBuddyRecommendations(userId) {
    try {
      const userProfile = await TravelBuddy.findOne({ user: userId });
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get recommendations based on user's travel plans and interests
      const recommendations = [];

      // Similar interests
      if (userProfile.travelProfile.interests.length > 0) {
        const similarInterestBuddies = await TravelBuddy.find({
          user: { $ne: userId },
          status: 'active',
          'travelProfile.interests': { $in: userProfile.travelProfile.interests }
        })
        .populate('user', 'name avatar')
        .limit(10);

        recommendations.push({
          category: 'Similar Interests',
          buddies: similarInterestBuddies
        });
      }

      // Same destinations
      if (userProfile.travelPlans.length > 0) {
        const destinations = userProfile.travelPlans.map(plan => plan.destination.country);
        
        const sameDestinationBuddies = await TravelBuddy.find({
          user: { $ne: userId },
          status: 'active',
          'travelPlans.destination.country': { $in: destinations }
        })
        .populate('user', 'name avatar')
        .limit(10);

        recommendations.push({
          category: 'Same Destinations',
          buddies: sameDestinationBuddies
        });
      }

      // Highly rated buddies
      const topRatedBuddies = await TravelBuddy.find({
        user: { $ne: userId },
        status: 'active',
        'stats.averageRating': { $gte: 4.0 },
        'reviews.1': { $exists: true } // At least 2 reviews
      })
      .populate('user', 'name avatar')
      .sort({ 'stats.averageRating': -1 })
      .limit(10);

      recommendations.push({
        category: 'Top Rated',
        buddies: topRatedBuddies
      });

      return recommendations;

    } catch (error) {
      console.error('Get buddy recommendations error:', error);
      throw new Error('Failed to get buddy recommendations');
    }
  }

  async verifyBuddy(userId, verificationType) {
    try {
      const profile = await TravelBuddy.findOne({ user: userId });
      
      if (!profile) {
        throw new Error('Profile not found');
      }

      switch (verificationType) {
        case 'id':
          profile.safety.idVerified = true;
          break;
        case 'phone':
          profile.safety.phoneVerified = true;
          break;
        case 'background':
          profile.safety.backgroundCheck = true;
          break;
        case 'social':
          profile.safety.socialMediaLinked = true;
          break;
      }

      await profile.save();
      return profile;

    } catch (error) {
      console.error('Verify buddy error:', error);
      throw new Error('Failed to verify buddy');
    }
  }
}

module.exports = new TravelBuddyService();