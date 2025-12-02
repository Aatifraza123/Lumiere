import express from 'express';
import mongoose from 'mongoose';
import Hall from '../models/Hall.model.js';
import Booking from '../models/Booking.model.js';

const router = express.Router();

// Helper function to check MongoDB connection
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @route   GET /api/halls
// @desc    Get all halls
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    if (!isConnected()) {
      console.warn('⚠️  MongoDB not connected');
      return res.json({ success: true, data: [], count: 0 });
    }

    const { limit, isFeatured, isActive } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    let hallsQuery = Hall.find(query);
    if (limit) {
      hallsQuery = hallsQuery.limit(parseInt(limit));
    }

    const halls = await hallsQuery.sort({ createdAt: -1 });
    
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

// @route   GET /api/halls/:id
// @desc    Get single hall
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    if (!isConnected()) {
      console.warn('⚠️  MongoDB not connected');
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }
    res.json({ success: true, data: hall });
  } catch (error) {
    if (error.name !== 'CastError') {
      console.error('Error fetching hall:', error.message);
    }
    res.status(404).json({ success: false, message: 'Hall not found' });
  }
});

// @route   GET /api/halls/:id/availability
// @desc    Check hall availability
// @access  Public
router.get('/:id/availability', async (req, res, next) => {
  try {
    if (!isConnected()) {
      console.warn('⚠️  MongoDB not connected');
      return res.json({ success: true, available: true });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, startTime, and endTime are required'
      });
    }

    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingBookings = await Booking.find({
      hallId: req.params.id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    const available = conflictingBookings.length === 0;

    res.json({
      success: true,
      available,
      conflictingBookings: conflictingBookings.length
    });
  } catch (error) {
    if (error.name !== 'CastError') {
      console.error('Error checking availability:', error.message);
    }
    res.status(404).json({ success: false, message: 'Hall not found' });
  }
});

// @route   GET /api/halls/:id/price
// @desc    Calculate hall price
// @access  Public
router.get('/:id/price', async (req, res, next) => {
  try {
    if (!isConnected()) {
      console.warn('⚠️  MongoDB not connected');
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    const { serviceType, startTime, endTime } = req.query;

    if (!serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Service type is required'
      });
    }

    // Get base price for service type
    const servicePricing = hall.servicePricing.find(
      sp => sp.serviceType === serviceType
    );
    const basePrice = servicePricing?.basePrice || 0;

    // Get slot price
    let slotPrice = 0;
    if (startTime && endTime && hall.priceSlots.length > 0) {
      const matchingSlot = hall.priceSlots.find(
        slot => startTime >= slot.startTime && endTime <= slot.endTime
      );
      slotPrice = matchingSlot?.price || 0;
    }

    const subtotal = basePrice + slotPrice;
    const tax = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + tax;

    res.json({
      success: true,
      data: {
        basePrice,
        slotPrice,
        subtotal,
        tax,
        totalAmount
      }
    });
  } catch (error) {
    if (error.name !== 'CastError') {
      console.error('Error calculating price:', error.message);
    }
    res.status(404).json({ success: false, message: 'Hall not found' });
  }
});

export default router;





