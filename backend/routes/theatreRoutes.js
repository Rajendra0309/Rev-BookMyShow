const express = require('express');
const router = express.Router();

const { createTheatre } = require('../controllers/theatreController');
const { getSeatsByScreenId } = require('../controllers/screenController');

router.post('/create', createTheatre);

// Get seats by screen ID
router.get('/screens/:screenId/seats', getSeatsByScreenId);

module.exports = router;