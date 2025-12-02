import express from 'express';
import Contact from '../models/Contact.model.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res, next) => {
  try {
    console.log('📝 POST /api/contact - Request received');
    console.log('📝 Body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, email, phone, subject, message } = req.body;

    // Auto-generate subject if not provided
    const contactSubject = subject || `Contact from ${name}`;

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      subject: contactSubject.trim(),
      message: message.trim()
    };

    console.log('💾 Creating contact with data:', contactData);

    const contact = await Contact.create(contactData);

    console.log('✅ Contact created successfully:', contact._id);

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
      data: contact
    });
  } catch (error) {
    console.error('❌ Error creating contact:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name
    });
    next(error);
  }
});

export default router;





