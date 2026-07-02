const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'acadvaultsupersecretjwtkey123';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, college, branch, year, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database connection is not active. readyState:', mongoose.connection.readyState);
      return res.status(500).json({
        message: 'Database connection is not active.',
        error: 'The server is currently unable to communicate with the database. Please verify your MongoDB Atlas cluster whitelisting (Network Access) and environment variables.'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college: college || '',
      branch: branch || '',
      year: year ? parseInt(year) : 1,
      semester: semester ? parseInt(semester) : 1,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        year: user.year,
        semester: user.semester,
        points: user.points,
        badge: user.badge,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database connection is not active. readyState:', mongoose.connection.readyState);
      return res.status(500).json({
        message: 'Database connection is not active.',
        error: 'The server is currently unable to communicate with the database. Please verify your MongoDB Atlas cluster whitelisting (Network Access) and environment variables.'
      });
    }

    // Check for user email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    let isMatch = false;
    if (user) {
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        console.warn('⚠️ Bcrypt comparison failed (likely invalid hash format in DB):', bcryptError.message);
        // Fallback: check if password matches plain text
        isMatch = (password === user.password);
      }
    }

    if (user && isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        year: user.year,
        semester: user.semester,
        points: user.points,
        badge: user.badge,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Get API and Database connection status
// @route   GET /api/auth/status
// @access  Public
const getStatus = async (req, res) => {
  const status = {
    mongooseReadyState: mongoose.connection.readyState,
    mongooseState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
    env: {
      hasMongodbUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
    }
  };
  res.json(status);
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getStatus,
};
