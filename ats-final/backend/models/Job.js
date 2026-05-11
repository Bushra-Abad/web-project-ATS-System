const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String 
  },
  branch: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Branch',
    required: true
  },
  seats: { 
    type: Number, 
    default: 1 
  },
  requirements: { 
    type: [String] // Array of strings for requirements
  },
  status: { 
    type: String, 
    enum: ['active', 'closed'], 
    default: 'active' 
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Ref to HR or Admin
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
