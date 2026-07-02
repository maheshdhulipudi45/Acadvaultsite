const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// User can bookmark a resource only once
BookmarkSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
