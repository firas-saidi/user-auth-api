const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

// Register
router.post('/register', async (req, res) => {
    try {
      const { userName, email, password, role } = req.body;
  
      // Check if email or userName already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { userName }] 
      });
  
      if (existingUser) {
        return res.status(200).json({ error: 'Email or userName already exists' });
      }
  
      // Encrypt the password
      const hashedPassword = CryptoJS.AES.encrypt(password, JWT_SECRET).toString();
  
      // Create new user
      const user = new User({ userName, email, password: hashedPassword, role });
      await user.save();
  
      // Respond with selected fields only
      res.status(201).json({ userName, email, role });
    } catch (error) {
      res.status(500).json({ error: 'Error registering user', details: error.message });
    }
  });
  

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found!' });

    // Decrypt and compare the password
    const decryptedPassword = CryptoJS.AES.decrypt(user.password, JWT_SECRET).toString(CryptoJS.enc.Utf8);
    if (decryptedPassword !== password) return res.status(401).json({ error: 'Invalid credentials!' });

    // Generate JWT
    const token = jwt.sign({ id: user._id, userName: user.userName, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, userName: user.userName, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in', details: error.message });
  }
});

module.exports = router;
