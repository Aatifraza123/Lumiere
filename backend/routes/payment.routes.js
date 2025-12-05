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
    console.log('📥 POST /api/payments/razorpay/create-order - Request received');
    console.log('📦 Request body:', req.body);
    console.log('👤 User authenticated:', !!req.user);
    console.log('👤 User ID:', req.user ? req.user._id : 'guest');

    if (!razorpay) {
      console.error('❌ Razorpay not initialized');
      return res.status(503).json({ 
        success: false, 
        message: 'Payment gateway not configured. Please contact administrator.' 
      });
    }

    const { bookingId, amount } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if this is a guest booking (has customerEmail/customerName)
    const isGuestBooking = booking.customerEmail && booking.customerName;

    console.log('📋 Booking details:', {
      bookingId: booking._id,
      userId: booking.userId,
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
      isGuestBooking: isGuestBooking
    });

    // Authorization logic:
    // 1. If user is authenticated, verify they own the booking
    // 2. If not authenticated, allow if it's a guest booking (has customerEmail)
    // 3. If not authenticated and not a guest booking, require authentication
    if (req.user) {
      // Authenticated user - verify they own the booking
      if (booking.userId && booking.userId.toString() !== req.user._id.toString()) {
        console.error('❌ Authorization failed: User does not own this booking');
        console.error('   Booking userId:', booking.userId);
        console.error('   Request userId:', req.user._id);
        return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
      }
      console.log('✅ Authenticated user authorized');
    } else {
      // Not authenticated - only allow if it's a guest booking
      if (!isGuestBooking) {
        console.error('❌ Authorization failed: Guest booking but no customerEmail/customerName');
        return res.status(403).json({ 
          success: false, 
          message: 'This booking requires authentication. Please log in to proceed with payment.' 
        });
      }
      console.log('✅ Guest booking authorized');
    }

    // Use amount from request if provided (advance amount), otherwise use booking totalAmount
    let paymentAmount = amount;
    if (!paymentAmount || paymentAmount === 0) {
      // If no amount provided, use booking's totalAmount
      paymentAmount = booking.totalAmount;
      console.log('💰 No amount provided, using booking totalAmount:', paymentAmount);
    } else {
      console.log('💰 Using provided amount (advance):', paymentAmount);
    }
    
    const amountInPaise = Math.round(paymentAmount * 100); // Razorpay uses paise
    
    console.log('💰 Razorpay order amount:', {
      paymentAmount,
      amountInPaise,
      bookingTotalAmount: booking.totalAmount,
      bookingBasePrice: booking.basePrice,
      bookingTax: booking.tax
    });

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



