const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const registerRouter = require('../api/users/register');
const loginRouter = require('../api/users/login');
const User = require('../models/userSchema');
const Bookmark = require('../models/bookmarkSchema');
const { authenticateToken } = require('../utils/passportJwt');

// Mount register and login routes early to avoid /:id conflicts
router.use('/register', registerRouter);
router.use('/login', loginRouter);

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/?auth=failed', session: false }), (req, res) => {
  const payload = {
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '1h',
  });
  const redirectUrl = `/index.html?token=${encodeURIComponent(token)}`;
  res.redirect(redirectUrl);
});

// GET the current authenticated user's profile
router.get('/me', authenticateToken, (req, res) => {
    return res.status(200).json({ success: true, data: req.user });
});

// POST create a new bookmark for the logged-in user
router.post('/bookmarks', authenticateToken, async (req, res) => {
    try {
        const { title, url, notes } = req.body || {};
        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Bookmark title is required.' });
        }

        const bookmark = await Bookmark.create({
            title: title.trim(),
            url: url ? url.trim() : undefined,
            notes: notes ? notes.trim() : undefined,
            user: req.user._id,
        });

        return res.status(201).json({ success: true, data: bookmark });
    } catch (err) {
        console.error('Error creating bookmark:', err);
        return res.status(500).json({ success: false, message: 'Error creating bookmark' });
    }
});

// GET bookmarks for the logged-in user
router.get('/bookmarks', authenticateToken, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: bookmarks });
    } catch (err) {
        console.error('Error fetching bookmarks:', err);
        return res.status(500).json({ success: false, message: 'Error fetching bookmarks' });
    }
});

// GET all users from MongoDB
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

// GET a specific user by ID from MongoDB
router.get('/:id', async (req, res) => {
    try {
        console.log('route:/:id - requested id:', req.params.id);
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        return res.status(500).json({ success: false, message: 'Error fetching user' });
    }
});

// POST create a new user in MongoDB
router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body || {};
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide username, email and password' });
        }

        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'A user with that username or email already exists.' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        const userObj = newUser.toObject();
        delete userObj.password;
        return res.status(201).json({ success: true, data: userObj });
    } catch (err) {
        console.error('Error creating user:', err);
        if (err && err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((error) => error.message).join(', ');
            return res.status(400).json({ success: false, message: messages });
        }
        return res.status(500).json({ success: false, message: 'Error creating user' });
    }
});

// PUT update an entire user resource in MongoDB
router.put('/:id', async (req, res) => {
    try {
        const updates = { username: req.body.username, email: req.body.email };
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

// DELETE remove a user from MongoDB
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

// PATCH update part of a user resource in MongoDB
router.patch('/:id', async (req, res) => {
    try {
        const updates = {};
        if (req.body.username !== undefined) updates.username = req.body.username;
        if (req.body.email !== undefined) updates.email = req.body.email;
        if (req.body.password !== undefined) updates.password = req.body.password;

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('Error patching user:', err);
        return res.status(500).json({ success: false, message: 'Error patching user' });
    }
});

module.exports = router;
