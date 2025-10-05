const mongoose = require('mongoose');

const ChatbotConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      intent: { type: String }, // 'booking_inquiry', 'destination_info', 'travel_advice'
      entities: [{ 
        type: { type: String },
        value: { type: String },
        confidence: { type: Number }
      }],
      confidence: { type: Number },
      responseTime: { type: Number } // in milliseconds
    }
  }],
  
  context: {
    currentTopic: { type: String },
    userPreferences: {
      budget: { type: String },
      destination: { type: String },
      travelDates: {
        start: { type: Date },
        end: { type: Date }
      },
      travelers: { type: Number }
    },
    conversationStage: {
      type: String,
      enum: ['greeting', 'information_gathering', 'recommendation', 'booking_assistance', 'support']
    }
  },
  
  satisfaction: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    resolved: { type: Boolean, default: false }
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  
  language: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true
});

// Index for efficient querying
ChatbotConversationSchema.index({ user: 1, createdAt: -1 });
ChatbotConversationSchema.index({ sessionId: 1 });
ChatbotConversationSchema.index({ status: 1 });

module.exports = mongoose.model('ChatbotConversation', ChatbotConversationSchema);