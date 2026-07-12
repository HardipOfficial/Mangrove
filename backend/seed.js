const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB to seed admin user');

    const adminEmail = 'admin@mangrove.com';
    const adminPassword = 'adminpassword123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
      process.exit(0);
    }

    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '9876543210',
      isActive: true,
    });

    console.log('----------------------------------------------------');
    console.log('🎉 Default Admin User Seeded Successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();
