require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Branch = require('./models/Branch');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@techhire.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@techhire.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created: admin@techhire.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Create branches
    const branches = [
      { name: 'Islamabad', address: 'Islamabad, Pakistan', contact: '+92-51-XXXXX' },
      { name: 'Lahore', address: 'Lahore, Pakistan', contact: '+92-42-XXXXX' },
      { name: 'Karachi', address: 'Karachi, Pakistan', contact: '+92-21-XXXXX' },
      { name: 'Remote', address: 'Remote Work', contact: 'N/A' }
    ];

    for (const branchData of branches) {
      const branchExists = await Branch.findOne({ name: branchData.name });
      if (!branchExists) {
        const branch = new Branch(branchData);
        await branch.save();
        console.log(`Branch created: ${branchData.name}`);
      } else {
        console.log(`Branch already exists: ${branchData.name}`);
      }
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();