const mongoose = require('mongoose');

const TravelChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  category: {
    type: String,
    enum: ['photography', 'adventure', 'cultural', 'food', 'budget', 'social', 'environmental', 'learning'],
    required: true
  },
  
  type: {
    type: String,
    enum: ['individual', 'team', 'community'],
    required: true
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  
  duration: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'one-time', 'ongoing'],
    required: true
  },
  
  requirements: {
    minLevel: { type: Number, default: 1 },
    countries: [{ type: String }], // Specific countries if applicable
    activities: [{ type: String }], // Required activities
    budget: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' }
    }
  },
  
  rewards: {
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    prizes: [{
      type: { type: String }, // 'discount', 'gift', 'experience'
      value: { type: String },
      sponsor: { type: String }
    }]
  },
  
  rules: [{
    rule: { type: String, required: true },
    points: { type: Number, default: 1 }
  }],
  
  timeline: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date }
  },
  
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    progress: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      points: { type: Number, default: 0 },
      submissions: [{
        type: { type: String }, // 'photo', 'story', 'checkin', 'receipt'
        content: { type: String },
        url: { type: String },
        location: {
          country: { type: String },
          city: { type: String },
          coordinates: {
            lat: { type: Number },
            lng: { type: Number }
          }
        },
        submittedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
        points: { type: Number, default: 0 }
      }]
    },
    team: { type: String }, // For team challenges
    rank: { type: Number }
  }],
  
  leaderboard: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    points: { type: Number },
    rank: { type: Number },
    completed: { type: Boolean },
    lastUpdate: { type: Date, default: Date.now }
  }],
  
  stats: {
    totalParticipants: { type: Number, default: 0 },
    completedParticipants: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 }
  },
  
  social: {
    hashtags: [{ type: String }],
    allowSharing: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    communityVoting: { type: Boolean, default: false }
  },
  
  sponsor: {
    name: { type: String },
    logo: { type: String },
    website: { type: String },
    contribution: { type: String }
  },
  
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
TravelChallengeSchema.index({ category: 1 });
TravelChallengeSchema.index({ status: 1 });
TravelChallengeSchema.index({ 'timeline.startDate': 1 });
TravelChallengeSchema.index({ 'timeline.endDate': 1 });
TravelChallengeSchema.index({ difficulty: 1 });
TravelChallengeSchema.index({ type: 1 });

// Pre-save middleware to update stats
TravelChallengeSchema.pre('save', function(next) {
  this.stats.totalParticipants = this.participants.length;
  this.stats.completedParticipants = this.participants.filter(p => p.progress.completed).length;
  this.stats.totalSubmissions = this.participants.reduce((total, p) => total + p.progress.submissions.length, 0);
  
  // Update leaderboard
  this.leaderboard = this.participants
    .map(p => ({
      user: p.user,
      points: p.progress.points,
      completed: p.progress.completed,
      lastUpdate: new Date()
    }))
    .sort((a, b) => b.points - a.points)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));

  next();
});

// User Achievement/Badge Schema
const UserAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  badges: [{
    badgeId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    category: { type: String },
    earnedAt: { type: Date, default: Date.now },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelChallenge' },
    level: { type: Number, default: 1 },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
  }],
  
  stats: {
    totalPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    challengesCompleted: { type: Number, default: 0 },
    badgesEarned: { type: Number, default: 0 },
    rank: { type: Number },
    achievements: {
      countries: { type: Number, default: 0 },
      cities: { type: Number, default: 0 },
      photos: { type: Number, default: 0 },
      stories: { type: Number, default: 0 },
      friends: { type: Number, default: 0 }
    }
  },
  
  preferences: {
    showBadges: { type: Boolean, default: true },
    showLevel: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes
UserAchievementSchema.index({ user: 1 });
UserAchievementSchema.index({ 'stats.totalPoints': -1 });
UserAchievementSchema.index({ 'stats.level': -1 });
UserAchievementSchema.index({ 'stats.rank': 1 });

const TravelChallenge = mongoose.model('TravelChallenge', TravelChallengeSchema);
const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);

module.exports = { TravelChallenge, UserAchievement };