const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    let { name, email, password, role, phone, adminCode } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    email = String(email).toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Secure Admin Registration
    if (role === 'admin') {
      const systemAdminCode = process.env.ADMIN_REGISTRATION_CODE || 'ATS@Admin2026';
      if (!adminCode || adminCode !== systemAdminCode) {
        return res.status(401).json({ 
          message: 'Unauthorized: Invalid admin registration code' 
        });
      }
    }

    // Password hashing is handled automatically by the pre-save hook in User model
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      phone
    });

    if (user) {
      const response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id)
      };

      // Send registration confirmation email for candidates
      if (user.role === 'candidate') {
        try {
          // Import the email utility function dynamically to avoid circular dependencies
          const { sendRegistrationEmailUtil } = require('./emailController');
          await sendRegistrationEmailUtil(user.email, user.name, user._id);
        } catch (emailError) {
          console.error('Registration email failed:', emailError.message);
          // Don't fail registration if email fails
        }

        if (global.io) {
          global.io.to('admin').emit('admin-new-user', {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            createdAt: user.createdAt
          });
        }
      }

      res.status(201).json(response);
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Check for user email
    const user = await User.findOne({ email: normalizedEmail });

    // Match password using the method defined in User schema
    if (user && (await user.matchPassword(password))) {
      
      // If user is admin, they MUST provide the correct admin code to login
      if (user.role === 'admin') {
        const systemAdminCode = process.env.ADMIN_REGISTRATION_CODE || 'ATS@Admin2026';
        if (!adminCode || adminCode !== systemAdminCode) {
          return res.status(401).json({ message: 'Invalid Admin Secret Code. Admin access denied.' });
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    console.log('getProfile called, req.user:', req.user);
    console.log('req.user._id:', req.user._id);
    
    // req.user is populated by the protect middleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const updateFields = {};
    ['name', 'phone', 'address', 'profilePicture', 'resume', 'coverLetter'].forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (updatedUser) {
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profilePicture: updatedUser.profilePicture,
        resume: updatedUser.resume,
        coverLetter: updatedUser.coverLetter,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
