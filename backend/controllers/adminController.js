const User = require('../models/User');
const Resource = require('../models/Resource');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalUploads = await Resource.countDocuments({});
    
    // Sum all downloads across resources
    const resources = await Resource.find({});
    const totalDownloads = resources.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);

    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Top 5 trending resources (most downloaded)
    const trendingResources = await Resource.find({})
      .select('title branch downloadsCount averageRating isVerified uploader')
      .populate('uploader', 'name')
      .sort({ downloadsCount: -1 })
      .limit(5);

    // Latest 5 users
    const activeUsers = await User.find({})
      .select('name email points badge createdAt')
      .sort({ points: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalUploads,
        totalDownloads,
        pendingReports,
      },
      trendingResources,
      activeUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};

// @desc    Verify or Unverify a resource
// @route   PUT /api/admin/resources/:id/verify
// @access  Private/Admin
const verifyResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Toggle verified status
    resource.isVerified = !resource.isVerified;
    await resource.save();

    const uploader = await User.findById(resource.uploader);

    if (resource.isVerified) {
      // Award Bonus Points for verified resource: +20 points
      if (uploader) {
        uploader.points += 20;
        uploader.updateBadge();
        await uploader.save();

        // Create verification notification for the uploader
        await Notification.create({
          recipient: uploader._id,
          title: 'Resource Verified! 🌟',
          message: `Your uploaded resource "${resource.title}" has been verified by the administrator. You earned a +20 points bonus!`,
          type: 'verification',
        });
      }
    } else {
      // If unverified, deduct points (optional, let's keep points intact or deduct 20 to balance)
      if (uploader && uploader.points >= 20) {
        uploader.points -= 20;
        uploader.updateBadge();
        await uploader.save();
      }
    }

    res.json({
      message: `Resource is now ${resource.isVerified ? 'verified' : 'unverified'}`,
      resource,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error verifying resource' });
  }
};

// @desc    Delete a resource (and clean up file if local)
// @route   DELETE /api/admin/resources/:id
// @access  Private/Admin
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // If file is stored locally, delete it
    if (resource.fileUrl && resource.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Error deleting local file:', e);
        }
      }
    }

    // Delete resource and related records
    await Resource.deleteOne({ _id: req.params.id });
    await Report.deleteMany({ resource: req.params.id });

    res.json({ message: 'Resource deleted successfully by Admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting resource' });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('reporter', 'name email')
      .populate('resource', 'title branch uploader resourceType fileUrl linkUrl')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
};

// @desc    Resolve a report status
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private/Admin
const resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'resolved';
    await report.save();

    res.json({ message: 'Report marked as resolved', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error resolving report' });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users list' });
  }
};

// @desc    Delete a spam user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Do not allow deleting an admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Delete user resources, reports, downloads, etc.
    const userResources = await Resource.find({ uploader: user._id });
    for (const r of userResources) {
      if (r.fileUrl && r.fileUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', r.fileUrl);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
      await Resource.deleteOne({ _id: r._id });
    }

    await User.deleteOne({ _id: req.params.id });

    res.json({ message: 'User and their uploaded resources deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = {
  getDashboardStats,
  verifyResource,
  deleteResource,
  getReports,
  resolveReport,
  getUsers,
  deleteUser,
};
