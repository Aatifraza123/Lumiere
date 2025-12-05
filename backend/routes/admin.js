const express = require('express');
const router = express.Router();
require('dotenv').config();

// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    // Get admin password from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password === adminPassword) {
      return res.json({
        success: true,
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin logout endpoint (optional, mainly for session management if needed)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Verify admin authentication (middleware helper)
const verifyAdmin = (req, res, next) => {
  // This can be extended to use JWT tokens or sessions
  // For now, it's a simple check
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  // Add your authentication logic here
  // For now, we'll just pass through
  next();
};

module.exports = router;














