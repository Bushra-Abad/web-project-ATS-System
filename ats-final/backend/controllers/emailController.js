const nodemailer = require('nodemailer');

// ─── Create Transporter ───────────────────────────────────────────────────────
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS missing in .env');
    return null;
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS   // Gmail App Password (no spaces)
    },
    tls: { rejectUnauthorized: false }
  });
};

// ─── Helper: emit socket notification ────────────────────────────────────────
const emitNotification = (candidateId, emailType, subject, message) => {
  if (global.io && candidateId) {
    global.io.to(candidateId.toString()).emit('candidate-email-notification', {
      emailType, subject, message, timestamp: new Date()
    });
  }
};

// ─── Branded Email Wrapper ────────────────────────────────────────────────────
const emailWrapper = (headerColor, emoji, heading, body) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:${headerColor};padding:30px 35px;text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:8px;">${emoji}</div>
      <h1 style="color:#ffffff;margin:0;font-size:1.6rem;font-weight:700;letter-spacing:0.5px;">${heading}</h1>
    </div>
    <!-- Body -->
    <div style="padding:35px 40px;color:#333333;line-height:1.7;font-size:0.97rem;">
      ${body}
    </div>
    <!-- Footer -->
    <div style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;color:#999;font-size:0.82rem;">TechHire ATS &nbsp;|&nbsp; Automated Recruitment System</p>
      <p style="margin:5px 0 0;color:#bbb;font-size:0.78rem;">Please do not reply to this email directly.</p>
    </div>
  </div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SHORTLIST EMAIL
// POST /api/email/shortlist
// ═══════════════════════════════════════════════════════════════════════════════
const sendShortlistEmail = async (req, res) => {
  try {
    const { email, name, jobTitle, candidateId } = req.body;
    if (!email || !name || !jobTitle)
      return res.status(400).json({ message: 'Missing required fields: email, name, jobTitle' });

    const transporter = createTransporter();
    if (!transporter)
      return res.status(500).json({ message: 'Email service not configured. Check EMAIL_USER and EMAIL_PASS in .env' });

    const subject = `🎉 Congratulations! You've been Shortlisted — ${jobTitle}`;
    const body = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>We are delighted to inform you that after reviewing your application, you have been <strong style="color:#4CAF50;">shortlisted</strong> for the position of:</p>
      <div style="background:#f0fdf4;border-left:4px solid #4CAF50;padding:15px 20px;border-radius:4px;margin:20px 0;">
        <strong style="font-size:1.1rem;">💼 ${jobTitle}</strong>
      </div>
      <p>Our HR team will contact you shortly with the next steps, including details about the interview process. Please keep your phone and email accessible.</p>
      <p style="margin-top:25px;">We look forward to speaking with you soon!</p>
      <p style="margin-top:30px;color:#555;">Warm regards,<br><strong>HR Department</strong><br>TechHire ATS</p>`;

    const mailOptions = {
      from: `"TechHire HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: emailWrapper('linear-gradient(135deg,#4CAF50,#2e7d32)', '🎉', 'You\'re Shortlisted!', body)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Shortlist email sent:', info.messageId);
    emitNotification(candidateId, 'shortlist', subject, `Your application for ${jobTitle} has been shortlisted!`);
    res.status(200).json({ message: 'Shortlist email sent successfully', messageId: info.messageId });

  } catch (error) {
    console.error('❌ Shortlist email error:', error.message);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. INTERVIEW EMAIL
// POST /api/email/interview
// ═══════════════════════════════════════════════════════════════════════════════
const sendInterviewEmail = async (req, res) => {
  try {
    const { email, name, jobTitle, date, time, message, candidateId } = req.body;
    if (!email || !name || !jobTitle || !date || !time)
      return res.status(400).json({ message: 'Missing required fields: email, name, jobTitle, date, time' });

    const transporter = createTransporter();
    if (!transporter)
      return res.status(500).json({ message: 'Email service not configured. Check EMAIL_USER and EMAIL_PASS in .env' });

    const formattedDate = new Date(date).toLocaleDateString('en-PK', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const subject = `📅 Interview Invitation — ${jobTitle}`;
    const body = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>We are pleased to invite you for an <strong>interview</strong> for the position of:</p>
      <div style="background:#e3f2fd;border-left:4px solid #2196F3;padding:18px 22px;border-radius:4px;margin:20px 0;">
        <p style="margin:0 0 10px;font-size:1.1rem;"><strong>💼 Position:</strong> ${jobTitle}</p>
        <p style="margin:0 0 8px;"><strong>📅 Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px;"><strong>⏰ Time:</strong> ${time}</p>
        ${message ? `<p style="margin:0;"><strong>📝 Details / Instructions:</strong><br><span style="white-space:pre-line;">${message}</span></p>` : ''}
      </div>
      <p>Please <strong>reply to this email</strong> or contact us to confirm your availability. If you have any questions, do not hesitate to reach out.</p>
      <p>We look forward to meeting you!</p>
      <p style="margin-top:30px;color:#555;">Best regards,<br><strong>HR Department</strong><br>TechHire ATS</p>`;

    const mailOptions = {
      from: `"TechHire HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: emailWrapper('linear-gradient(135deg,#2196F3,#1565c0)', '📅', 'Interview Invitation', body)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Interview email sent:', info.messageId);
    emitNotification(candidateId, 'interview', subject, `Interview scheduled for ${jobTitle} on ${formattedDate} at ${time}.`);
    res.status(200).json({ message: 'Interview email sent successfully', messageId: info.messageId });

  } catch (error) {
    console.error('❌ Interview email error:', error.message);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. REJECTION EMAIL
// POST /api/email/rejection
// ═══════════════════════════════════════════════════════════════════════════════
const sendRejectionEmail = async (req, res) => {
  try {
    const { email, name, jobTitle, candidateId } = req.body;
    if (!email || !name || !jobTitle)
      return res.status(400).json({ message: 'Missing required fields: email, name, jobTitle' });

    const transporter = createTransporter();
    if (!transporter)
      return res.status(500).json({ message: 'Email service not configured. Check EMAIL_USER and EMAIL_PASS in .env' });

    const subject = `Update on Your Application — ${jobTitle}`;
    const body = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at TechHire and for taking the time to apply.</p>
      <p>After carefully reviewing all applications, we regret to inform you that we will not be moving forward with your application at this time. This was a difficult decision as we received many strong applications.</p>
      <div style="background:#fff8e1;border-left:4px solid #FFC107;padding:15px 20px;border-radius:4px;margin:20px 0;">
        <p style="margin:0;color:#555;">💡 We will keep your profile on file and will reach out if a suitable opportunity arises in the future. We encourage you to apply for other open positions that match your skills.</p>
      </div>
      <p>We appreciate your interest in TechHire and wish you all the best in your career endeavors.</p>
      <p style="margin-top:30px;color:#555;">Kind regards,<br><strong>HR Department</strong><br>TechHire ATS</p>`;

    const mailOptions = {
      from: `"TechHire HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: emailWrapper('linear-gradient(135deg,#607d8b,#455a64)', '📋', 'Application Status Update', body)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent:', info.messageId);
    emitNotification(candidateId, 'rejection', subject, `Update on your application for ${jobTitle}.`);
    res.status(200).json({ message: 'Rejection email sent successfully', messageId: info.messageId });

  } catch (error) {
    console.error('❌ Rejection email error:', error.message);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CUSTOM EMAIL
// POST /api/email/custom
// ═══════════════════════════════════════════════════════════════════════════════
const sendCustomEmail = async (req, res) => {
  try {
    const { email, subject, message, candidateId } = req.body;
    if (!email || !subject || !message)
      return res.status(400).json({ message: 'Missing required fields: email, subject, message' });

    const transporter = createTransporter();
    if (!transporter)
      return res.status(500).json({ message: 'Email service not configured. Check EMAIL_USER and EMAIL_PASS in .env' });

    const body = `
      <p>Dear Candidate,</p>
      <div style="background:#f9f9f9;border:1px solid #eee;padding:20px;border-radius:6px;margin:15px 0;white-space:pre-line;line-height:1.8;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <p style="margin-top:30px;color:#555;">Best regards,<br><strong>HR Department</strong><br>TechHire ATS</p>`;

    const mailOptions = {
      from: `"TechHire HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: emailWrapper('linear-gradient(135deg,#9C27B0,#6a1b9a)', '✉️', 'Message from HR Team', body)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Custom email sent:', info.messageId);
    emitNotification(candidateId, 'custom', subject, `New message from HR: "${subject}"`);
    res.status(200).json({ message: 'Custom email sent successfully', messageId: info.messageId });

  } catch (error) {
    console.error('❌ Custom email error:', error.message);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. REGISTRATION EMAIL (utility + route)
// ═══════════════════════════════════════════════════════════════════════════════
const sendRegistrationEmailUtil = async (email, name, candidateId) => {
  try {
    if (!email || !name) return false;
    const transporter = createTransporter();
    if (!transporter) return false;

    const subject = '🎉 Welcome to TechHire ATS — Account Created';
    const body = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>Welcome to <strong>TechHire ATS</strong>! Your account has been successfully created.</p>
      <div style="background:#e8f5e9;border-left:4px solid #4CAF50;padding:15px 20px;border-radius:4px;margin:20px 0;">
        <p style="margin:0 0 8px;"><strong>✅ What you can do now:</strong></p>
        <ul style="margin:0;padding-left:20px;line-height:2;">
          <li>Browse all available job openings</li>
          <li>Upload your resume and cover letter (via Cloudinary)</li>
          <li>Apply for jobs and track your application status</li>
          <li>Receive real-time interview notifications</li>
        </ul>
      </div>
      <p style="margin-top:30px;color:#555;">Best regards,<br><strong>TechHire ATS Team</strong></p>`;

    await transporter.sendMail({
      from: `"TechHire ATS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: emailWrapper('linear-gradient(135deg,#667eea,#764ba2)', '🎉', 'Welcome to TechHire ATS!', body)
    });
    emitNotification(candidateId, 'registration', subject, 'Welcome! Your account is ready.');
    console.log('✅ Registration email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Registration email error (non-fatal):', error.message);
    return false;
  }
};

const sendRegistrationEmail = async (req, res) => {
  try {
    const { email, name, candidateId } = req.body;
    if (!email || !name)
      return res.status(400).json({ message: 'Missing required fields: email, name' });
    const sent = await sendRegistrationEmailUtil(email, name, candidateId);
    if (sent) res.status(200).json({ message: 'Registration email sent successfully' });
    else res.status(500).json({ message: 'Email service not configured' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending registration email', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. APPLICATION CONFIRMATION EMAIL
// ═══════════════════════════════════════════════════════════════════════════════
const sendApplicationConfirmationEmail = async (req, res) => {
  try {
    const { email, name, jobTitle, candidateId } = req.body;
    if (!email || !name || !jobTitle)
      return res.status(400).json({ message: 'Missing required fields: email, name, jobTitle' });

    const transporter = createTransporter();
    if (!transporter)
      return res.status(500).json({ message: 'Email service not configured' });

    const subject = `✅ Application Submitted — ${jobTitle}`;
    const body = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your application for <strong>${jobTitle}</strong> has been successfully submitted!</p>
      <div style="background:#e3f2fd;border-left:4px solid #2196F3;padding:15px 20px;border-radius:4px;margin:20px 0;">
        <p style="margin:0 0 8px;"><strong>📋 Job:</strong> ${jobTitle}</p>
        <p style="margin:0 0 8px;"><strong>📅 Submitted:</strong> ${new Date().toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        <p style="margin:0;"><strong>📊 Status:</strong> <span style="background:#FFC107;color:#000;padding:3px 8px;border-radius:3px;font-weight:bold;">Submitted</span></p>
      </div>
      <p>We will review your application and notify you about the next steps. You can track your status in your dashboard.</p>
      <p style="margin-top:30px;color:#555;">Best regards,<br><strong>HR Department</strong><br>TechHire ATS</p>`;

    const info = await transporter.sendMail({
      from: `"TechHire HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: emailWrapper('linear-gradient(135deg,#4CAF50,#1b5e20)', '✅', 'Application Received!', body)
    });
    emitNotification(candidateId, 'application_confirmation', subject, `Application for ${jobTitle} submitted.`);
    res.status(200).json({ message: 'Application confirmation email sent', messageId: info.messageId });
  } catch (error) {
    console.error('❌ Application email error:', error.message);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

module.exports = {
  sendShortlistEmail,
  sendInterviewEmail,
  sendRejectionEmail,
  sendCustomEmail,
  sendRegistrationEmail,
  sendRegistrationEmailUtil,
  sendApplicationConfirmationEmail
};
