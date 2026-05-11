const express = require('express');
const router = express.Router();
const {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch
} = require('../controllers/branchController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllBranches)
  .post(protect, restrictTo('admin'), createBranch);

router.route('/:id')
  .put(protect, restrictTo('admin'), updateBranch)
  .delete(protect, restrictTo('admin'), deleteBranch);

module.exports = router;
