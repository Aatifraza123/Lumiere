import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.model.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/festo');
    console.log('✅ MongoDB Connected');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super-admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists:');
      console.log('   Email:', existingSuperAdmin.email);
      console.log('   Name:', existingSuperAdmin.name);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await Admin.create({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@lumiere.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123',
      phone: process.env.SUPER_ADMIN_PHONE || '9999999999',
      role: 'super-admin',
      permissions: {
        halls: { view: true, create: true, edit: true, delete: true },
        services: { view: true, create: true, edit: true, delete: true },
        bookings: { view: true, create: true, edit: true, delete: true },
        blog: { view: true, create: true, edit: true, delete: true },
        gallery: { view: true, create: true, edit: true, delete: true },
        testimonials: { view: true, create: true, edit: true, delete: true },
        contact: { view: true, reply: true, delete: true },
        subscribers: { view: true, sendNewsletter: true, delete: true },
        users: { view: true, edit: true, delete: true },
        admins: { view: true, create: true, edit: true, delete: true }
      }
    });

    console.log('✅ Super Admin created successfully!');
    console.log('');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Password:', process.env.SUPER_ADMIN_PASSWORD || 'Admin@123');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
