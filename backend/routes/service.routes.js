import express from 'express';
import Service from '../models/Service.model.js';

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services
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

    const services = await Service.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', async (req, res, next) => {
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

export default router;








