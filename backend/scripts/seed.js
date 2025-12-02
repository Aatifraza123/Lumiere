import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hall from '../models/Hall.model.js';
import Service from '../models/Service.model.js';
import User from '../models/User.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/festo');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Hall.deleteMany({});
    await Service.deleteMany({});

    // Seed Halls
    const halls = await Hall.insertMany([
      {
        name: 'Grand Ballroom',
        description: 'Elegant ballroom perfect for weddings and corporate events',
        location: 'Mumbai',
        capacity: 500,
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3'],
        amenities: ['Parking', 'AC', 'Sound System', 'Stage', 'Catering'],
        priceSlots: [
          { startTime: '09:00', endTime: '12:00', price: 50000 },
          { startTime: '12:00', endTime: '16:00', price: 75000 },
          { startTime: '16:00', endTime: '20:00', price: 100000 }
        ],
        servicePricing: [
          { serviceType: 'wedding', basePrice: 200000 },
          { serviceType: 'corporate', basePrice: 150000 },
          { serviceType: 'party', basePrice: 100000 }
        ],
        isFeatured: true,
        isActive: true
      },
      {
        name: 'Royal Banquet Hall',
        description: 'Luxurious banquet hall with modern amenities',
        location: 'Delhi',
        capacity: 300,
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3'],
        amenities: ['Parking', 'AC', 'Sound System', 'Stage'],
        priceSlots: [
          { startTime: '09:00', endTime: '12:00', price: 40000 },
          { startTime: '12:00', endTime: '16:00', price: 60000 },
          { startTime: '16:00', endTime: '20:00', price: 80000 }
        ],
        servicePricing: [
          { serviceType: 'wedding', basePrice: 150000 },
          { serviceType: 'corporate', basePrice: 120000 },
          { serviceType: 'party', basePrice: 80000 }
        ],
        isFeatured: true,
        isActive: true
      }
    ]);

    // Seed Services
    const services = await Service.insertMany([
      {
        title: 'Wedding Planning',
        description: 'Complete wedding planning and coordination services',
        category: 'wedding',
        price: 50000,
        features: ['Event Planning', 'Decoration', 'Catering', 'Photography'],
        isActive: true
      },
      {
        title: 'Corporate Event Management',
        description: 'Professional corporate event management services',
        category: 'corporate',
        price: 30000,
        features: ['Event Planning', 'AV Setup', 'Catering', 'Networking'],
        isActive: true
      }
    ]);

    console.log('✅ Seed data created successfully');
    console.log(`   - ${halls.length} halls created`);
    console.log(`   - ${services.length} services created`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();





