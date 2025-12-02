import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hall from '../models/Hall.model.js';
import Service from '../models/Service.model.js';
import Gallery from '../models/Gallery.model.js';
import Blog from '../models/Blog.model.js';
import Booking from '../models/Booking.model.js';
import Contact from '../models/Contact.model.js';
import User from '../models/User.model.js';

// Load environment variables
dotenv.config({ path: './.env' });

// Mock Venues Data
const mockVenues = [
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'The Grand Royale',
    location: 'Mumbai, Worli',
    capacity: 500,
    description: 'An architectural masterpiece designed for grand celebrations.',
    amenities: ['Parking', 'AC', 'Stage', 'Sound System', 'Catering', 'WiFi'],
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'],
    priceSlots: [
      { startTime: '09:00', endTime: '14:00', price: 200000 },
      { startTime: '17:00', endTime: '23:00', price: 300000 }
    ],
    servicePricing: [],
    isFeatured: true,
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    name: 'Crystal Palace',
    location: 'Delhi, Connaught Place',
    capacity: 300,
    description: 'Elegant venue with crystal chandeliers and premium amenities.',
    amenities: ['Parking', 'AC', 'Stage', 'WiFi', 'Catering'],
    images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200'],
    priceSlots: [
      { startTime: '09:00', endTime: '14:00', price: 150000 },
      { startTime: '17:00', endTime: '23:00', price: 220000 }
    ],
    servicePricing: [],
    isFeatured: true,
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'Azure Gardens',
    location: 'Bangalore, Whitefield',
    capacity: 400,
    description: 'Beautiful outdoor venue surrounded by lush gardens.',
    amenities: ['Garden', 'Parking', 'AC', 'Stage', 'Photography', 'Catering'],
    images: ['https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200'],
    priceSlots: [
      { startTime: '09:00', endTime: '14:00', price: 120000 },
      { startTime: '17:00', endTime: '23:00', price: 180000 }
    ],
    servicePricing: [],
    isFeatured: false,
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Royal Heritage',
    location: 'Jaipur, Pink City',
    capacity: 600,
    description: 'Royal palace venue with traditional architecture and modern facilities.',
    amenities: ['Parking', 'AC', 'Stage', 'Sound System', 'Catering', 'WiFi', 'Photography'],
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'],
    priceSlots: [
      { startTime: '09:00', endTime: '14:00', price: 250000 },
      { startTime: '17:00', endTime: '23:00', price: 350000 }
    ],
    servicePricing: [],
    isFeatured: true,
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
    name: 'Ocean View Banquet',
    location: 'Goa, Calangute',
    capacity: 350,
    description: 'Stunning beachfront venue with panoramic ocean views.',
    amenities: ['Beach Access', 'Parking', 'AC', 'Stage', 'Catering', 'WiFi'],
    images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200'],
    priceSlots: [
      { startTime: '09:00', endTime: '14:00', price: 180000 },
      { startTime: '17:00', endTime: '23:00', price: 250000 }
    ],
    servicePricing: [],
    isFeatured: false,
    isActive: true
  }
];

// Mock Services Data
const mockServices = [
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
    title: 'Wedding Planning',
    name: 'Wedding Planning',
    description: 'Complete wedding planning service with all amenities',
    category: 'wedding',
    type: 'wedding',
    price: 50000,
    features: ['Venue Selection', 'Décor Design', 'Catering', 'Photography', 'Videography'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
    title: 'Corporate Event',
    name: 'Corporate Event',
    description: 'Professional corporate event management',
    category: 'corporate',
    type: 'corporate',
    price: 40000,
    features: ['AV Production', 'Brand Integration', 'Guest Management', 'Catering'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439023'),
    title: 'Party Planning',
    name: 'Party Planning',
    description: 'Fun and vibrant party planning',
    category: 'party',
    type: 'party',
    price: 30000,
    features: ['Theme Design', 'Entertainment', 'Custom Menus', 'Decorations'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439024'),
    title: 'Anniversary Celebration',
    name: 'Anniversary Celebration',
    description: 'Elegant anniversary celebrations',
    category: 'anniversary',
    type: 'anniversary',
    price: 35000,
    features: ['Venue Decoration', 'Catering', 'Photography', 'Entertainment'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439025'),
    title: 'Engagement Ceremony',
    name: 'Engagement Ceremony',
    description: 'Beautiful engagement ceremony planning',
    category: 'engagement',
    type: 'engagement',
    price: 25000,
    features: ['Venue Setup', 'Traditional Décor', 'Catering', 'Photography'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439026'),
    title: 'Birthday Party',
    name: 'Birthday Party',
    description: 'Memorable birthday celebrations',
    category: 'party',
    type: 'birthday',
    price: 20000,
    features: ['Theme Decoration', 'Cake', 'Entertainment', 'Catering'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439027'),
    title: 'Baby Shower',
    name: 'Baby Shower',
    description: 'Joyful baby shower celebrations',
    category: 'other',
    type: 'baby-shower',
    price: 18000,
    features: ['Theme Setup', 'Games', 'Catering', 'Photography'],
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439028'),
    title: 'Reception Party',
    name: 'Reception Party',
    description: 'Grand reception party planning',
    category: 'wedding',
    type: 'reception',
    price: 45000,
    features: ['Venue Decoration', 'Catering', 'Photography', 'Entertainment', 'Lighting'],
    isActive: true
  }
];

// Mock Gallery Data
const mockGallery = [
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
    title: 'Royal Wedding Celebration',
    description: 'A grand royal wedding with elegant decorations and traditional ceremonies',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200',
    category: 'wedding',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439032'),
    title: 'Corporate Annual Meet',
    description: 'Professional corporate event with modern setup and technology',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
    category: 'corporate',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439033'),
    title: 'Birthday Bash',
    description: 'Vibrant birthday party with colorful decorations and fun activities',
    image: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200',
    category: 'party',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439034'),
    title: 'Golden Anniversary',
    description: 'Elegant 50th anniversary celebration with golden theme',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200',
    category: 'anniversary',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439035'),
    title: 'Engagement Ceremony',
    description: 'Beautiful engagement ceremony with traditional and modern elements',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
    category: 'engagement',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439036'),
    title: 'Wedding Reception',
    description: 'Grand wedding reception with luxurious decorations',
    image: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200',
    category: 'wedding',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439037'),
    title: 'Product Launch Event',
    description: 'Corporate product launch with professional setup',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200',
    category: 'corporate',
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439038'),
    title: 'New Year Party',
    description: 'Vibrant New Year celebration with festive decorations',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
    category: 'party',
    isActive: true
  }
];

// Mock Blog Data
const mockBlogs = [
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439041'),
    title: 'The Art of Modern Wedding Planning',
    slug: 'art-of-modern-wedding',
    content: 'Discover the latest trends in luxury weddings, from sustainable decor to intimate destination ceremonies. Our expert team shares insights on creating memorable experiences that reflect your unique style and vision. Learn about the key elements that make a wedding truly special, from venue selection to personalized touches that leave lasting impressions.',
    excerpt: 'Discover the latest trends in luxury weddings, from sustainable decor to intimate destination ceremonies.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    author: 'Sarah Jenkins',
    category: 'wedding',
    tags: ['wedding', 'planning', 'luxury', 'trends'],
    isPublished: true,
    publishedAt: new Date('2025-10-24'),
    views: 0
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439042'),
    title: 'Corporate Events: Beyond the Boardroom',
    slug: 'corporate-events-guide',
    content: 'How to create engaging corporate retreats that foster real connection and team building. Explore innovative approaches to corporate event planning that go beyond traditional meetings. Discover how to design experiences that inspire collaboration, boost morale, and create meaningful connections among team members.',
    excerpt: 'How to create engaging corporate retreats that foster real connection and team building.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    author: 'Michael Chen',
    category: 'corporate',
    tags: ['corporate', 'events', 'team-building', 'business'],
    isPublished: true,
    publishedAt: new Date('2025-10-20'),
    views: 0
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439043'),
    title: 'Selecting the Perfect Venue',
    slug: 'venue-selection-tips',
    content: 'A comprehensive guide to choosing a venue that aligns with your vision and budget. Learn about the key factors to consider when selecting a venue, from location and capacity to amenities and ambiance. Get expert tips on negotiating contracts, understanding hidden costs, and ensuring your venue perfectly matches your event requirements.',
    excerpt: 'A comprehensive guide to choosing a venue that aligns with your vision and budget.',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    author: 'Emma Wilson',
    category: 'tips',
    tags: ['venue', 'planning', 'tips', 'guide'],
    isPublished: true,
    publishedAt: new Date('2025-10-15'),
    views: 0
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/festo');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed Venues
const seedVenues = async () => {
  try {
    console.log('🌱 Seeding Venues...');
    
    for (const venue of mockVenues) {
      const existingVenue = await Hall.findById(venue._id);
      
      if (existingVenue) {
        console.log(`⏭️  Venue "${venue.name}" already exists, skipping...`);
        continue;
      }

      await Hall.create(venue);
      console.log(`✅ Created venue: ${venue.name}`);
    }
    
    console.log('✅ Venues seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding venues:', error);
  }
};

// Seed Services
const seedServices = async () => {
  try {
    console.log('🌱 Seeding Services...');
    
    for (const service of mockServices) {
      const existingService = await Service.findById(service._id);
      
      if (existingService) {
        console.log(`⏭️  Service "${service.name || service.title}" already exists, skipping...`);
        continue;
      }

      await Service.create(service);
      console.log(`✅ Created service: ${service.name || service.title}`);
    }
    
    console.log('✅ Services seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  }
};

// Seed Gallery
const seedGallery = async () => {
  try {
    console.log('🌱 Seeding Gallery...');
    
    for (const item of mockGallery) {
      const existingItem = await Gallery.findById(item._id);
      
      if (existingItem) {
        console.log(`⏭️  Gallery item "${item.title}" already exists, skipping...`);
        continue;
      }

      await Gallery.create(item);
      console.log(`✅ Created gallery item: ${item.title}`);
    }
    
    console.log('✅ Gallery seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding gallery:', error);
  }
};

// Seed Blogs
const seedBlogs = async () => {
  try {
    console.log('🌱 Seeding Blogs...');
    
    for (const blog of mockBlogs) {
      const existingBlog = await Blog.findById(blog._id);
      
      if (existingBlog) {
        console.log(`⏭️  Blog "${blog.title}" already exists, skipping...`);
        continue;
      }

      await Blog.create(blog);
      console.log(`✅ Created blog: ${blog.title}`);
    }
    
    console.log('✅ Blogs seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
  }
};

// Seed Contacts
const seedContacts = async () => {
  try {
    console.log('🌱 Seeding Contacts...');
    
    const existingCount = await Contact.countDocuments();
    if (existingCount > 0) {
      console.log(`⏭️  ${existingCount} contacts already exist, skipping...`);
      return;
    }

    const mockContacts = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '+91 9876543210',
        subject: 'Wedding Planning Inquiry',
        message: 'I am interested in booking a venue for my wedding in December. Please contact me.',
        isRead: false,
        isReplied: false
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+91 9876543211',
        subject: 'Corporate Event',
        message: 'We need a venue for our annual corporate event. Can you provide details?',
        isRead: true,
        isReplied: false
      },
      {
        name: 'Amit Patel',
        email: 'amit@example.com',
        phone: '+91 9876543212',
        subject: 'Birthday Party',
        message: 'Looking for a venue for a birthday celebration for 100 guests.',
        isRead: false,
        isReplied: false
      }
    ];

    await Contact.insertMany(mockContacts);
    console.log(`✅ Created ${mockContacts.length} contact submissions`);
    console.log('✅ Contacts seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding contacts:', error);
  }
};

// Seed Bookings
const seedBookings = async () => {
  try {
    console.log('🌱 Seeding Bookings...');
    
    const existingCount = await Booking.countDocuments();
    if (existingCount > 0) {
      console.log(`⏭️  ${existingCount} bookings already exist, skipping...`);
      return;
    }

    // Get first hall and create a guest user
    const halls = await Hall.find().limit(1);
    if (halls.length === 0) {
      console.log('⏭️  No halls found, skipping bookings...');
      return;
    }

    // Create or get a guest user
    let guestUser = await User.findOne({ email: 'guest@example.com' });
    if (!guestUser) {
      guestUser = await User.create({
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '0000000000',
        password: 'Guest@123',
        role: 'user'
      });
    }

    const mockBookings = [
      {
        userId: guestUser._id,
        hallId: halls[0]._id,
        eventName: 'Wedding Celebration',
        eventType: 'wedding',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        startTime: '09:00',
        endTime: '23:00',
        guestCount: 300,
        basePrice: 200000,
        slotPrice: 300000,
        addonsTotal: 50000,
        tax: 35000,
        totalAmount: 385000,
        paidAmount: 192500,
        advancePercent: 50,
        paymentStatus: 'partial',
        status: 'confirmed'
      },
      {
        userId: guestUser._id,
        hallId: halls[0]._id,
        eventName: 'Corporate Annual Meet',
        eventType: 'corporate',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        startTime: '10:00',
        endTime: '18:00',
        guestCount: 200,
        basePrice: 150000,
        slotPrice: 150000,
        addonsTotal: 30000,
        tax: 18000,
        totalAmount: 198000,
        paidAmount: 0,
        advancePercent: 50,
        paymentStatus: 'pending',
        status: 'pending'
      }
    ];

    await Booking.insertMany(mockBookings);
    console.log(`✅ Created ${mockBookings.length} bookings`);
    console.log('✅ Bookings seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
  }
};

// Main function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🚀 Starting database seeding...\n');
    
    await seedVenues();
    console.log('');
    await seedServices();
    console.log('');
    await seedGallery();
    console.log('');
    await seedBlogs();
    console.log('');
    await seedContacts();
    console.log('');
    await seedBookings();
    
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed script
seedDatabase();

