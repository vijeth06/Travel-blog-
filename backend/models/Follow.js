const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique follows and improve query performance
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for finding followers of a user
followSchema.index({ following: 1, createdAt: -1 });

// Index for finding who a user follows
followSchema.index({ follower: 1, createdAt: -1 });

// Virtual for populated follower data
followSchema.virtual('followerData', {
  ref: 'User',
  localField: 'follower',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated following data
followSchema.virtual('followingData', {
  ref: 'User',
  localField: 'following',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
followSchema.set('toJSON', { virtuals: true });
followSchema.set('toObject', { virtuals: true });

// Static methods
followSchema.statics.getFollowerCount = async function(userId) {
  return this.countDocuments({ following: userId });
};

followSchema.statics.getFollowingCount = async function(userId) {
  return this.countDocuments({ follower: userId });
};

followSchema.statics.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({ 
    follower: followerId, 
    following: followingId 
  });
  return !!follow;
};

followSchema.statics.getFollowers = async function(userId, options = {}) {
  const { page = 1, limit = 20, populate = false } = options;
  const skip = (page - 1) * limit;
  
  let query = this.find({ following: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  if (populate) {
    query = query.populate('follower', 'username email profilePicture bio');
  }
  
  return query;
};

followSchema.statics.getFollowing = async function(userId, options = {}) {
  const { page = 1, limit = 20, populate = false } = options;
  const skip = (page - 1) * limit;
  
  let query = this.find({ follower: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  if (populate) {
    query = query.populate('following', 'username email profilePicture bio');
  }
  
  return query;
};

// Instance methods
followSchema.methods.getFollowerDetails = function() {
  return this.populate('follower', 'username email profilePicture bio');
};

followSchema.methods.getFollowingDetails = function() {
  return this.populate('following', 'username email profilePicture bio');
};

module.exports = mongoose.model('Follow', followSchema);