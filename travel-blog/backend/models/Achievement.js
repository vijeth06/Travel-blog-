const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['traveler', 'blogger', 'social', 'explorer', 'expert', 'premium', 'milestone']
  },
  // Points awarded when achievement is unlocked
  points: {
    type: Number,
    default: 100
  },
  // Requirements to unlock this achievement
  requirements: {
    // Activity-based requirements
    blogsWritten: Number,
    reviewsWritten: Number,
    photosUploaded: Number,
    placesVisited: Number,
    tripsPlanned: Number,
    friendsReferred: Number,
    challengesCompleted: Number,
    packagesBooked: Number,
    commentsPosted: Number,
    likesReceived: Number,
    
    // Level/Experience requirements
    levelRequired: Number,
    experiencePoints: Number,
    
    // Streak requirements
    loginStreakDays: Number,
    postingStreakDays: Number,
    
    // Social requirements
    followersCount: Number,
    followingCount: Number,
    
    // Time-based requirements
    membershipDays: Number,
    
    // Special conditions
    premiumMember: Boolean,
    verifiedAccount: Boolean,
    
    // Combination requirements (all must be met)
    combinationRequirements: [{
      field: String,
      operator: { type: String, enum: ['gte', 'lte', 'eq', 'gt', 'lt'] },
      value: Number
    }]
  },
  // Achievement type
  type: {
    type: String,
    enum: ['milestone', 'streak', 'social', 'content', 'exploration', 'premium'],
    default: 'milestone'
  },
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'legendary'],
    default: 'easy'
  },
  // Whether achievement is currently active
  isActive: {
    type: Boolean,
    default: true
  },
  // Badge properties
  badge: {
    color: String,
    backgroundColor: String,
    borderColor: String,
    textColor: String
  },
  // Unlock message
  unlockMessage: String,
  
  // Hidden achievement (not shown until unlocked)
  isHidden: {
    type: Boolean,
    default: false
  },
  
  // Achievement rarity
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  // Order for display
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ category: 1 });
achievementSchema.index({ difficulty: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ sortOrder: 1 });

// Method to check if user meets requirements
achievementSchema.methods.checkRequirements = function(userProgress) {
  const req = this.requirements;
  const activities = userProgress.activities;
  const streaks = userProgress.streaks;
  
  // Check each requirement
  if (req.blogsWritten && activities.blogsWritten < req.blogsWritten) return false;
  if (req.reviewsWritten && activities.reviewsWritten < req.reviewsWritten) return false;
  if (req.photosUploaded && activities.photosUploaded < req.photosUploaded) return false;
  if (req.placesVisited && activities.placesVisited < req.placesVisited) return false;
  if (req.tripsPlanned && activities.tripsPlanned < req.tripsPlanned) return false;
  if (req.friendsReferred && activities.friendsReferred < req.friendsReferred) return false;
  if (req.challengesCompleted && activities.challengesCompleted < req.challengesCompleted) return false;
  if (req.packagesBooked && activities.packagesBooked < req.packagesBooked) return false;
  if (req.commentsPosted && activities.commentsPosted < req.commentsPosted) return false;
  if (req.likesReceived && activities.likesReceived < req.likesReceived) return false;
  
  if (req.levelRequired && userProgress.level < req.levelRequired) return false;
  if (req.experiencePoints && userProgress.experiencePoints < req.experiencePoints) return false;
  
  if (req.loginStreakDays && streaks.currentLoginStreak < req.loginStreakDays) return false;
  if (req.postingStreakDays && streaks.currentPostingStreak < req.postingStreakDays) return false;
  
  // Check combination requirements
  if (req.combinationRequirements && req.combinationRequirements.length > 0) {
    for (const combReq of req.combinationRequirements) {
      const userValue = this.getNestedValue(userProgress, combReq.field);
      if (!this.compareValues(userValue, combReq.operator, combReq.value)) {
        return false;
      }
    }
  }
  
  return true;
};

// Helper method to get nested object values
achievementSchema.methods.getNestedValue = function(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

// Helper method to compare values
achievementSchema.methods.compareValues = function(userValue, operator, targetValue) {
  switch (operator) {
    case 'gte': return userValue >= targetValue;
    case 'lte': return userValue <= targetValue;
    case 'eq': return userValue === targetValue;
    case 'gt': return userValue > targetValue;
    case 'lt': return userValue < targetValue;
    default: return false;
  }
};

// Static method to create default achievements
achievementSchema.statics.createDefaultAchievements = async function() {
  const defaultAchievements = [
    // Traveler Achievements
    {
      name: "First Steps",
      description: "Complete your first travel blog post",
      icon: "✏️",
      category: "blogger",
      points: 50,
      requirements: { blogsWritten: 1 },
      difficulty: "easy",
      unlockMessage: "Welcome to the travel blogging community!"
    },
    {
      name: "Explorer",
      description: "Visit 5 different places",
      icon: "🗺️",
      category: "traveler",
      points: 200,
      requirements: { placesVisited: 5 },
      difficulty: "medium"
    },
    {
      name: "Review Master",
      description: "Write 10 helpful reviews",
      icon: "⭐",
      category: "blogger",
      points: 300,
      requirements: { reviewsWritten: 10 },
      difficulty: "medium"
    },
    {
      name: "Social Butterfly",
      description: "Get 50 likes on your content",
      icon: "💖",
      category: "social",
      points: 150,
      requirements: { likesReceived: 50 },
      difficulty: "medium"
    },
    {
      name: "Dedication",
      description: "Login for 7 consecutive days",
      icon: "🔥",
      category: "milestone",
      points: 250,
      requirements: { loginStreakDays: 7 },
      difficulty: "medium",
      type: "streak"
    },
    {
      name: "Photography Enthusiast",
      description: "Upload 25 travel photos",
      icon: "📸",
      category: "explorer",
      points: 200,
      requirements: { photosUploaded: 25 },
      difficulty: "medium"
    },
    {
      name: "Trip Planner",
      description: "Plan 3 trips using our trip planner",
      icon: "📅",
      category: "explorer",
      points: 300,
      requirements: { tripsPlanned: 3 },
      difficulty: "medium"
    },
    {
      name: "Level 10 Traveler",
      description: "Reach level 10",
      icon: "🏆",
      category: "milestone",
      points: 500,
      requirements: { levelRequired: 10 },
      difficulty: "hard",
      rarity: "rare"
    },
    {
      name: "Influencer",
      description: "Refer 5 friends to join",
      icon: "👥",
      category: "social",
      points: 400,
      requirements: { friendsReferred: 5 },
      difficulty: "hard"
    },
    {
      name: "Globe Trotter",
      description: "Visit 25 different places",
      icon: "🌍",
      category: "traveler",
      points: 1000,
      requirements: { placesVisited: 25 },
      difficulty: "hard",
      rarity: "epic"
    },
    {
      name: "Content Creator",
      description: "Write 50 blog posts",
      icon: "✍️",
      category: "blogger",
      points: 1200,
      requirements: { blogsWritten: 50 },
      difficulty: "hard",
      rarity: "epic"
    },
    {
      name: "Legendary Traveler",
      description: "Reach level 50 and visit 100 places",
      icon: "👑",
      category: "milestone",
      points: 5000,
      requirements: { 
        combinationRequirements: [
          { field: 'level', operator: 'gte', value: 50 },
          { field: 'activities.placesVisited', operator: 'gte', value: 100 }
        ]
      },
      difficulty: "legendary",
      rarity: "legendary",
      isHidden: true
    }
  ];
  
  for (const achievement of defaultAchievements) {
    await this.findOneAndUpdate(
      { name: achievement.name },
      achievement,
      { upsert: true, new: true }
    );
  }
  
  console.log('Default achievements created/updated');
};

module.exports = mongoose.model('Achievement', achievementSchema);