const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one user can only bookmark a blog once
BookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });

// Index for efficient blog bookmarks query
BookmarkSchema.index({ blog: 1, createdAt: -1 });

// Index for user's bookmarks
BookmarkSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
