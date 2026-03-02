const express = require('express');
const router = express.Router();

const { createTheatre } = require('../controllers/theatreController');

router.post('/create', createTheatre);

module.exports = router;