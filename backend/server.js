const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to Database
connectDB();

const User = require('./models/User');

// Seed Admin User if none exists
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);
      
      await User.create({
        name: 'System Admin',
        email: 'admin@acadvault.com',
        password: hashedPassword,
        role: 'admin',
        college: 'AcadVault Core Team',
        branch: 'Placement & Development',
        year: 4,
        semester: 8,
        points: 500,
        badge: 'Top Uploader',
        bio: 'Official Admin Account of AcadVault Platform',
      });
      console.log('✅ Default Admin seeded (admin@acadvault.com / adminpassword123)');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};
seedAdmin();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files for Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root path
app.get('/', (req, res) => {
  res.send('AcadVault API is running successfully...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
