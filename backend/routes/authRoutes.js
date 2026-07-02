const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getStatus } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/status', getStatus);
router.get('/me', protect, getMe);

module.exports = router;
