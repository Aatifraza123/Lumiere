import express from 'express';
import Testimonial from '../models/Testimonial.model.js';

const router = express.Router();

// @route   GET /api/testimonials
// @desc    Get all approved testimonials
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    console.log('📖 GET /api/testimonials - Request received');
    console.log('📖 Query params:', req.query);
    
    const { eventType, isActive } = req.query;
    const query = { isApproved: true };

    // Only show active testimonials by default, unless explicitly requested
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    } else {
      // Default to only active testimonials
      query.isActive = true;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    console.log('📖 Query:', query);

    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    console.log(`✅ Found ${testimonials.length} testimonials`);
    
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    console.error('❌ Error fetching testimonials:', error);
    next(error);
  }
});

// @route   GET /api/testimonials/:id
// @desc    Get single testimonial
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
});

export default router;





