const express = require('express');
const router = express.Router();
const { uploadResume, uploadCoverLetter, uploadProfilePic } = require('../config/cloudinary');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// @route   POST /api/upload/resume
// @desc    Upload resume to cloudinary (PDF, DOC, DOCX)
// @access  Private (Candidate only)
router.post('/resume', protect, restrictTo('candidate'), uploadResume.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF, DOC, or DOCX file (Max 5MB)' });
  }
  
  res.status(200).json({
    message: 'Resume uploaded successfully',
    url: req.file.path, // Cloudinary URL to save in database
    filename: req.file.originalname,
    format: req.file.format || req.file.originalname.split('.').pop().toLowerCase()
  });
});

// @route   POST /api/upload/cover-letter
// @desc    Upload cover letter to cloudinary (PDF, DOC, DOCX, TXT)
// @access  Private (Candidate only)
router.post('/cover-letter', protect, restrictTo('candidate'), uploadCoverLetter.single('coverLetter'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF, DOC, DOCX, or TXT file (Max 3MB)' });
  }
  
  res.status(200).json({
    message: 'Cover letter uploaded successfully',
    url: req.file.path, // Cloudinary URL to save in database
    filename: req.file.originalname,
    format: req.file.format || req.file.originalname.split('.').pop().toLowerCase()
  });
});

// @route   POST /api/upload/profile
// @desc    Upload profile picture to cloudinary
// @access  Private (Any authenticated user)
router.post('/profile', protect, uploadProfilePic.single('profilePic'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file (Max 2MB)' });
  }
  
  res.status(200).json({
    message: 'Profile picture uploaded successfully',
    url: req.file.path // Cloudinary URL to save in database
  });
});

module.exports = router;
