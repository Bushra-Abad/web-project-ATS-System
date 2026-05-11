const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, restrictTo('candidate'), applyForJob)
  .get(protect, restrictTo('hr', 'admin'), getAllApplications);

router.get('/my', protect, restrictTo('candidate'), getMyApplications);

router.route('/:id')
  .get(protect, getApplicationById);

router.put('/:id/status', protect, restrictTo('hr', 'admin'), updateApplicationStatus);

module.exports = router;
