const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Polymorphic reference - can like blogs, packages, or comments
  targetType: { 
    type: String, 
    required: true, 
    enum: ['Blog', 'Package', 'Comment'] 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'targetType'
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure one like per user per target
LikeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// Static method to toggle like
LikeSchema.statics.toggleLike = async function(userId, targetType, targetId) {
  try {
    const existingLike = await this.findOne({ user: userId, targetType, targetId });
    
    if (existingLike) {
      // Unlike
      await this.deleteOne({ _id: existingLike._id });
      return { liked: false, action: 'unliked' };
    } else {
      // Like
      await this.create({ user: userId, targetType, targetId });
      return { liked: true, action: 'liked' };
    }
  } catch (error) {
    throw error;
  }
};

// Static method to get like count for a target
LikeSchema.statics.getLikeCount = async function(targetType, targetId) {
  return await this.countDocuments({ targetType, targetId });
};

// Static method to check if user liked a target
LikeSchema.statics.isLikedByUser = async function(userId, targetType, targetId) {
  const like = await this.findOne({ user: userId, targetType, targetId });
  return !!like;
};

// Static method to get user's likes
LikeSchema.statics.getUserLikes = async function(userId, targetType = null) {
  const query = { user: userId };
  if (targetType) query.targetType = targetType;
  
  return await this.find(query).populate('targetId');
};

module.exports = mongoose.model('Like', LikeSchema);
