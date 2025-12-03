import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';

const router = express.Router();

// @route   GET /api/user/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/user/me
// @desc    Update current user
// @access  Private
router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const fieldsToUpdate = {};

    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

export default router;








