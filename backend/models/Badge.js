const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeType: {
      type: String,
      enum: [
        'certified_guide',
        'local_expert',
        'top_contributor',
        'verified_traveler',
        'photography_pro',
        'adventure_seeker',
        'culture_enthusiast',
        'food_explorer',
        'early_adopter',
        'mentor'
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    criteria: {
      type: String,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

badgeSchema.index({ user: 1, badgeType: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);
