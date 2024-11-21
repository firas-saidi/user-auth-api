const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');


// Middleware to verify JWT and extract the user
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(403).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET: Fetch all users (Admin only)
// router.get('/users', verifyToken, async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Access denied. Admins only.' });
//     }

//     const users = await User.find({}, '-password'); // Exclude password from the result
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching users', details: error.message });
//   }
// });
// GET: Fetch all users (Admin only, include decrypted passwords)
router.get('/users', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    // Fetch all users from the database
    const users = await User.find();

    // Decrypt passwords and prepare the response
    const userList = users.map((user) => {
      // Decrypt the password
      const bytes = CryptoJS.AES.decrypt(user.password, process.env.JWT_SECRET);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

      return {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        password: originalPassword, // Include the decrypted password
      };
    });

    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users', details: error.message });
  }
});


// PUT: Update user email, password, or username
router.put('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, userName, password, role } = req.body;

    // Find user to update
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check for unique email or username
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ error: 'Email already exists' });
      user.email = email;
    }

    if (userName && userName !== user.userName) {
      const userNameExists = await User.findOne({ userName });
      if (userNameExists) return res.status(400).json({ error: 'Username already exists' });
      user.userName = userName;
    }

    // Update password
    if (password) {
      const hashedPassword = CryptoJS.AES.encrypt(password, process.env.JWT_SECRET).toString();
      user.password = hashedPassword;
    }

    // Update role (Admin only)
    if (role) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can update roles' });
      }
      user.role = role;
    }

    // Save the updated user
    await user.save();
    res.status(200).json({ message: 'User updated successfully', user: { email: user.email, userName: user.userName, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user', details: error.message });
  }
});
// GET: Fetch user details by ID (Admin only, include decrypted password)
// router.get('/users/:id', verifyToken, async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Access denied. Admins only.' });
//     }

//     const { id } = req.params;

//     // Fetch user from database
//     const user = await User.findById(id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Decrypt password
//     const bytes = CryptoJS.AES.decrypt(user.password, process.env.JWT_SECRET);
//     const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

//     // Include decrypted password in the response
//     res.status(200).json({
//       userName: user.userName,
//       email: user.email,
//       role: user.role,
//       password: originalPassword, // Include the original password
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching user details', details: error.message });
//   }
// });

// GET: Fetch user details by ID (Admin only, exclude password)
router.get('/users/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const { id } = req.params;

    // Fetch user from database
    const user = await User.findById(id, '-password'); // Exclude password from the result
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user details (excluding the password)
    res.status(200).json({
      userName: user.userName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user details', details: error.message });
  }
  
});

// DELETE: Delete user by ID (Admin only)
router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    // Find and delete the user by id
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with success message
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user', details: error.message });
  }
});




module.exports = router;
