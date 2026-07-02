const express = require('express');
const router = express.Router();
const {
  updateProfile,
  toggleBookmark,
  getBookmarks,
  getMyUploads,
  getMyDownloads,
  getNotifications,
  markNotificationsRead,
  getLeaderboard,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public route
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.put('/profile', protect, updateProfile);
router.post('/bookmarks/:resourceId', protect, toggleBookmark);
router.get('/bookmarks', protect, getBookmarks);
router.get('/uploads', protect, getMyUploads);
router.get('/downloads', protect, getMyDownloads);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

module.exports = router;
