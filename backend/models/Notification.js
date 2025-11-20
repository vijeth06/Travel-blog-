const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // System notifications might not have a sender
  },
  type: {
    type: String,
    enum: [
      'comment', 
      'like', 
      'follow', 
      'booking', 
      'save', 
      'system',
      'message',        // New chat message
      'reply',          // Reply to comment
      'mention',        // User mentioned in comment/post
      'review',         // New review on user's content
      'achievement',    // Achievement unlocked
      'story_view',     // Someone viewed your story
      'gallery_like',   // Gallery photo liked
      'itinerary_share' // Someone shared itinerary
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: false // Optional link to navigate to
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: false // Additional data for the notification
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);