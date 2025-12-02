import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.model.js';
import Booking from '../models/Booking.model.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { sendBookingConfirmation } from '../utils/email.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Razorpay (only if credentials are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('⚠️  Razorpay credentials not found. Payment features will be disabled.');
}

// @route   POST /api/payments/razorpay/create-order
// @desc    Create Razorpay order
// @access  Public (with optional auth for guest bookings)
router.post('/razorpay/create-order', optionalAuth, async (req, res, next) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ 
        success: false, 
        message: 'Payment gateway not configured. Please contact administrator.' 
      });
    }

    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If user is authenticated, verify they own the booking
    // If not authenticated (guest booking), allow payment if booking has no userId or userId is null
    if (req.user) {
      if (booking.userId && booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    } else {
      // Guest booking - allow if booking has no userId or userId is null
      if (booking.userId) {
        return res.status(403).json({ success: false, message: 'This booking requires authentication' });
      }
    }

    const paymentAmount = amount || booking.totalAmount;
    const amountInPaise = Math.round(paymentAmount * 100); // Razorpay uses paise

    // Generate receipt ID (max 40 characters as per Razorpay requirement)
    // Format: RCPT + bookingId (first 12 chars) + timestamp (last 8 chars) = 20 chars total
    const bookingIdStr = bookingId.toString();
    const receiptId = `RCPT${bookingIdStr.substring(0, 12)}${Date.now().toString().slice(-8)}`;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user ? req.user._id.toString() : 'guest'
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/payments/razorpay/verify
// @desc    Verify Razorpay payment
// @access  Public (with optional auth for guest bookings)
router.post('/razorpay/verify', optionalAuth, async (req, res, next) => {
  try {
    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ 
        success: false, 
        message: 'Payment gateway not configured. Please contact administrator.' 
      });
    }

    const { orderId, paymentId, signature, bookingId } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Calculate advance amount (10% of total)
    const advanceAmount = Math.round(booking.totalAmount * (booking.advancePercent / 100));
    
    // Create payment record (stores the advance amount paid)
    const payment = await Payment.create({
      bookingId,
      userId: req.user ? req.user._id : booking.userId || null,
      amount: advanceAmount, // Store advance amount, not total
      provider: 'razorpay',
      paymentId,
      orderId,
      signature,
      status: 'success'
    });

    // Update booking
    booking.paidAmount = advanceAmount;
    booking.paymentStatus = booking.paidAmount >= booking.totalAmount ? 'paid' : 'partial';
    booking.status = 'confirmed';
    await booking.save();
    
    console.log(`💰 Payment updated: Advance ${booking.advancePercent}% = ₹${advanceAmount} of ₹${booking.totalAmount}`);

    // Populate booking for email
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('hallId', 'name location');

    // Send confirmation email with invoice (async, don't wait)
    try {
      console.log('📧 Preparing to send payment confirmation email...');
      
      // Get customer email from populated user (should be correct since we create guest user)
      if (!populatedBooking.userId || !populatedBooking.userId.email) {
        console.warn('⚠️ No user email found for booking, skipping email');
        return;
      }

      const userForEmail = populatedBooking.userId;
      console.log('📧 Sending email to customer:', userForEmail.email);

      // Generate invoice PDF
      const invoicePath = await generateInvoicePDF(
        populatedBooking,
        userForEmail,
        populatedBooking.hallId,
        { title: populatedBooking.eventType } // Service-like object for PDF
      );

      console.log('📄 Invoice PDF generated:', invoicePath);

      // Send email with invoice attachment
      await sendBookingConfirmation(populatedBooking, userForEmail, invoicePath);
      console.log('✅ Payment confirmation email sent successfully');
    } catch (emailError) {
      // Log error but don't fail the payment
      console.error('❌ Error sending payment confirmation email:', emailError);
      console.error('❌ Email error details:', {
        message: emailError.message,
        stack: emailError.stack
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

export default router;



