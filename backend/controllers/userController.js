const User = require('../models/User');
const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');
const Download = require('../models/Download');
const Notification = require('../models/Notification');

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.college = req.body.college || user.college;
      user.branch = req.body.branch || user.branch;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatarUrl = req.body.avatarUrl !== undefined ? req.body.avatarUrl : user.avatarUrl;
      user.year = req.body.year ? parseInt(req.body.year) : user.year;
      user.semester = req.body.semester ? parseInt(req.body.semester) : user.semester;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        college: updatedUser.college,
        branch: updatedUser.branch,
        year: updatedUser.year,
        semester: updatedUser.semester,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
        points: updatedUser.points,
        badge: updatedUser.badge,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Toggle bookmark for resource
// @route   POST /api/users/bookmarks/:resourceId
// @access  Private
const toggleBookmark = async (req, res) => {
  try {
    const resourceId = req.params.resourceId;
    const userId = req.user._id;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const existingBookmark = await Bookmark.findOne({ user: userId, resource: resourceId });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      return res.json({ bookmarked: false, message: 'Bookmark removed successfully' });
    } else {
      // Add bookmark
      await Bookmark.create({ user: userId, resource: resourceId });
      return res.json({ bookmarked: true, message: 'Resource saved to bookmarks' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error toggling bookmark' });
  }
};

// @desc    Get user bookmarked resources
// @route   GET /api/users/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'resource',
        populate: { path: 'uploader', select: 'name avatarUrl' }
      })
      .sort({ createdAt: -1 });

    const resources = bookmarks.map(b => b.resource).filter(r => r != null);
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching bookmarks' });
  }
};

// @desc    Get user uploaded resources
// @route   GET /api/users/uploads
// @access  Private
const getMyUploads = async (req, res) => {
  try {
    const resources = await Resource.find({ uploader: req.user._id })
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching uploads' });
  }
};

// @desc    Get user download history
// @route   GET /api/users/downloads
// @access  Private
const getMyDownloads = async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user._id })
      .populate('resource')
      .sort({ createdAt: -1 });
    res.json(downloads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching download history' });
  }
};

// @desc    Get system notifications for user
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    // Get notifications destined for this user or global notifications
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { recipient: { $exists: false } },
        { recipient: null }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20);

    const processedNotifications = notifications.map(n => {
      // If direct notification, check n.read. If global, check if user ID is in readBy list.
      const isRead = n.recipient 
        ? n.read 
        : (n.readBy && n.readBy.includes(req.user._id));
      
      const obj = n.toObject();
      obj.read = isRead;
      return obj;
    });

    res.json(processedNotifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
const markNotificationsRead = async (req, res) => {
  try {
    // 1. Mark user's direct notifications as read
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    // 2. Mark global notifications as read for this user
    await Notification.updateMany(
      {
        $or: [
          { recipient: { $exists: false } },
          { recipient: null }
        ],
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error marking notifications read' });
  }
};

// @desc    Get Leaderboard list
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('name avatarUrl points badge college branch')
      .sort({ points: -1 })
      .limit(50); // Get top 50 users

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

module.exports = {
  updateProfile,
  toggleBookmark,
  getBookmarks,
  getMyUploads,
  getMyDownloads,
  getNotifications,
  markNotificationsRead,
  getLeaderboard,
};
