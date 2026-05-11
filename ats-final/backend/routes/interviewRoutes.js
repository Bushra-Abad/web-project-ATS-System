const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getInterviews,
  getMyInterviews,
  updateInterview,
  deleteInterview
} = require('../controllers/interviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, restrictTo('hr', 'admin'), scheduleInterview)
  .get(protect, restrictTo('hr', 'admin'), getInterviews);

router.get('/my', protect, restrictTo('candidate'), getMyInterviews);

router.route('/:id')
  .put(protect, restrictTo('hr', 'admin'), updateInterview)
  .delete(protect, restrictTo('hr', 'admin'), deleteInterview);

module.exports = router;
