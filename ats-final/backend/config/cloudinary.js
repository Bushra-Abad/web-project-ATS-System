const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with dotenv variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for Resume (PDF and DOCX)
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ats_resumes',
    resource_type: 'raw',
    format: async (req, file) => {
      // Keep original format for better compatibility
      const ext = file.originalname.split('.').pop().toLowerCase();
      return ext;
    },
    public_id: (req, file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
      return `${originalName}_${timestamp}`;
    }
  },
});

// Storage for Cover Letter (PDF and DOCX)
const coverLetterStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ats_cover_letters',
    resource_type: 'raw',
    format: async (req, file) => {
      const ext = file.originalname.split('.').pop().toLowerCase();
      return ext;
    },
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, "");
      return `${originalName}_${timestamp}`;
    }
  },
});

// Storage for Profile Picture (Image only)
const profilePicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ats_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

// File filter for Resume (DOC, DOCX only)
const resumeFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedExtensions = ['.doc', '.docx'];

  const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only Word documents (DOC or DOCX) are allowed for resumes. Please upload a .doc or .docx file.'), false);
  }
};

// File filter for Cover Letter (DOC, DOCX only)
const coverLetterFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedExtensions = ['.doc', '.docx'];

  const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only Word documents (DOC or DOCX) are allowed for cover letters. Please upload a .doc or .docx file.'), false);
  }
};

// File filter for Profile Pic
const profilePicFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only Image files are allowed for profile pictures!'), false);
  }
};

// Multer Middlewares
const uploadResume = multer({ 
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadCoverLetter = multer({ 
  storage: coverLetterStorage,
  fileFilter: coverLetterFileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB limit
});

const uploadProfilePic = multer({ 
  storage: profilePicStorage,
  fileFilter: profilePicFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

module.exports = {
  cloudinary,
  uploadResume,
  uploadCoverLetter,
  uploadProfilePic
};
