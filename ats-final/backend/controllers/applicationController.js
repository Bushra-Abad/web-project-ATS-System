const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Candidate)
const applyForJob = async (req, res) => {
  try {
    const { job, resume, coverLetter } = req.body;
    const candidateId = req.user._id;

    // Check if job exists
    const jobExists = await Job.findById(job);
    if (!jobExists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if candidate already applied for this job
    const existingApplication = await Application.findOne({
      job,
      candidate: candidateId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      job,
      candidate: candidateId,
      resume, // Expecting Cloudinary URL
      coverLetter // Expecting Cloudinary URL
    });

    const createdApplication = await application.save();

    // Send application confirmation email to candidate
    try {
      const { sendApplicationConfirmationEmail } = require('./emailController');
      await sendApplicationConfirmationEmail({
        body: {
          email: req.user.email,
          name: req.user.name,
          jobTitle: jobExists.title,
          candidateId: candidateId
        },
        user: req.user // Add user to req for authentication
      }, {
        status: () => ({ json: () => {} }), // Mock response object
        json: () => {}
      });
    } catch (emailError) {
      console.error('Application confirmation email failed:', emailError.message);
      // Don't fail application if email fails
    }

    if (global.io) {
      global.io.to('admin').emit('admin-new-application', {
        applicationId: createdApplication._id,
        jobId: jobExists._id,
        jobTitle: jobExists.title,
        candidateId: candidateId,
        candidateName: req.user.name,
        candidateEmail: req.user.email,
        status: createdApplication.status,
        createdAt: createdApplication.createdAt
      });

      global.io.to(candidateId.toString()).emit('application-submitted', {
        applicationId: createdApplication._id,
        jobTitle: jobExists.title,
        status: createdApplication.status,
        createdAt: createdApplication.createdAt
      });
    }

    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(500).json({ message: 'Server Error applying for job', error: error.message });
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private (Candidate)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title department status');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching your applications', error: error.message });
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (HR/Admin)
const getAllApplications = async (req, res) => {
  try {
    const { job, branch } = req.query;
    
    // Construct query filters
    let query = {};
    if (job) query.job = job;

    // Filter by branch
    if (branch) {
      const jobsInBranch = await Job.find({ branch }).select('_id');
      const jobIds = jobsInBranch.map(j => j._id);
      
      // If a job filter was also provided, only keep intersection.
      // Otherwise, filter applications to only those jobs in the specified branch.
      query.job = { ...query.job, $in: jobIds };
    }

    const applications = await Application.find(query)
      .populate('candidate', 'name email phone')
      .populate('job', 'title department branch');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching applications', error: error.message });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Protected)
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email phone resume coverLetter profilePicture')
      .populate({
        path: 'job',
        populate: {
          path: 'branch',
          select: 'name address'
        }
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure candidates can only view their own applications
    if (req.user.role === 'candidate' && application.candidate._id.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching application', error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (HR/Admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, evaluationNotes } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (application) {
      const oldStatus = application.status;
      application.status = status || application.status;
      if (evaluationNotes !== undefined) {
        application.evaluationNotes = evaluationNotes;
      }
      if (req.user) {
        application.reviewedBy = req.user._id;
      }
      const updatedApplication = await application.save();

      // Emit real-time updates
      if (global.io) {
        global.io.to(application.candidate._id.toString()).emit('application-status-update', {
          applicationId: application._id,
          jobTitle: application.job.title,
          oldStatus,
          newStatus: application.status,
          candidateName: application.candidate.name,
          evaluationNotes: application.evaluationNotes
        });

        global.io.to('admin').emit('admin-application-status-update', {
          applicationId: application._id,
          jobTitle: application.job.title,
          candidateName: application.candidate.name,
          candidateEmail: application.candidate.email,
          oldStatus,
          newStatus: application.status,
          evaluationNotes: application.evaluationNotes
        });
      }

      res.json(updatedApplication);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating application status', error: error.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus
};
