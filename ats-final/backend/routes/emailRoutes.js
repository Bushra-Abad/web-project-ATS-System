const express = require('express');
const router = express.Router();
const {
  sendShortlistEmail,
  sendInterviewEmail,
  sendRejectionEmail,
  sendCustomEmail,
  sendRegistrationEmail,
  sendApplicationConfirmationEmail
} = require('../controllers/emailController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes for registration and application confirmation
router.post('/registration-confirmation', sendRegistrationEmail);
router.post('/application-confirmation', protect, restrictTo('candidate'), sendApplicationConfirmationEmail);

// All other email routes are protected for HR and Admin only
router.use(protect, restrictTo('hr', 'admin'));

router.post('/shortlist', sendShortlistEmail);
router.post('/interview', sendInterviewEmail);
router.post('/rejection', sendRejectionEmail);
router.post('/custom', sendCustomEmail);

// Test email endpoint (remove in production)
router.post('/test', protect, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address required for testing' });
    }

    const { sendRegistrationEmail } = require('../controllers/emailController');
    await sendRegistrationEmail({
      body: {
        email: email,
        name: 'Test User',
        candidateId: req.user._id
      }
    }, {
      status: () => ({ json: () => {} }),
      json: () => {}
    });

    res.status(200).json({ message: 'Test email sent successfully! Check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Test email failed', error: error.message });
  }
});

module.exports = router;
