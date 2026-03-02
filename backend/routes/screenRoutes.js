const express = require('express');
const router = express.Router();

const { createScreen } = require('../controllers/screenController');

router.post('/create', createScreen);

module.exports = router;