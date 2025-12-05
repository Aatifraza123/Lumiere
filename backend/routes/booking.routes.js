import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.model.js';
import Hall from '../models/Hall.model.js';
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.middleware.js';
import { body, validationResult } from 'express-validator';
import { sendBookingConfirmation, sendAdminBookingNotification } from '../utils/email.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking (works for both authenticated and guest users)
// @access  Public (with optional auth)
router.post('/', [
  body('hallId').notEmpty().withMessage('Hall ID is required'),
  body('eventName').notEmpty().withMessage('Event name is required'),
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('startTime').optional().notEmpty().withMessage('Start time must not be empty if provided'),
  body('endTime').optional().notEmpty().withMessage('End time must not be empty if provided'),
  body('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid customer email is required'),
  body('customerMobile').notEmpty().withMessage('Customer mobile is required')
], async (req, res, next) => {
  try {
    console.log('📥 POST /api/bookings - Request received');
    console.log('Request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { 
      hallId, 
      eventName, 
      eventType, 
      date, 
      startTime, 
      endTime, 
      guestCount, 
      addons, 
      advancePercent, 
      totalAmount,
      customerName,
      customerEmail,
      customerMobile
    } = req.body;

    // Validate customer email is not the admin email
    const adminEmail = process.env.ADMIN_EMAIL || 'razaaatif658@gmail.com';
    if (customerEmail && customerEmail.trim().toLowerCase() === adminEmail.toLowerCase()) {
      console.error('❌ Validation failed: Customer email cannot be the same as admin email');
      return res.status(400).json({ 
        success: false, 
        message: 'Customer email cannot be the same as admin email. Please use a different email address.' 
      });
    }

    // IMPORTANT: Always create/find guest user based on customerEmail
    // This ensures bookings are associated with the customer, not the admin making the booking
    let userId = null;
    let guestUser = await User.findOne({ email: customerEmail });
    
    if (!guestUser) {
      // Create guest user with customer details
      try {
        guestUser = await User.create({
          name: customerName,
          email: customerEmail,
          phone: customerMobile,
          password: 'guest_' + Date.now() + Math.random().toString(36).substr(2, 9),
          role: 'user'
        });
        console.log('✅ Created guest user for booking:', {
          name: customerName,
          email: customerEmail,
          phone: customerMobile
        });
      } catch (createError) {
        // If user was created between findOne and create, find again
        if (createError.code === 11000) {
          guestUser = await User.findOne({ email: customerEmail });
          console.log('✅ Found existing guest user:', guestUser.email);
        } else {
          throw createError;
        }
      }
    } else {
      console.log('✅ Using existing guest user:', guestUser.email);
    }
    
    userId = guestUser._id;

    // Validate hallId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hallId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid hall ID format. Please select a valid venue.' 
      });
    }

    // Check if hall exists
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    // Check availability - ensure date is properly formatted
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check availability - simplified since we removed time slot selection
    // Just check if there are any bookings on the same date for this hall
    const conflictingBookings = await Booking.find({
      hallId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Optional: Check if date is already booked (can be removed if multiple bookings per day are allowed)
    // if (conflictingBookings.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'This date is already booked for this hall. Please choose another date.'
    //   });
    // }

    // Use prices from request if provided (from frontend calculation)
    // Otherwise calculate from venue's servicePricing
    let basePrice = req.body.basePrice;
    let slotPrice = req.body.slotPrice || 0;
    let addonsTotal = req.body.addonsTotal || 0;
    let tax = req.body.tax;
    let finalTotalAmount = totalAmount;

    console.log('💰 Price calculation - Request data:', {
      basePrice: req.body.basePrice,
      slotPrice: req.body.slotPrice,
      addonsTotal: req.body.addonsTotal,
      tax: req.body.tax,
      totalAmount: req.body.totalAmount
    });

    // If basePrice not provided, calculate from venue's servicePricing
    if (!basePrice || basePrice === 0) {
      console.log('💰 Base price not provided, calculating from venue servicePricing');
      console.log('💰 Event type:', eventType);
      console.log('💰 Hall servicePricing:', hall.servicePricing);
      
      if (hall.servicePricing && hall.servicePricing.length > 0) {
        // Try to find matching service pricing
        let servicePricing = hall.servicePricing.find(
          sp => sp.serviceType === eventType
        );
        
        if (!servicePricing) {
          console.warn('⚠️ Service pricing not found for eventType:', eventType);
          console.warn('⚠️ Available service types:', hall.servicePricing.map(sp => sp.serviceType));
        }
        
        basePrice = servicePricing?.basePrice || hall.basePrice || 0;
        console.log('💰 Found service pricing:', servicePricing, 'Base price:', basePrice);
      } else {
        // Fallback: extract base price from totalAmount (remove tax)
        if (totalAmount && totalAmount > 0) {
          basePrice = Math.round(totalAmount / 1.18);
        } else {
          basePrice = hall.basePrice || 0;
        }
        console.log('💰 Using fallback base price:', basePrice);
      }
    } else {
      console.log('✅ Using basePrice from request:', basePrice);
    }

    // If slotPrice not provided, calculate from venue's priceSlots
    if (!slotPrice && startTime && endTime && hall.priceSlots && hall.priceSlots.length > 0) {
      const matchingSlot = hall.priceSlots.find(
        slot => startTime >= slot.startTime && endTime <= slot.endTime
      );
      slotPrice = matchingSlot?.price || 0;
    }

    // Calculate addons total if not provided
    if (!addonsTotal && addons && addons.length > 0) {
      addonsTotal = addons.reduce((sum, addon) => sum + (addon.price * (addon.quantity || 1)), 0);
    }

    // Calculate tax and total if not provided
    if (!tax || tax === 0) {
      const subtotal = basePrice + slotPrice + addonsTotal;
      tax = Math.round(subtotal * 0.18); // 18% GST
    }

    if (!finalTotalAmount || finalTotalAmount === 0) {
      const subtotal = basePrice + slotPrice + addonsTotal;
      finalTotalAmount = subtotal + tax;
    }

    console.log('💰 Final price calculation:', {
      basePrice,
      slotPrice,
      addonsTotal,
      tax,
      finalTotalAmount
    });

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const booking = await Booking.create({
      userId: userId,
      hallId,
      eventName,
      eventType,
      date: bookingDate,
      startTime,
      endTime,
      guestCount,
      addons: addons || [],
      basePrice,
      slotPrice,
      addonsTotal,
      tax,
      totalAmount: finalTotalAmount,
      advancePercent: advancePercent || 10,
      invoiceNumber,
      customerName: customerName,
      customerEmail: customerEmail,
      customerMobile: customerMobile
    });

    // Populate booking for email
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('hallId', 'name location');

    // Send confirmation email with invoice (async, don't wait)
    try {
      console.log('📧 Preparing to send booking confirmation email...');
      
      // Always use customer email from request (not from populated userId which might be wrong)
      const userForEmail = {
        name: customerName,
        email: customerEmail,
        phone: customerMobile
      };

      console.log('📧 Sending email to customer:', userForEmail.email);
      console.log('📧 Customer name:', userForEmail.name);

      // Generate invoice PDF
      const invoicePath = await generateInvoicePDF(
        populatedBooking,
        userForEmail,
        populatedBooking.hallId,
        { title: eventType } // Service-like object for PDF
      );

      console.log('📄 Invoice PDF generated:', invoicePath);

      // Send email with invoice attachment to customer
      await sendBookingConfirmation(populatedBooking, userForEmail, invoicePath);
      console.log('✅ Booking confirmation email sent successfully to customer');

      // Send admin notification email with customer details
      // IMPORTANT: Use customer data directly from request body, NOT from populated user
      const customerData = {
        name: String(customerName || '').trim(),
        email: String(customerEmail || '').trim(),
        phone: String(customerMobile || '').trim()
      };
      
      console.log('📧 Preparing to send admin notification...');
      console.log('📧 Raw customer data from request:', {
        customerName: customerName,
        customerEmail: customerEmail,
        customerMobile: customerMobile
      });
      console.log('📧 Customer data object being sent:', customerData);
      console.log('📧 Populated booking userId (should NOT be used):', populatedBooking.userId);
      
      await sendAdminBookingNotification(populatedBooking, customerData);
      console.log('✅ Admin notification email sent successfully');
    } catch (emailError) {
      // Log error but don't fail the booking
      console.error('❌ Error sending booking confirmation email:', emailError);
      console.error('❌ Email error details:', {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        responseCode: emailError.responseCode,
        stack: process.env.NODE_ENV === 'development' ? emailError.stack : undefined
      });
      console.error('❌ SMTP Configuration Status:', {
        SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
        SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
        SMTP_USER: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'NOT SET',
        SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET'
      });
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookings/me
// @desc    Get user's bookings
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hallId', 'name location images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hallId', 'name location images')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user owns booking or is admin
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

export default router;


