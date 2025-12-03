import express from 'express';
import Subscribe from '../models/Subscribe.model.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST /api/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('name').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, name } = req.body;

    // Check if already subscribed
    const existing = await Subscribe.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email is already subscribed'
        });
      } else {
        // Reactivate subscription
        existing.isActive = true;
        existing.name = name || existing.name;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        await existing.save();
        return res.json({
          success: true,
          message: 'Successfully resubscribed to newsletter',
          data: existing
        });
      }
    }

    // Create new subscription
    const subscription = await Subscribe.create({
      email,
      name
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: subscription
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/subscribe/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const subscription = await Subscribe.findOne({ email });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in subscription list'
      });
    }

    if (!subscription.isActive) {
      return res.json({
        success: true,
        message: 'Email is already unsubscribed'
      });
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;







