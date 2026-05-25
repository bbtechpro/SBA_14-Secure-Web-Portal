// Create a new GET /api/users/me route that is supposed to return the currently logged-in user’s profile data (without the password).
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const authMiddleware = require('../utils/auth').authMiddleware;

router.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;