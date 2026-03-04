const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
    createShow,
    getAllShows,
    getShowById,
    cancelShow
} = require('../controllers/showController');

// Create new show — Admin only
router.post('/create', protect, adminOnly, createShow);

// Get all shows — any logged-in user
router.get('/', protect, getAllShows);

// Get single show — any logged-in user
router.get('/:id', protect, getShowById);

// Cancel show — Admin only
router.put('/cancel/:id', protect, adminOnly, cancelShow);

module.exports = router;