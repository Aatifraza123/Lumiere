import express from 'express';
import User from '../models/User.model.js';
import { generateToken } from '../utils/generateToken.js';
import { sendOTPEmail } from '../utils/email.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email (works for both registered and non-registered users)
// @access  Public
router.post('/send-otp', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    let user = await User.findOne({ email });
    
    if (!user) {
      // For booking, create a temporary user record to store OTP
      // Use try-catch to handle potential duplicate key errors
      try {
        user = await User.create({
          email,
          name: 'Guest User',
          phone: '0000000000',
          password: 'temp_password_' + Date.now(), // Temporary password
          role: 'user'
        });
      } catch (createError) {
        // If user was created between findOne and create, find again
        if (createError.code === 11000) {
          user = await User.findOne({ email });
        } else {
          throw createError;
        }
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to user
    user.emailOTP = otp;
    user.emailOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      // In development, still return OTP even if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Email sending failed, but returning OTP for development:', otp);
        return res.json({
          success: true,
          message: 'OTP generated (email sending failed in development)',
          otp: otp
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please check email configuration.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify email OTP (works for both registered and non-registered users)
// @access  Public
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').notEmpty().withMessage('OTP is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'OTP not found. Please request a new OTP.' });
    }

    // Check if OTP exists and is valid
    if (!user.emailOTP || user.emailOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (user.emailOTPExpire && Date.now() > user.emailOTPExpire) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    // Verify email (mark as verified, but don't require user to be fully registered)
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/send-mobile-otp
// @desc    Send OTP to mobile (works for both registered and non-registered users)
// @access  Public
router.post('/send-mobile-otp', [
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone } = req.body;

    // Find user by phone
    let user = await User.findOne({ phone });
    
    if (!user) {
      // For booking, create a temporary user record to store OTP
      // Use try-catch to handle potential duplicate key errors
      try {
        user = await User.create({
          phone,
          email: `temp_${Date.now()}@booking.com`,
          name: 'Guest User',
          password: 'temp_password_' + Date.now(), // Temporary password
          role: 'user'
        });
      } catch (createError) {
        // If user was created between findOne and create, find again
        if (createError.code === 11000) {
          user = await User.findOne({ phone });
        } else {
          throw createError;
        }
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to user
    user.mobileOTP = otp;
    user.mobileOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send SMS OTP via SMS gateway
    // For now, we'll just return success and log OTP in development
    console.log(`Mobile OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent to your mobile',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/verify-mobile-otp
// @desc    Verify mobile OTP (works for both registered and non-registered users)
// @access  Public
router.post('/verify-mobile-otp', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('otp').notEmpty().withMessage('OTP is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'OTP not found. Please request a new OTP.' });
    }

    // Check if OTP exists and is valid
    if (!user.mobileOTP || user.mobileOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (user.mobileOTPExpire && Date.now() > user.mobileOTPExpire) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    // Verify mobile (mark as verified, but don't require user to be fully registered)
    user.isMobileVerified = true;
    user.mobileOTP = undefined;
    user.mobileOTPExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Mobile verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;


