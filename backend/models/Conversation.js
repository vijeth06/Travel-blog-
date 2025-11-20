const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  },
  groupAvatar: {
    type: String
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  archived: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  muted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for finding user conversations
ConversationSchema.index({ participants: 1, lastMessageAt: -1 });

// Virtual for unread count per user
ConversationSchema.virtual('unreadCount').get(function() {
  return 0; // Will be calculated in controller
});

// Method to add participant
ConversationSchema.methods.addParticipant = async function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    await this.save();
  }
};

// Method to remove participant
ConversationSchema.methods.removeParticipant = async function(userId) {
  this.participants = this.participants.filter(p => p.toString() !== userId.toString());
  await this.save();
};

module.exports = mongoose.model('Conversation', ConversationSchema);
