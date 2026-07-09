const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  resourceType: {
    type: String,
    enum: ['pdf', 'ppt', 'docx', 'zip', 'drive', 'youtube', 'website', 'github'],
    required: true,
  },
  fileUrl: {
    type: String, // Path for local files or Cloudinary URL
    default: '',
  },
  fileHash: {
    type: String, // Used for duplicate checking (MD5 hash)
    default: '',
  },
  file_data: {
    type: String, // Base64 representation of file
    default: '',
  },
  file_type: {
    type: String, // Extension / type of file
    default: '',
  },
  linkUrl: {
    type: String, // For external URLs (Drive, YouTube, GitHub, Website)
    default: '',
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  university: {
    type: String,
    default: '',
    trim: true,
  },
  college: {
    type: String,
    default: '',
    trim: true,
  },
  branch: {
    type: String, // e.g., MCA, BTech, Placement, Interview Prep
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    default: 1,
  },
  semester: {
    type: Number,
    default: 1,
  },
  tags: {
    type: [String],
    default: [],
  },
  downloadsCount: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the average rating before saving if ratings change
ResourceSchema.pre('save', function (next) {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model('Resource', ResourceSchema);
