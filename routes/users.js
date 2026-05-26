const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// GET /api/users/me — protected by JWT middleware
router.get('/me', authenticateToken, (req, res) => {
  // req.user is populated by the middleware after successful verification
  res.status(200).json({
    id: req.user.sub,
    name: req.user.name,
    email: req.user.email,
    // add any other fields from your JWT payload
  });
});

module.exports = router;