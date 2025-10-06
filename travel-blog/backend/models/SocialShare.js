const mongoose = require('mongoose');

const SocialShareSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional - can track anonymous shares
  
  // What was shared
  targetType: { 
    type: String, 
    required: true, 
    enum: ['Blog', 'Package'] 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'targetType'
  },
  
  // Where it was shared
  platform: { 
    type: String, 
    required: true,
    enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'whatsapp', 'email', 'copy-link', 'other']
  },
  
  // Tracking data
  ipAddress: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

// Index for analytics
SocialShareSchema.index({ targetType: 1, targetId: 1, platform: 1 });
SocialShareSchema.index({ createdAt: -1 });

// Static method to record a share
SocialShareSchema.statics.recordShare = async function(data) {
  try {
    const share = new this(data);
    await share.save();
    return share;
  } catch (error) {
    console.error('Error recording share:', error);
    // Don't throw error to avoid breaking the main flow
    return null;
  }
};

// Static method to get share statistics
SocialShareSchema.statics.getShareStats = async function(targetType, targetId) {
  const stats = await this.aggregate([
    { $match: { targetType, targetId } },
    {
      $group: {
        _id: '$platform',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  const totalShares = await this.countDocuments({ targetType, targetId });
  
  return {
    totalShares,
    byPlatform: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };
};

module.exports = mongoose.model('SocialShare', SocialShareSchema);
