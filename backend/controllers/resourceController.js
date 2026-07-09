const Resource = require('../models/Resource');
const User = require('../models/User');
const Download = require('../models/Download');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { calculateFileHash } = require('../middleware/uploadMiddleware');
const { normalizeResource, attachUploaders } = require('../utils/normalizeResource');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  pdf: 'application/pdf',
  ppt: 'application/vnd.ms-powerpoint',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  zip: 'application/zip',
};

// Helper to update user points and badges
const awardPoints = async (userId, pointsAwarded) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.points += pointsAwarded;
      user.updateBadge();
      await user.save();
    }
  } catch (err) {
    console.error('Error awarding points:', err);
  }
};

// @desc    Check if a similar resource already exists
// @route   POST /api/resources/check-duplicate
// @access  Private
const checkDuplicate = async (req, res) => {
  try {
    const { title, branch, semester, resourceType, linkUrl, fileHash } = req.body;

    // Check by Link URL
    if (linkUrl && ['drive', 'youtube', 'website', 'github'].includes(resourceType)) {
      const existingLink = await Resource.findOne({ linkUrl: linkUrl.trim() });
      if (existingLink) {
        return res.status(200).json({ duplicate: true, message: 'Similar resource already exists (URL matches).' });
      }
    }

    // Check by File Hash (if pre-computed, though typically done on file upload)
    if (fileHash && ['pdf', 'ppt', 'docx', 'zip'].includes(resourceType)) {
      const existingHash = await Resource.findOne({ fileHash });
      if (existingHash) {
        return res.status(200).json({ duplicate: true, message: 'Similar resource already exists (File checksum matches).' });
      }
    }

    // Check by combination of Title, Branch/Subject, and Semester
    if (title && branch && semester) {
      const existingTitle = await Resource.findOne({
        title: { $regex: new RegExp('^' + title.trim() + '$', 'i') },
        branch: branch.trim(),
        semester: parseInt(semester),
      });

      if (existingTitle) {
        return res.status(200).json({ duplicate: true, message: 'Similar resource already exists (Title & Subject/Semester match).' });
      }
    }

    return res.status(200).json({ duplicate: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error checking duplicates', error: error.message });
  }
};

// @desc    Upload new resource (File or External Link)
// @route   POST /api/resources/upload
// @access  Private
const uploadResource = async (req, res) => {
  try {
    const {
      title,
      description,
      resourceType,
      linkUrl,
      university,
      college,
      branch,
      year,
      semester,
      tags,
    } = req.body;

    if (!title || !description || !resourceType || !branch) {
      // Cleanup file if uploaded
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    let fileUrl = '';
    let fileHash = '';

    // If file is uploaded, process it
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      try {
        fileHash = await calculateFileHash(req.file.path);
        
        // Double check hash duplicate
        const hashMatch = await Resource.findOne({ fileHash });
        if (hashMatch) {
          fs.unlinkSync(req.file.path);
          return res.status(409).json({ message: 'Similar resource already exists (Exact same file structure).' });
        }
      } catch (err) {
        console.error('Hash calculation error:', err);
      }
    } else if (linkUrl) {
      // Check link URL duplicate
      const linkMatch = await Resource.findOne({ linkUrl: linkUrl.trim() });
      if (linkMatch) {
        return res.status(409).json({ message: 'Similar resource already exists (Exact same URL link).' });
      }
      fileUrl = linkUrl.trim();
    } else {
      return res.status(400).json({ message: 'Please upload a file or provide a valid external resource URL link.' });
    }

    // Double check name, branch, semester duplicate
    const metaMatch = await Resource.findOne({
      title: { $regex: new RegExp('^' + title.trim() + '$', 'i') },
      branch: branch.trim(),
      semester: parseInt(semester),
    });
    if (metaMatch) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ message: 'Similar resource already exists (Same Title, Subject and Semester).' });
    }

    // Parse tags if provided
    let tagsArray = [];
    if (tags) {
      tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim().toLowerCase()) : tags;
    }

    const resource = await Resource.create({
      title,
      description,
      resourceType,
      fileUrl,
      fileHash,
      linkUrl: linkUrl || '',
      uploader: req.user._id,
      university: university || '',
      college: college || '',
      branch,
      year: year ? parseInt(year) : 1,
      semester: semester ? parseInt(semester) : 1,
      tags: tagsArray,
    });

    // Award Points: Upload = +10 Points
    await awardPoints(req.user._id, 10);

    // Create a global notification
    await Notification.create({
      title: 'New Resource Uploaded',
      message: `A new resource "${title}" has been uploaded to the ${branch} section by ${req.user.name}.`,
      type: 'new_upload',
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({ message: 'Server error uploading resource', error: error.message });
  }
};

// @desc    Get resources with filtering, sorting, and search
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res) => {
  try {
    const {
      search,
      branch,
      semester,
      resourceType,
      isVerified,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const query = {};

    // Apply Filter: Branch (subject stream)
    if (branch && branch !== 'All') {
      // Support subcategory matching
      if (branch === 'BTech' || branch === 'MCA' || branch === 'Placement' || branch === 'Interview Prep') {
        query.branch = { $regex: new RegExp(branch, 'i') };
      } else {
        query.branch = branch;
      }
    }

    // Apply Filter: Semester
    if (semester && semester !== 'All') {
      query.semester = parseInt(semester);
    }

    // Apply Filter: Resource Type
    if (resourceType && resourceType !== 'All') {
      if (resourceType === 'PDF') {
        query.resourceType = 'pdf';
      } else if (resourceType === 'Websites') {
        query.resourceType = 'website';
      } else if (resourceType === 'Drive Links') {
        query.resourceType = 'drive';
      } else if (resourceType === 'YouTube') {
        query.resourceType = 'youtube';
      } else if (resourceType === 'GitHub') {
        query.resourceType = 'github';
      } else {
        query.resourceType = resourceType.toLowerCase();
      }
    }

    // Apply Filter: Verified
    if (isVerified === 'true' || isVerified === 'Verified Only') {
      query.isVerified = true;
    }

    // Smart Fuzzy Search
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      
      // Let's break search string into components to check tags, subject codes or sem e.g. "DBMS 3rd Sem"
      const semMatches = search.match(/(\d+)(st|nd|rd|th)?\s*sem/i);
      const isMca = /mca/i.test(search);
      const isBtech = /btech/i.test(search);
      const isInterview = /(interview|placement|aptitude)/i.test(search);

      const searchQueries = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { branch: searchRegex },
      ];

      if (semMatches) {
        query.semester = parseInt(semMatches[1]);
      }
      if (isMca) query.branch = { $regex: /mca/i };
      if (isBtech) query.branch = { $regex: /btech/i };
      if (isInterview) query.branch = { $regex: /(placement|interview)/i };

      query.$or = searchQueries;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'Most Downloaded') {
      sortOptions = { downloadsCount: -1 };
    } else if (sort === 'Newest' || sort === 'Newest Uploads') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'Top Rated') {
      sortOptions = { averageRating: -1 };
    } else if (sort === 'Verified') {
      sortOptions = { isVerified: -1, createdAt: -1 };
    }

    // Verify first, then apply sort option (Verified resources appear higher in search)
    // We can sort primarily by isVerified (-1) if we want verified resources to always show up higher,
    // followed by the requested sort choice. This meets the requirement "Verified resources appear higher in search"
    const finalSort = { isVerified: -1, ...sortOptions };

    const resources = await Resource.find(query)
      .select('-file_data')
      .populate('uploader', 'name avatarUrl points badge')
      .sort(finalSort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(query);
    const normalizedResources = await attachUploaders(resources.map(normalizeResource));

    res.json({
      resources: normalizedResources,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving resources', error: error.message });
  }
};

// @desc    Get resource details
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .select('-file_data')
      .populate('uploader', 'name avatarUrl points badge')
      .populate('ratings.user', 'name avatarUrl');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const [normalizedResource] = await attachUploaders([normalizeResource(resource)]);
    res.json(normalizedResource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching resource details' });
  }
};

// @desc    Rate or Like a resource
// @route   POST /api/resources/:id/rate
// @access  Private
const rateResource = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide rating between 1 and 5' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is rating their own resource
    if (resource.uploader.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rate your own resource' });
    }

    // Check if already rated
    const existingRatingIndex = resource.ratings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex >= 0) {
      resource.ratings[existingRatingIndex].rating = rating;
    } else {
      resource.ratings.push({ user: req.user._id, rating });
    }

    await resource.save();

    // Give rating points to uploader if average rating is solid
    if (resource.averageRating >= 4.0) {
      await awardPoints(resource.uploader, 2);
    }

    res.json({ message: 'Rating saved successfully', averageRating: resource.averageRating, ratingsCount: resource.ratings.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error rating resource' });
  }
};

// @desc    Log resource download and reward uploader
// @route   POST /api/resources/:id/download
// @access  Private
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Log the download history
    await Download.create({
      user: req.user._id,
      resource: resource._id,
    });

    // Increment downloads count on resource
    resource.downloadsCount += 1;
    await resource.save();

    // Reward points: Download = +2 points to the uploader
    if (resource.uploader.toString() !== req.user._id.toString()) {
      await awardPoints(resource.uploader, 2);
    }

    res.json({ message: 'Download tracked successfully', downloadsCount: resource.downloadsCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error logging download' });
  }
};

// @desc    Report resource for spam/issues
// @route   POST /api/resources/:id/report
// @access  Private
const reportResource = async (req, res) => {
  try {
    const { reportType, description } = req.body;

    if (!reportType || !description) {
      return res.status(400).json({ message: 'Please select a report type and provide details' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      resource: resource._id,
      reportType,
      description,
    });

    res.status(201).json({ message: 'Report submitted successfully. Admin will review it shortly.', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting report' });
  }
};

// @desc    Get recommended resources
// @route   GET /api/resources/:id/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Recommendation logic: find resources in the same branch, semester or sharing same tags, excluding current
    const branch = resource.branch || resource.subject || resource.category || 'General';
    const recommendations = await Resource.find({
      _id: { $ne: resource._id },
      $or: [
        { branch },
        { subject: branch },
        { category: branch },
        { semester: resource.semester },
        { tags: { $in: resource.tags || [] } }
      ]
    })
    .select('-file_data')
    .populate('uploader', 'name avatarUrl')
    .limit(4);

    const normalizedRecommendations = await attachUploaders(recommendations.map(normalizeResource));
    res.json(normalizedRecommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error getting recommendations' });
  }
};

// @desc    Serve stored resource file (legacy base64 or uploaded file)
// @route   GET /api/resources/:id/file
// @access  Public
const serveResourceFile = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const resourceType = normalizeResource(resource).resourceType;
    const fileType = (resource.file_type || resource.fileType || resourceType || 'pdf').toLowerCase();

    if (resource.file_data) {
      const buffer = Buffer.from(resource.file_data, 'base64');
      res.setHeader('Content-Type', MIME_TYPES[fileType] || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${(resource.title || 'resource').replace(/[^\w.-]/g, '_')}.${fileType}"`
      );
      return res.send(buffer);
    }

    if (resource.fileUrl && resource.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    const externalUrl = resource.linkUrl || resource.file_url || resource.fileUrl;
    if (externalUrl && externalUrl.startsWith('http')) {
      return res.redirect(externalUrl);
    }

    return res.status(404).json({ message: 'File not found for this resource' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error serving resource file' });
  }
};

module.exports = {
  checkDuplicate,
  uploadResource,
  getResources,
  getResourceById,
  rateResource,
  downloadResource,
  reportResource,
  getRecommendations,
  serveResourceFile,
};
