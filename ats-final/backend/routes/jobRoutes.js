const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllJobs)
  .post(protect, restrictTo('hr', 'admin'), createJob);

router.route('/:id')
  .get(getJobById)
  .put(protect, restrictTo('hr', 'admin'), updateJob)
  .delete(protect, restrictTo('hr', 'admin'), deleteJob);

module.exports = router;
