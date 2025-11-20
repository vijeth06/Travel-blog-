const mongoose = require('mongoose');

const LoginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  ip: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    enum: ['invalid_credentials', 'account_locked', 'account_inactive', 'success', '2fa_required']
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  suspicious: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-delete after 90 days
LoginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('LoginAttempt', LoginAttemptSchema);
