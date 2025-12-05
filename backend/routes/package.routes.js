import express from 'express';
import Package from '../models/Package.model.js';

const router = express.Router();

// @route   GET /api/packages
// @desc    Get all packages
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const packages = await Package.find(query)
      .populate('services')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/packages/:id
// @desc    Get single package
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const packageData = await Package.findById(req.params.id).populate('services');
    if (!packageData) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: packageData });
  } catch (error) {
    next(error);
  }
});

export default router;












