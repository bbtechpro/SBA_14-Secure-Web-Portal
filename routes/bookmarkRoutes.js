const express = require('express');
const Bookmark = require('../models/bookmarkSchema');
const { authenticateToken } = require('../utils/passportJwt');

const router = express.Router();

// Require authentication for all bookmark routes
router.use(authenticateToken);

// GET /api/bookmarks - Get all bookmarks for the authenticated user
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: bookmarks });
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    return res.status(500).json({ success: false, message: 'Error fetching bookmarks' });
  }
});

// GET /api/bookmarks/:id - Get a single bookmark owned by the authenticated user
router.get('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }
    if (bookmark.user.toString() !== req.user._id) {
      return res.status(403).json({ success: false, message: 'User is not authorized to view this bookmark.' });
    }
    return res.status(200).json({ success: true, data: bookmark });
  } catch (err) {
    console.error('Error fetching bookmark:', err);
    return res.status(500).json({ success: false, message: 'Error fetching bookmark' });
  }
});

// POST /api/bookmarks - Create a new bookmark for the authenticated user
router.post('/', async (req, res) => {
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

// PUT /api/bookmarks/:id - Update an existing bookmark owned by the authenticated user
router.put('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }
    if (bookmark.user.toString() !== req.user._id) {
      return res.status(403).json({ success: false, message: 'User is not authorized to update this bookmark.' });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.url !== undefined) updates.url = req.body.url;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;

    const updatedBookmark = await Bookmark.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, data: updatedBookmark });
  } catch (err) {
    console.error('Error updating bookmark:', err);
    return res.status(500).json({ success: false, message: 'Error updating bookmark' });
  }
});

// DELETE /api/bookmarks/:id - Delete an existing bookmark owned by the authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }
    if (bookmark.user.toString() !== req.user._id) {
      return res.status(403).json({ success: false, message: 'User is not authorized to delete this bookmark.' });
    }

    await Bookmark.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Bookmark deleted successfully' });
  } catch (err) {
    console.error('Error deleting bookmark:', err);
    return res.status(500).json({ success: false, message: 'Error deleting bookmark' });
  }
});

module.exports = router;
