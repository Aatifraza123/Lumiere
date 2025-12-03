import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Hall from '../models/Hall.model.js';
import Service from '../models/Service.model.js';
import Booking from '../models/Booking.model.js';
import Blog from '../models/Blog.model.js';
import Contact from '../models/Contact.model.js';
import Subscribe from '../models/Subscribe.model.js';
import Gallery from '../models/Gallery.model.js';
import Testimonial from '../models/Testimonial.model.js';
import User from '../models/User.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { generateToken } from '../utils/generateToken.js';
import { upload } from '../utils/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ========== ADMIN LOGIN (Public Route - Before Protection) ==========
router.post('/login', async (req, res, next) => {
  try {
    const { password } = req.body;

    // Get admin password from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminEmail = process.env.ADMIN_EMAIL || 'razaaatif658@gmail.com';

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Find or create admin user
    let adminUser = await User.findOne({ email: adminEmail, role: 'admin' });
    
    if (!adminUser) {
      // Create admin user if doesn't exist
      adminUser = await User.create({
        name: 'Administrator',
        email: adminEmail,
        phone: '0000000000',
        password: adminPassword, // Will be hashed by pre-save hook
        role: 'admin'
      });
    }

    // Verify password
    const isPasswordValid = await adminUser.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate JWT token
    const token = generateToken(adminUser._id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Apply admin protection to all routes below this line
router.use(protect);
router.use(authorize('admin', 'manager'));

// ========== DASHBOARD ==========
router.get('/dashboard', async (req, res, next) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected');
      return res.status(503).json({
        success: false,
        message: 'Database connection not available',
        data: {
          halls: { total: 0 },
          services: { total: 0 },
          bookings: { total: 0, pending: 0 },
          blogs: { total: 0, published: 0 },
          contacts: { total: 0, unread: 0 }
        }
      });
    }

    const totalHalls = await Hall.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ isPublished: true });
    const totalContacts = await Contact.countDocuments();
    const unreadContacts = await Contact.countDocuments({ isRead: false });

    console.log('📊 Dashboard Stats:', {
      halls: totalHalls,
      services: totalServices,
      bookings: totalBookings,
      blogs: totalBlogs,
      contacts: totalContacts
    });

    res.json({
      success: true,
      data: {
        halls: { total: totalHalls },
        services: { total: totalServices },
        bookings: { total: totalBookings, pending: pendingBookings },
        blogs: { total: totalBlogs, published: publishedBlogs },
        contacts: { total: totalContacts, unread: unreadContacts }
      }
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    next(error);
  }
});

// ========== HALLS ==========
router.get('/halls', async (req, res, next) => {
  try {
    const halls = await Hall.find().sort({ createdAt: -1 });
    
    // Ensure all halls have a rating field (for backward compatibility)
    const hallsWithRating = halls.map(hall => {
      const hallObj = hall.toObject ? hall.toObject() : hall;
      if (!hallObj.rating) {
        hallObj.rating = 5; // Default rating for existing halls
      }
      return hallObj;
    });
    
    res.json({ success: true, count: hallsWithRating.length, data: hallsWithRating });
  } catch (error) {
    console.error('Error fetching halls:', error);
    next(error);
  }
});

router.get('/halls/:id', async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }
    res.json({ success: true, data: hall });
  } catch (error) {
    next(error);
  }
});

router.post('/halls', upload.array('images', 10), async (req, res, next) => {
  try {
    console.log('📥 POST /admin/halls - Request received');
    console.log('📦 Body:', req.body);
    console.log('📁 Files:', req.files ? req.files.length : 0);
    
    const { name, description, location, capacity, basePrice, rating, amenities, priceSlots, servicePricing, isFeatured, isActive, imageUrls } = req.body;

    // Validation
    if (!name || !name.trim()) {
      console.log('❌ Validation failed: Venue name is required');
      return res.status(400).json({ success: false, message: 'Venue name is required' });
    }
    if (!description || !description.trim()) {
      console.log('❌ Validation failed: Description is required');
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (!location || !location.trim()) {
      console.log('❌ Validation failed: Location is required');
      return res.status(400).json({ success: false, message: 'Location is required' });
    }
    
    // Validate capacity
    const capacityNum = parseInt(capacity);
    if (!capacity || isNaN(capacityNum) || capacityNum < 1) {
      console.log('❌ Validation failed: Invalid capacity', { capacity, capacityNum });
      return res.status(400).json({ success: false, message: 'Valid capacity (minimum 1) is required' });
    }

    // Combine uploaded files and URLs
    const uploadedImages = req.files ? req.files.map(file => {
      if (file.secure_url) return file.secure_url;
      if (file.path) {
        // If local file, construct full URL
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        return `${baseUrl}${file.path}`;
      }
      return `/uploads/${file.filename}`;
    }) : [];
    
    let urlImages = [];
    if (imageUrls) {
      try {
        urlImages = Array.isArray(imageUrls) ? imageUrls : JSON.parse(imageUrls);
      } catch (e) {
        console.log('⚠️ Failed to parse imageUrls:', e.message);
        urlImages = [];
      }
    }
    const images = [...uploadedImages, ...urlImages];

    // Parse amenities, priceSlots, servicePricing safely
    let parsedAmenities = [];
    try {
      parsedAmenities = Array.isArray(amenities) ? amenities : (amenities ? JSON.parse(amenities) : []);
    } catch (e) {
      console.log('⚠️ Failed to parse amenities:', e.message);
      parsedAmenities = [];
    }

    let parsedPriceSlots = [];
    try {
      parsedPriceSlots = priceSlots ? JSON.parse(priceSlots) : [];
    } catch (e) {
      console.log('⚠️ Failed to parse priceSlots:', e.message);
      parsedPriceSlots = [];
    }

    let parsedServicePricing = [];
    try {
      parsedServicePricing = servicePricing ? JSON.parse(servicePricing) : [];
    } catch (e) {
      console.log('⚠️ Failed to parse servicePricing:', e.message);
      parsedServicePricing = [];
    }

    // Generate slug from name (will be auto-generated by pre-save hook, but ensure it's not null)
    const generateSlug = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };
    
    const hallData = {
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      capacity: capacityNum,
      basePrice: basePrice ? parseFloat(basePrice) || 0 : 0,
      rating: (rating !== undefined && rating !== null && rating !== '') 
        ? Math.min(Math.max(parseFloat(rating) || 5, 0), 5) 
        : 5, // Clamp between 0 and 5, default to 5
      images,
      amenities: parsedAmenities,
      priceSlots: parsedPriceSlots,
      servicePricing: parsedServicePricing,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: isActive !== 'false' && isActive !== false
      // Note: slug will be auto-generated by pre-save hook in Hall model
    };

    console.log('💾 Creating hall with data:', JSON.stringify(hallData, null, 2));
    
    // Validate data before creating
    if (!hallData.name || !hallData.name.trim()) {
      return res.status(400).json({ success: false, message: 'Venue name is required' });
    }
    if (!hallData.description || !hallData.description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (!hallData.location || !hallData.location.trim()) {
      return res.status(400).json({ success: false, message: 'Location is required' });
    }
    if (!hallData.capacity || hallData.capacity < 1) {
      return res.status(400).json({ success: false, message: 'Valid capacity (minimum 1) is required' });
    }
    
    // Check if venue with same name already exists
    const existingHall = await Hall.findOne({ name: hallData.name.trim() });
    if (existingHall) {
      console.log('❌ Duplicate venue name found:', hallData.name);
      return res.status(400).json({ 
        success: false, 
        message: `A venue with the name "${hallData.name}" already exists. Please use a different name.` 
      });
    }
    
    // Ensure slug is not explicitly set to "null" - let pre-save hook handle it
    // Remove any slug field if it's null/empty to let the pre-save hook generate it
    if (hallData.slug === 'null' || hallData.slug === null || !hallData.slug) {
      delete hallData.slug;
    }
    
    const hall = await Hall.create(hallData);

    console.log('✅ Hall created successfully:', hall._id);
    res.status(201).json({ success: true, data: hall });
  } catch (error) {
    console.error('❌ Error creating hall:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack
    });
    
    // If it's a validation error, return it directly
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(e => e.message);
      const messages = errorMessages.join(', ');
      console.log('❌ Validation errors:', messages);
      return res.status(400).json({ 
        success: false, 
        message: messages || 'Validation failed',
        errors: error.errors 
      });
    }
    
    // If it's a duplicate key error
    if (error.code === 11000) {
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'name';
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : '';
      return res.status(400).json({ 
        success: false, 
        message: `A venue with the ${duplicateField} "${duplicateValue}" already exists. Please use a different ${duplicateField}.` 
      });
    }
    
    // Generic error
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create venue',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/halls/:id', upload.array('images', 10), async (req, res, next) => {
  try {
    const { name, description, location, capacity, basePrice, rating, amenities, priceSlots, servicePricing, isFeatured, isActive, imageUrls } = req.body;

    const updateData = {};
    
    // Validate and set name
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Venue name cannot be empty' });
      }
      updateData.name = name.trim();
    }
    
    // Validate and set description
    if (description !== undefined) {
      if (!description || !description.trim()) {
        return res.status(400).json({ success: false, message: 'Description cannot be empty' });
      }
      updateData.description = description.trim();
    }
    
    // Validate and set location
    if (location !== undefined) {
      if (!location || !location.trim()) {
        return res.status(400).json({ success: false, message: 'Location cannot be empty' });
      }
      updateData.location = location.trim();
    }
    
    // Validate and set capacity
    if (capacity !== undefined) {
      const capacityNum = parseInt(capacity);
      if (isNaN(capacityNum) || capacityNum < 1) {
        return res.status(400).json({ success: false, message: 'Valid capacity (minimum 1) is required' });
      }
      updateData.capacity = capacityNum;
    }
    
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice) || 0;
    if (rating !== undefined && rating !== null && rating !== '') {
      const ratingValue = parseFloat(rating);
      if (!isNaN(ratingValue)) {
        updateData.rating = Math.min(Math.max(ratingValue, 0), 5); // Clamp between 0 and 5
      }
    }
    
    // Safe parsing for arrays
    if (amenities !== undefined) {
      try {
        updateData.amenities = Array.isArray(amenities) ? amenities : JSON.parse(amenities);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid amenities format' });
      }
    }
    
    if (priceSlots !== undefined) {
      try {
        updateData.priceSlots = JSON.parse(priceSlots);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid priceSlots format' });
      }
    }
    
    if (servicePricing !== undefined) {
      try {
        updateData.servicePricing = JSON.parse(servicePricing);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid servicePricing format' });
      }
    }
    
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true';
    if (isActive !== undefined) updateData.isActive = isActive !== 'false';
    
    // Handle images: combine uploaded files and URLs
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path || file.secure_url || `/uploads/${file.filename}`);
      try {
        const urlImages = imageUrls ? (Array.isArray(imageUrls) ? imageUrls : JSON.parse(imageUrls)) : [];
        updateData.images = [...uploadedImages, ...urlImages];
      } catch (e) {
        updateData.images = uploadedImages;
      }
    } else if (imageUrls) {
      // If only URLs provided (no new files)
      try {
        const urlImages = Array.isArray(imageUrls) ? imageUrls : JSON.parse(imageUrls);
        updateData.images = urlImages;
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid imageUrls format' });
      }
    }

    // If name is being updated, check for duplicates (excluding current venue)
    if (updateData.name) {
      const existingHall = await Hall.findOne({ 
        name: updateData.name.trim(),
        _id: { $ne: req.params.id }
      });
      if (existingHall) {
        return res.status(400).json({ 
          success: false, 
          message: `A venue with the name "${updateData.name}" already exists. Please use a different name.` 
        });
      }
    }

    const hall = await Hall.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    res.json({ success: true, data: hall });
  } catch (error) {
    console.error('Error updating hall:', error);
    // If it's a validation error, return it directly
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    next(error);
  }
});

// Fix all null slugs (one-time migration endpoint)
router.post('/halls/fix-slugs', async (req, res, next) => {
  try {
    
    // Find all halls with null, empty, or "null" string slugs
    const hallsWithBadSlugs = await Hall.find({
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' },
        { slug: 'null' }
      ]
    });

    console.log(`🔧 Found ${hallsWithBadSlugs.length} halls with invalid slugs`);

    const generateSlug = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    let fixed = 0;
    let errors = 0;

    for (const hall of hallsWithBadSlugs) {
      try {
        if (!hall.name) {
          console.log(`⚠️  Skipping hall ${hall._id} - no name`);
          continue;
        }

        let baseSlug = generateSlug(hall.name) || `venue-${hall._id}`;
        let slug = baseSlug;
        let counter = 1;
        let existingHall = await Hall.findOne({ 
          slug: slug, 
          _id: { $ne: hall._id } 
        });

        while (existingHall) {
          slug = `${baseSlug}-${counter}`;
          existingHall = await Hall.findOne({ 
            slug: slug, 
            _id: { $ne: hall._id } 
          });
          counter++;
          if (counter > 1000) {
            slug = `${baseSlug}-${Date.now()}`;
            break;
          }
        }

        hall.slug = slug;
        await hall.save();

        console.log(`✅ Fixed hall "${hall.name}" -> slug: "${slug}"`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fixing hall ${hall._id}:`, error.message);
        errors++;
      }
    }

    res.json({ 
      success: true, 
      message: `Fixed ${fixed} halls, ${errors} errors`,
      fixed,
      errors
    });
  } catch (error) {
    console.error('❌ Error fixing slugs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fix slugs',
      error: error.message 
    });
  }
});

router.delete('/halls/:id', async (req, res, next) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }
    res.json({ success: true, message: 'Hall deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ========== SERVICES ==========
router.get('/services', async (req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
});

router.get('/services/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
});

router.post('/services', upload.single('image'), async (req, res, next) => {
  try {
    console.log('📝 POST /admin/services - Request received');
    console.log('📝 Body:', req.body);
    console.log('📝 File:', req.file ? 'File uploaded' : 'No file');
    
    const { title, name, description, category, type, price, features, isActive, image } = req.body;

    // Validate required fields
    if (!title && !name) {
      console.log('❌ Validation failed: Service name or title is required');
      return res.status(400).json({
        success: false,
        message: 'Service name or title is required'
      });
    }

    if (!description || !description.trim()) {
      console.log('❌ Validation failed: Description is required');
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    // Use name if title is not provided, or title if name is not provided
    const serviceName = (title || name || '').trim();
    const serviceCategory = (category || type || 'other').trim();

    // Handle image: uploaded file or URL
    let imageUrl = undefined;
    if (req.file) {
      // If file uploaded, use Cloudinary URL or construct full URL for local storage
      if (req.file.secure_url) {
        imageUrl = req.file.secure_url;
      } else {
        // Local file - construct full URL
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        imageUrl = `${baseUrl}${req.file.path}`;
      }
      console.log('📸 Image file uploaded:', imageUrl);
    } else if (image && typeof image === 'string' && image.trim()) {
      // If image URL provided directly
      imageUrl = image.trim();
      console.log('📸 Image URL provided:', imageUrl);
    }

    // Parse features if it's a string
    let featuresArray = [];
    if (features) {
      if (Array.isArray(features)) {
        featuresArray = features;
      } else if (typeof features === 'string') {
        try {
          featuresArray = JSON.parse(features);
        } catch (e) {
          // If not valid JSON, treat as comma-separated string
          featuresArray = features.split(',').map(f => f.trim()).filter(f => f);
        }
      }
    }

    const serviceData = {
      title: serviceName,
      name: serviceName, // Also set name for compatibility
      description: description.trim(),
      category: serviceCategory,
      price: parseFloat(price) || 0,
      image: imageUrl,
      features: featuresArray,
      isActive: isActive !== 'false' && isActive !== false
      // Note: slug will be auto-generated by pre-save hook in Service model
    };

    // Ensure slug is not explicitly set to "null" - let pre-save hook handle it
    // Remove any slug field if it's null/empty to let the pre-save hook generate it
    if (serviceData.slug === 'null' || serviceData.slug === null || !serviceData.slug) {
      delete serviceData.slug;
    }

    console.log('💾 Creating service with data:', JSON.stringify(serviceData, null, 2));

    // Check if service with same name/title already exists
    const existingService = await Service.findOne({ 
      $or: [
        { title: serviceData.title },
        { name: serviceData.name }
      ]
    });
    if (existingService) {
      console.log('❌ Duplicate service name found:', serviceData.title);
      return res.status(400).json({ 
        success: false, 
        message: `A service with the name "${serviceData.title}" already exists. Please use a different name.` 
      });
    }

    const service = await Service.create(serviceData);

    console.log('✅ Service created successfully:', service._id);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error('❌ Error creating service:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    // If it's a validation error, return it directly
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages, errors: error.errors });
    }
    
    // If it's a duplicate key error
    if (error.code === 11000) {
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'name';
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : '';
      return res.status(400).json({ 
        success: false, 
        message: `A service with the ${duplicateField} "${duplicateValue}" already exists. Please use a different ${duplicateField}.` 
      });
    }
    
    // Generic error
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/services/:id', upload.single('image'), async (req, res, next) => {
  try {
    console.log('📝 PUT /admin/services/:id - Request received');
    console.log('📝 ID:', req.params.id);
    console.log('📝 Body:', req.body);
    console.log('📝 File:', req.file ? 'File uploaded' : 'No file');
    
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid service ID format' });
    }
    
    const { title, name, description, category, type, price, features, isActive, image } = req.body;

    const updateData = {};
    const serviceName = (title || name)?.trim();
    if (serviceName) {
      updateData.title = serviceName;
      updateData.name = serviceName; // Also update name for compatibility
      
      // Check if another service with same name exists (excluding current service)
      const existingService = await Service.findOne({ 
        $or: [
          { title: serviceName },
          { name: serviceName }
        ],
        _id: { $ne: req.params.id }
      });
      if (existingService) {
        return res.status(400).json({ 
          success: false, 
          message: `A service with the name "${serviceName}" already exists. Please use a different name.` 
        });
      }
    }
    if (description !== undefined) {
      updateData.description = description.trim();
    }
    if (category || type) {
      updateData.category = (category || type).trim();
    }
    if (price !== undefined) {
      updateData.price = parseFloat(price) || 0;
    }
    
    // Parse features
    if (features !== undefined) {
      if (Array.isArray(features)) {
        updateData.features = features;
      } else if (typeof features === 'string') {
        try {
          updateData.features = JSON.parse(features);
        } catch (e) {
          updateData.features = features.split(',').map(f => f.trim()).filter(f => f);
        }
      }
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive !== 'false' && isActive !== false;
    }
    
    // Handle image: prioritize uploaded file, then use provided URL
    if (req.file) {
      // If file uploaded, use Cloudinary URL or construct full URL for local storage
      if (req.file.secure_url) {
        updateData.image = req.file.secure_url;
      } else {
        // Local file - construct full URL
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        updateData.image = `${baseUrl}${req.file.path}`;
      }
      console.log('📸 Image file uploaded:', updateData.image);
    } else if (image !== undefined) {
      if (typeof image === 'string' && image.trim()) {
        updateData.image = image.trim();
        console.log('📸 Image URL provided:', updateData.image);
      } else if (!image) {
        updateData.image = '';
      }
    }

    // Ensure slug is not explicitly set to "null" - let pre-save hook handle it
    if (updateData.slug === 'null' || updateData.slug === null || updateData.slug === '') {
      delete updateData.slug;
    }

    console.log('💾 Updating service with data:', JSON.stringify(updateData, null, 2));

    const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    console.log('✅ Service updated successfully:', service._id);
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('❌ Error updating service:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // If it's a validation error, return it directly
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages, errors: error.errors });
    }
    
    // If it's a duplicate key error
    if (error.code === 11000) {
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'name';
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : '';
      return res.status(400).json({ 
        success: false, 
        message: `A service with the ${duplicateField} "${duplicateValue}" already exists. Please use a different ${duplicateField}.` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Fix all null slugs for services (one-time migration endpoint)
router.post('/services/fix-slugs', async (req, res, next) => {
  try {
    // Find all services with null, empty, or "null" string slugs
    const servicesWithBadSlugs = await Service.find({
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' },
        { slug: 'null' }
      ]
    });

    console.log(`🔧 Found ${servicesWithBadSlugs.length} services with invalid slugs`);

    const generateSlug = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    let fixed = 0;
    let errors = 0;

    for (const service of servicesWithBadSlugs) {
      try {
        const serviceName = service.title || service.name;
        if (!serviceName) {
          console.log(`⚠️  Skipping service ${service._id} - no name/title`);
          continue;
        }

        let baseSlug = generateSlug(serviceName) || `service-${service._id}`;
        let slug = baseSlug;
        let counter = 1;
        let existingService = await Service.findOne({ 
          slug: slug, 
          _id: { $ne: service._id } 
        });

        while (existingService) {
          slug = `${baseSlug}-${counter}`;
          existingService = await Service.findOne({ 
            slug: slug, 
            _id: { $ne: service._id } 
          });
          counter++;
          if (counter > 1000) {
            slug = `${baseSlug}-${Date.now()}`;
            break;
          }
        }

        service.slug = slug;
        await service.save();

        console.log(`✅ Fixed service "${serviceName}" -> slug: "${slug}"`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fixing service ${service._id}:`, error.message);
        errors++;
      }
    }

    // Also fix any services that have duplicate "null" slugs
    const nullSlugServices = await Service.find({ slug: 'null' });
    if (nullSlugServices.length > 1) {
      console.log(`\n🔧 Fixing ${nullSlugServices.length} services with duplicate "null" slugs...`);
      
      for (let i = 0; i < nullSlugServices.length; i++) {
        const service = nullSlugServices[i];
        try {
          const serviceName = service.title || service.name;
          let baseSlug = generateSlug(serviceName) || `service-${service._id}`;
          let slug = i === 0 ? baseSlug : `${baseSlug}-${i}`;
          
          // Ensure uniqueness
          let counter = 1;
          let existingService = await Service.findOne({ 
            slug: slug, 
            _id: { $ne: service._id } 
          });
          
          while (existingService) {
            slug = `${baseSlug}-${counter}`;
            existingService = await Service.findOne({ 
              slug: slug, 
              _id: { $ne: service._id } 
            });
            counter++;
          }

          service.slug = slug;
          await service.save();
          
          console.log(`✅ Fixed duplicate null slug for "${serviceName}" -> "${slug}"`);
          fixed++;
        } catch (error) {
          console.error(`❌ Error fixing duplicate null slug for ${service._id}:`, error.message);
          errors++;
        }
      }
    }

    res.json({ 
      success: true, 
      message: `Fixed ${fixed} services, ${errors} errors`,
      fixed,
      errors
    });
  } catch (error) {
    console.error('❌ Error fixing service slugs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fix service slugs',
      error: error.message 
    });
  }
});

router.delete('/services/:id', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ========== BOOKINGS ==========
router.get('/bookings', async (req, res, next) => {
  try {
    console.log('📥 GET /admin/bookings - Request received');
    console.log('📥 Query params:', req.query);
    
    const { status, paymentStatus } = req.query;
    const query = {};

    // Only add filters if they are provided and not empty
    if (status && status.trim() !== '') {
      query.status = status.trim();
    }
    if (paymentStatus && paymentStatus.trim() !== '') {
      query.paymentStatus = paymentStatus.trim();
    }

    console.log('🔍 MongoDB Query:', JSON.stringify(query, null, 2));

    // Fetch all bookings with populated fields
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('hallId', 'name location images')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    console.log('✅ Found bookings:', bookings.length);
    console.log('📦 Sample booking:', bookings.length > 0 ? {
      _id: bookings[0]._id,
      eventName: bookings[0].eventName,
      customerName: bookings[0].customerName,
      hallId: bookings[0].hallId?.name,
      userId: bookings[0].userId?.name
    } : 'No bookings found');

    res.json({ 
      success: true, 
      count: bookings.length, 
      data: bookings 
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/bookings/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('hallId', 'name location images');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

router.put('/bookings/:id', async (req, res, next) => {
  try {
    const { status, paymentStatus, notes } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus, notes },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings/:id/invoice', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!booking.invoiceNumber) {
      return res.status(404).json({ success: false, message: 'Invoice not found for this booking' });
    }
    
    const filename = `invoice-${booking.invoiceNumber}.pdf`;
    const filepath = path.join(__dirname, '../temp', filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, message: 'Invoice file not found. Please regenerate the invoice.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    next(error);
  }
});

// ========== BLOG ==========
router.get('/blog', async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    next(error);
  }
});

router.get('/blog/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
});

router.post('/blog', upload.single('image'), async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, isPublished, author, image } = req.body;

    // Parse author data
    let authorData = { name: 'Admin', title: '', bio: '' };
    if (author) {
      if (typeof author === 'string') {
        try {
          authorData = JSON.parse(author);
        } catch (e) {
          // If parsing fails, treat as name string
          authorData = { name: author, title: '', bio: '' };
        }
      } else if (typeof author === 'object') {
        authorData = author;
      }
    }

    // Handle image: prioritize uploaded file, then use provided URL
    let imageUrl = undefined;
    if (req.file) {
      // File uploaded - use Cloudinary URL or construct full URL for local storage
      if (req.file.secure_url) {
        // Cloudinary URL
        imageUrl = req.file.secure_url;
      } else {
        // Local file - construct full URL
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        imageUrl = `${baseUrl}${req.file.path}`;
      }
      console.log('📸 Image file uploaded:', imageUrl);
    } else if (image && image.trim()) {
      // Image URL provided
      imageUrl = image.trim();
      console.log('📸 Image URL provided:', imageUrl);
    }

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : tags ? JSON.parse(tags) : [],
      image: imageUrl,
      author: authorData,
      isPublished: isPublished === 'true',
      publishedAt: isPublished === 'true' ? new Date() : undefined
    });

    console.log('✅ Blog created with image:', blog.image);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('❌ Error creating blog:', error);
    next(error);
  }
});

router.put('/blog/:id', upload.single('image'), async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, isPublished, author, image } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (category) updateData.category = category;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    
    // Handle author data
    if (author) {
      if (typeof author === 'string') {
        try {
          updateData.author = JSON.parse(author);
        } catch (e) {
          // If parsing fails, treat as name string
          updateData.author = { name: author, title: '', bio: '' };
        }
      } else if (typeof author === 'object') {
        updateData.author = author;
      }
    }
    
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished === 'true';
      if (isPublished === 'true' && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    
    // Handle image: prioritize uploaded file, then use provided URL
    if (req.file) {
      // File uploaded - use Cloudinary URL or construct full URL for local storage
      if (req.file.secure_url) {
        // Cloudinary URL
        updateData.image = req.file.secure_url;
      } else {
        // Local file - construct full URL
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        updateData.image = `${baseUrl}${req.file.path}`;
      }
      console.log('📸 Image file uploaded:', updateData.image);
    } else if (image !== undefined) {
      if (typeof image === 'string' && image.trim()) {
        updateData.image = image.trim();
        console.log('📸 Image URL provided:', updateData.image);
      } else if (!image) {
        updateData.image = '';
      }
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    console.log('✅ Blog updated with image:', blog.image);
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('❌ Error updating blog:', error);
    next(error);
  }
});

router.delete('/blog/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ========== CONTACT ==========
router.get('/contact', async (req, res, next) => {
  try {
    const { isRead, isReplied } = req.query;
    const query = {};

    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isReplied !== undefined) query.isReplied = isReplied === 'true';

    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    next(error);
  }
});

router.get('/contact/:id', async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact submission not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
});

router.put('/contact/:id', async (req, res, next) => {
  try {
    const { isRead, isReplied, notes } = req.body;
    const updateData = {};

    if (isRead !== undefined) updateData.isRead = isRead === 'true';
    if (isReplied !== undefined) updateData.isReplied = isReplied === 'true';
    if (notes) updateData.notes = notes;

    const contact = await Contact.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact submission not found' });
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
});

router.delete('/contact/:id', async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact submission not found' });
    }
    res.json({ success: true, message: 'Contact submission deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ========== SUBSCRIBE ==========
router.get('/subscribe', async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const subscriptions = await Subscribe.find(query).sort({ subscribedAt: -1 });
    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    next(error);
  }
});

router.delete('/subscribe/:id', async (req, res, next) => {
  try {
    const subscription = await Subscribe.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.json({ success: true, message: 'Subscription deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ========== GALLERY ==========
router.get('/gallery', async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const gallery = await Gallery.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: gallery.length, data: gallery });
  } catch (error) {
    next(error);
  }
});

router.get('/gallery/:id', async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

router.post('/gallery', upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, category, isActive } = req.body;

    const galleryItem = await Gallery.create({
      title,
      description,
      image: req.file ? req.file.path : req.body.image || '',
      category: category || 'other',
      isActive: isActive !== 'false'
    });

    res.status(201).json({ success: true, data: galleryItem });
  } catch (error) {
    next(error);
  }
});

router.put('/gallery/:id', upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, category, isActive } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive === 'true';
    if (req.file) updateData.image = req.file.path;
    if (req.body.image && !req.file) updateData.image = req.body.image;

    const galleryItem = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!galleryItem) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    res.json({ success: true, data: galleryItem });
  } catch (error) {
    next(error);
  }
});

router.delete('/gallery/:id', async (req, res, next) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ========== TESTIMONIALS ROUTES ==========
router.get('/testimonials', async (req, res, next) => {
  try {
    console.log('📖 GET /admin/testimonials - Fetching testimonials');
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected');
      return res.status(503).json({
        success: false,
        message: 'Database connection not available',
        data: []
      });
    }
    
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${testimonials.length} testimonials`);
    
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    console.error('❌ Error fetching testimonials:', error);
    next(error);
  }
});

router.get('/testimonials/:id', async (req, res, next) => {
  try {
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid testimonial ID format' });
    }
    
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
});

router.post('/testimonials', upload.single('image'), async (req, res, next) => {
  try {
    console.log('📝 POST /admin/testimonials - Request received');
    console.log('📝 Body:', req.body);
    console.log('📝 File:', req.file ? 'File uploaded' : 'No file');
    
    const { name, email, rating, message, eventType, isApproved, isActive, image } = req.body;

    // Validate required fields
    if (!name || !message) {
      console.error('❌ Validation failed: Name or message missing');
      return res.status(400).json({
        success: false,
        message: 'Name and message are required fields'
      });
    }

    // Determine image source: uploaded file takes priority, then URL from body
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path;
      console.log('📸 Image file uploaded:', imageUrl);
    } else if (image && typeof image === 'string' && image.trim()) {
      imageUrl = image.trim();
      console.log('📸 Image URL provided:', imageUrl);
    }

    const testimonialData = {
      name: name.trim(),
      email: email ? email.trim() : '',
      rating: parseInt(rating) || 5,
      message: message.trim(),
      eventType: eventType || 'other',
      image: imageUrl,
      isApproved: isApproved === 'true' || isApproved === true,
      isActive: isActive !== 'false' && isActive !== false
    };

    console.log('💾 Creating testimonial with data:', testimonialData);

    const testimonial = await Testimonial.create(testimonialData);

    console.log('✅ Testimonial created successfully:', testimonial._id);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    console.error('❌ Error creating testimonial:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    next(error);
  }
});

router.put('/testimonials/:id', upload.single('image'), async (req, res, next) => {
  try {
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid testimonial ID format' });
    }
    
    const { name, email, rating, message, eventType, isApproved, isActive, image } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email ? email.trim() : '';
    if (rating) updateData.rating = parseInt(rating);
    if (message) updateData.message = message.trim();
    if (eventType) updateData.eventType = eventType;
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved === 'true' || isApproved === true;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive !== 'false' && isActive !== false;
    }
    
    // Handle image: uploaded file takes priority, then URL from body
    if (req.file) {
      updateData.image = req.file.path;
    } else if (image !== undefined) {
      if (typeof image === 'string' && image.trim()) {
        updateData.image = image.trim();
      } else if (!image) {
        updateData.image = '';
      }
    }

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    next(error);
  }
});

router.delete('/testimonials/:id', async (req, res, next) => {
  try {
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid testimonial ID format' });
    }
    
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;


