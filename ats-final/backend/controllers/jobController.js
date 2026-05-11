const Job = require('../models/Job');

// @desc    Get all jobs (with optional branch & department filters)
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const { branch, department } = req.query;
    let query = {};
    
    if (branch) query.branch = branch;
    if (department) query.department = department;

    const jobs = await Job.find(query)
      .populate('branch', 'name address')
      .populate('postedBy', 'name email');
      
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching jobs', error: error.message });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('branch', 'name address')
      .populate('postedBy', 'name email');
    
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching job', error: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (HR/Admin)
const createJob = async (req, res) => {
  try {
    const { title, description, department, branch, seats, requirements, status } = req.body;

    const job = new Job({
      title,
      description,
      department,
      branch,
      seats,
      requirements,
      status,
      postedBy: req.user._id // Automatically assigned from logged in user
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating job', error: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (HR/Admin)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      job.title = req.body.title || job.title;
      job.description = req.body.description || job.description;
      job.department = req.body.department || job.department;
      job.branch = req.body.branch || job.branch;
      job.seats = req.body.seats !== undefined ? req.body.seats : job.seats;
      job.requirements = req.body.requirements || job.requirements;
      job.status = req.body.status || job.status;

      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating job', error: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (HR/Admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting job', error: error.message });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
