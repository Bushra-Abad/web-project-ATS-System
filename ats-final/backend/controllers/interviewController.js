const Interview = require('../models/Interview');
const Application = require('../models/Application');

// @desc    Schedule an interview
// @route   POST /api/interviews
// @access  Private (HR/Admin)
const scheduleInterview = async (req, res) => {
  try {
    const { application, date, time, message } = req.body;

    const appRecord = await Application.findById(application);
    if (!appRecord) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const interview = new Interview({
      application,
      candidate: appRecord.candidate,
      job: appRecord.job,
      date,
      time,
      message
    });

    const createdInterview = await interview.save();

    // Automatically update the application status
    appRecord.status = 'Interview Scheduled';
    await appRecord.save();

    res.status(201).json(createdInterview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error scheduling interview', error: error.message });
  }
};

// @desc    Get all interviews
// @route   GET /api/interviews
// @access  Private (HR/Admin)
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({})
      .populate('candidate', 'name email phone')
      .populate('job', 'title department')
      .populate('application', 'status resume coverLetter');
      
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching interviews', error: error.message });
  }
};

// @desc    Get my interviews
// @route   GET /api/interviews/my
// @access  Private (Candidate)
const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ candidate: req.user._id })
      .populate('job', 'title department branch')
      .populate('application', 'status');
      
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching your interviews', error: error.message });
  }
};

// @desc    Update an interview
// @route   PUT /api/interviews/:id
// @access  Private (HR/Admin)
const updateInterview = async (req, res) => {
  try {
    const { date, time, message } = req.body;
    
    const interview = await Interview.findById(req.params.id);

    if (interview) {
      interview.date = date || interview.date;
      interview.time = time || interview.time;
      interview.message = message || interview.message;

      const updatedInterview = await interview.save();
      res.json(updatedInterview);
    } else {
      res.status(404).json({ message: 'Interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating interview', error: error.message });
  }
};

// @desc    Delete an interview
// @route   DELETE /api/interviews/:id
// @access  Private (HR/Admin)
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (interview) {
      // Optionally update the application status back to previous status
      const application = await Application.findById(interview.application);
      if (application && application.status === 'Interview Scheduled') {
        application.status = 'Shortlisted'; // Or whatever the previous status was
        await application.save();
      }

      await Interview.findByIdAndDelete(req.params.id);
      res.json({ message: 'Interview deleted successfully' });
    } else {
      res.status(404).json({ message: 'Interview not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting interview', error: error.message });
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  getMyInterviews,
  updateInterview,
  deleteInterview
};
