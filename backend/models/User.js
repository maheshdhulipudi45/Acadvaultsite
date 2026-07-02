const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  college: {
    type: String,
    default: '',
  },
  branch: {
    type: String,
    default: '',
  },
  year: {
    type: Number,
    default: 1,
  },
  semester: {
    type: Number,
    default: 1,
  },
  bio: {
    type: String,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  points: {
    type: Number,
    default: 0,
  },
  badge: {
    type: String,
    enum: ['Bronze Contributor', 'Silver Contributor', 'Gold Contributor', 'Platinum Contributor', 'Top Uploader'],
    default: 'Bronze Contributor',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate badge level dynamically or update on change
UserSchema.methods.updateBadge = function () {
  const pts = this.points;
  if (pts >= 1000) {
    this.badge = 'Top Uploader';
  } else if (pts >= 400) {
    this.badge = 'Platinum Contributor';
  } else if (pts >= 150) {
    this.badge = 'Gold Contributor';
  } else if (pts >= 50) {
    this.badge = 'Silver Contributor';
  } else {
    this.badge = 'Bronze Contributor';
  }
};

module.exports = mongoose.model('User', UserSchema);
