const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['blog', 'comment', 'package', 'trip'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reactionType: {
      type: String,
      enum: ['like', 'helpful', 'inspiring', 'informative', 'love', 'wow', 'sad'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one reaction per user per target
reactionSchema.index({ user: 1, targetType: 1, targetId: 1, reactionType: 1 }, { unique: true });
reactionSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Reaction', reactionSchema);
