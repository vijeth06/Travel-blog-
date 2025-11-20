const mongoose = require('mongoose');

const topicFollowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    followType: {
      type: String,
      enum: ['tag', 'continent', 'country', 'city', 'category'],
      required: true,
    },
    followValue: {
      type: String,
      required: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

topicFollowSchema.index({ user: 1, followType: 1, followValue: 1 }, { unique: true });
topicFollowSchema.index({ followType: 1, followValue: 1 });

module.exports = mongoose.model('TopicFollow', topicFollowSchema);
