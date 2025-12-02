import express from 'express';
import Gallery from '../models/Gallery.model.js';

const router = express.Router();

// @route   GET /api/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const gallery = await Gallery.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: gallery.length, data: gallery });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery item
// @access  Public
router.get('/:id', async (req, res, next) => {
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

export default router;





