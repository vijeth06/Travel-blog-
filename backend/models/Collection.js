const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    items: [{
      type: {
        type: String,
        enum: ['trip', 'blog', 'package'],
        required: true,
      },
      refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      }
    }],
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

collectionSchema.index({ user: 1, createdAt: -1 });
collectionSchema.index({ isPublic: 1, views: -1 });

module.exports = mongoose.model('Collection', collectionSchema);
