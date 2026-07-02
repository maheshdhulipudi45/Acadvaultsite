const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  verifyResource,
  deleteResource,
  getReports,
  resolveReport,
  getUsers,
  deleteUser,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here require auth and admin role
router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.put('/resources/:id/verify', verifyResource);
router.delete('/resources/:id', deleteResource);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
