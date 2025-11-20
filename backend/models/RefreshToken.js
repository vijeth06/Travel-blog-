const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    deviceId: String,
    deviceName: String,
    browser: String,
    os: String,
    ip: String,
    location: String
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for automatic cleanup
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Clean up expired tokens
RefreshTokenSchema.statics.cleanupExpired = async function() {
  await this.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
