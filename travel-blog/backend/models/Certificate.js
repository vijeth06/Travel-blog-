const mongoose = require('mongoose');

// Real certification model with comprehensive skill tracking
const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  skillArea: {
    type: String,
    required: true,
    enum: [
      'travel_blogging',
      'photography',
      'destination_expert',
      'cultural_guide',
      'adventure_specialist',
      'budget_travel',
      'luxury_travel',
      'sustainable_travel',
      'solo_travel',
      'family_travel',
      'food_tourism',
      'historical_sites',
      'outdoor_activities',
      'urban_exploration',
      'travel_planning'
    ]
  },
  
  level: {
    type: String,
    required: true,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  assessmentResults: {
    theoreticalScore: { type: Number, min: 0, max: 100 },
    practicalScore: { type: Number, min: 0, max: 100 },
    portfolioScore: { type: Number, min: 0, max: 100 },
    communityScore: { type: Number, min: 0, max: 100 },
    breakdown: {
      knowledge: { type: Number, min: 0, max: 100 },
      experience: { type: Number, min: 0, max: 100 },
      contribution: { type: Number, min: 0, max: 100 },
      engagement: { type: Number, min: 0, max: 100 }
    }
  },
  
  requirements: {
    minimumPosts: { type: Number, default: 0 },
    minimumLikes: { type: Number, default: 0 },
    minimumFollowers: { type: Number, default: 0 },
    minimumCountries: { type: Number, default: 0 },
    assessmentPassed: { type: Boolean, default: false },
    portfolioSubmitted: { type: Boolean, default: false }
  },
  
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  
  issuedDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  expiryDate: {
    type: Date,
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'suspended'],
    default: 'active'
  },
  
  verificationCode: {
    type: String,
    required: true,
    unique: true
  },
  
  digitalBadge: {
    imageUrl: String,
    badgeColor: String,
    achievements: [String]
  },
  
  metadata: {
    issuer: { type: String, default: 'Travel Blog Platform' },
    version: { type: String, default: '1.0' },
    blockchain: {
      transactionHash: String,
      verified: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
});

// REAL methods for certificate management
certificateSchema.methods.isValid = function() {
  return this.status === 'active' && this.expiryDate > new Date();
};

certificateSchema.methods.renew = function() {
  if (this.status === 'active') {
    this.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    return this.save();
  }
  throw new Error('Cannot renew non-active certificate');
};

certificateSchema.methods.revoke = function(reason) {
  this.status = 'revoked';
  this.metadata.revocationReason = reason;
  this.metadata.revokedAt = new Date();
  return this.save();
};

// REAL static methods for certificate operations
certificateSchema.statics.generateCertificateId = function(skillArea, level) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `CERT-${skillArea.toUpperCase()}-${level.toUpperCase()}-${timestamp}-${random}`;
};

certificateSchema.statics.generateVerificationCode = function() {
  return Math.random().toString(36).substr(2, 12).toUpperCase();
};

certificateSchema.statics.verifyCertificate = function(certificateId, verificationCode) {
  return this.findOne({
    certificateId,
    verificationCode,
    status: 'active',
    expiryDate: { $gt: new Date() }
  });
};

certificateSchema.statics.getUserCertificates = function(userId, status = 'active') {
  return this.find({ user: userId, status })
    .sort({ issuedDate: -1 })
    .populate('user', 'username firstName lastName');
};

certificateSchema.statics.getTopCertifiedUsers = function(skillArea, limit = 10) {
  const query = skillArea ? { skillArea, status: 'active' } : { status: 'active' };
  
  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$user',
        totalCertificates: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestLevel: { $max: '$level' },
        latestCertification: { $max: '$issuedDate' }
      }
    },
    { $sort: { totalCertificates: -1, averageScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  ]);
};

// Indexes for better performance
certificateSchema.index({ user: 1, skillArea: 1 });
certificateSchema.index({ certificateId: 1, verificationCode: 1 });
certificateSchema.index({ status: 1, expiryDate: 1 });
certificateSchema.index({ skillArea: 1, level: 1, score: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);