const express = require('express');
const router = express.Router();

const {
    createShow,
    getAllShows,
    getShowById,
    cancelShow
} = require('../controllers/showController');

// Create new show
router.post('/create', createShow);

// Get all shows
router.get('/', getAllShows);

// Get single show
router.get('/:id', getShowById);

// Cancel show
router.put('/cancel/:id', cancelShow);

module.exports = router;