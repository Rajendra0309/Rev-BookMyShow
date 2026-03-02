const express = require('express');
const router = express.Router();

const { createMovie } = require('../controllers/movieController');

router.post('/create', createMovie);

module.exports = router;