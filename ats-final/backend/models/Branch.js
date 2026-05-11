const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { 
    type: String, 
    enum: ['Islamabad', 'Lahore', 'Karachi', 'Remote'],
    required: true 
  },
  address: { 
    type: String 
  },
  contact: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
