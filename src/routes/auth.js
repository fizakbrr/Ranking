const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, execute } = require('../config/database');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if admin user exists in database
    const user = await queryOne(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );

    let isValidUser = false;

    if (user) {
      // Check password against database
      isValidUser = await bcrypt.compare(password, user.password_hash || user.password);
    } else {
      // Fallback to environment variables for first-time setup or default admin
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (username === defaultUsername && password === defaultPassword) {
        // Create admin user in database
        const hashedPassword = await bcrypt.hash(password, 10);
        await execute(
          'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
          [username, hashedPassword]
        );
        isValidUser = true;
      }
    }

    if (!isValidUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { username, role: 'admin' }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
