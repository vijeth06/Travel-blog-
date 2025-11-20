const mongoose = require('mongoose');

const premiumTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['adventure', 'luxury', 'budget', 'family', 'solo', 'romantic', 'cultural', 'beach', 'mountain', 'city'],
      required: true,
    },
    duration: {
      type: Number, // in days
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    items: [{
      day: { type: Number },
      type: {
        type: String,
        enum: ['package', 'blog', 'activity', 'custom'],
      },
      refId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      title: { type: String },
      description: { type: String },
      note: { type: String },
    }],
    estimatedCost: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: true,
    },
    tags: [{ type: String }],
    imageUrl: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

premiumTemplateSchema.index({ category: 1, destination: 1 });
premiumTemplateSchema.index({ isPremium: 1, isActive: 1 });

module.exports = mongoose.model('PremiumTemplate', premiumTemplateSchema);
