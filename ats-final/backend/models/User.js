const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['candidate', 'hr', 'admin'], 
    default: 'candidate' 
  },
  phone: { 
    type: String 
  },
  address: { 
    type: String 
  },
  profilePicture: { 
    type: String // Cloudinary URL
  },
  resume: { 
    type: String // Cloudinary URL
  },
  coverLetter: { 
    type: String // Cloudinary URL
  }
}, { timestamps: true });

// Pre-save hook to hash password before saving to database
userSchema.pre('save', async function() {
  // Only hash if password has been modified
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
