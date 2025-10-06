const mongoose = require('mongoose');

const TravelForumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  category: {
    type: String,
    enum: [
      'general', 'destinations', 'budget_travel', 'luxury_travel', 
      'solo_travel', 'family_travel', 'adventure', 'culture', 
      'food', 'photography', 'accommodations', 'transportation',
      'travel_tips', 'gear', 'safety', 'visas_immigration'
    ],
    required: true
  },
  
  region: {
    continent: { type: String },
    countries: [{ type: String }],
    global: { type: Boolean, default: false }
  },
  
  moderators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['moderator', 'admin'], default: 'moderator' },
    assignedAt: { type: Date, default: Date.now }
  }],
  
  settings: {
    isPublic: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: false },
    allowImages: { type: Boolean, default: true },
    allowPolls: { type: Boolean, default: true },
    minLevel: { type: Number, default: 1 }
  },
  
  stats: {
    totalTopics: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    totalMembers: { type: Number, default: 0 },
    todaysTopics: { type: Number, default: 0 },
    todaysPosts: { type: Number, default: 0 }
  },
  
  lastActivity: {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  },
  
  featured: { type: Boolean, default: false },
  
  status: {
    type: String,
    enum: ['active', 'locked', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

const ForumTopicSchema = new mongoose.Schema({
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelForum',
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  tags: [{ type: String }],
  
  type: {
    type: String,
    enum: ['discussion', 'question', 'announcement', 'poll', 'review'],
    default: 'discussion'
  },
  
  poll: {
    question: { type: String },
    options: [{
      text: { type: String },
      votes: { type: Number, default: 0 },
      voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    multipleChoice: { type: Boolean, default: false },
    endDate: { type: Date }
  },
  
  location: {
    country: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  images: [{
    url: { type: String },
    caption: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  status: {
    type: String,
    enum: ['active', 'locked', 'archived', 'pending'],
    default: 'active'
  },
  
  moderation: {
    flagged: { type: Boolean, default: false },
    flagCount: { type: Number, default: 0 },
    flagReasons: [{ type: String }],
    moderatorNotes: { type: String }
  },
  
  stats: {
    views: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  
  lastReply: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  },
  
  sticky: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  solved: { type: Boolean, default: false }
}, {
  timestamps: true
});

const ForumPostSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumTopic',
    required: true
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  
  images: [{
    url: { type: String },
    caption: { type: String }
  }],
  
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['like', 'love', 'helpful', 'funny', 'wow'] },
    timestamp: { type: Date, default: Date.now }
  }],
  
  moderation: {
    flagged: { type: Boolean, default: false },
    flagCount: { type: Number, default: 0 },
    flagReasons: [{ type: String }],
    moderatorNotes: { type: String },
    edited: { type: Boolean, default: false },
    editHistory: [{
      content: { type: String },
      editedAt: { type: Date },
      reason: { type: String }
    }]
  },
  
  status: {
    type: String,
    enum: ['active', 'deleted', 'hidden', 'pending'],
    default: 'active'
  },
  
  bestAnswer: { type: Boolean, default: false }
}, {
  timestamps: true
});

// User Forum Profile Schema
const UserForumProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  forumStats: {
    totalPosts: { type: Number, default: 0 },
    totalTopics: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  },
  
  expertise: [{
    category: { type: String },
    level: { type: Number, default: 1 },
    points: { type: Number, default: 0 }
  }],
  
  badges: [{
    name: { type: String },
    description: { type: String },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }],
  
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    mentionNotifications: { type: Boolean, default: true },
    signature: { type: String, maxlength: 200 },
    timezone: { type: String, default: 'UTC' }
  },
  
  subscriptions: [{
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelForum' },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic' },
    type: { type: String, enum: ['forum', 'topic'] },
    subscribedAt: { type: Date, default: Date.now }
  }],
  
  moderation: {
    warnings: { type: Number, default: 0 },
    suspensions: { type: Number, default: 0 },
    banned: { type: Boolean, default: false },
    banReason: { type: String },
    banExpiresAt: { type: Date }
  }
}, {
  timestamps: true
});

// Indexes for forums
TravelForumSchema.index({ category: 1 });
TravelForumSchema.index({ 'region.countries': 1 });
TravelForumSchema.index({ status: 1 });

ForumTopicSchema.index({ forum: 1, createdAt: -1 });
ForumTopicSchema.index({ author: 1 });
ForumTopicSchema.index({ tags: 1 });
ForumTopicSchema.index({ status: 1 });
ForumTopicSchema.index({ 'stats.views': -1 });

ForumPostSchema.index({ topic: 1, createdAt: 1 });
ForumPostSchema.index({ author: 1 });
ForumPostSchema.index({ replyTo: 1 });
ForumPostSchema.index({ status: 1 });

UserForumProfileSchema.index({ user: 1 });
UserForumProfileSchema.index({ 'forumStats.reputation': -1 });

const TravelForum = mongoose.model('TravelForum', TravelForumSchema);
const ForumTopic = mongoose.model('ForumTopic', ForumTopicSchema);
const ForumPost = mongoose.model('ForumPost', ForumPostSchema);
const UserForumProfile = mongoose.model('UserForumProfile', UserForumProfileSchema);

module.exports = { TravelForum, ForumTopic, ForumPost, UserForumProfile };