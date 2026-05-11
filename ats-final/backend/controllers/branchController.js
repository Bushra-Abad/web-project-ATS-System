const Branch = require('../models/Branch');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({});
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching branches', error: error.message });
  }
};

// @desc    Create a branch
// @route   POST /api/branches
// @access  Private (Admin)
const createBranch = async (req, res) => {
  try {
    const { name, address, contact } = req.body;

    const branch = new Branch({
      name,
      address,
      contact
    });

    const createdBranch = await branch.save();
    res.status(201).json(createdBranch);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating branch', error: error.message });
  }
};

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private (Admin)
const updateBranch = async (req, res) => {
  try {
    const { name, address, contact } = req.body;
    
    const branch = await Branch.findById(req.params.id);

    if (branch) {
      branch.name = name || branch.name;
      branch.address = address || branch.address;
      branch.contact = contact || branch.contact;

      const updatedBranch = await branch.save();
      res.json(updatedBranch);
    } else {
      res.status(404).json({ message: 'Branch not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating branch', error: error.message });
  }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private (Admin)
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (branch) {
      await branch.deleteOne();
      res.json({ message: 'Branch removed' });
    } else {
      res.status(404).json({ message: 'Branch not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting branch', error: error.message });
  }
};

module.exports = {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch
};
