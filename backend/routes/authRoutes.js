const express = require('express');
const router = express.Router();
const { register, login, getProfile, getAllUsers } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

router.get('/profile', protect, getProfile);

router.get('/users', protect, adminOnly, getAllUsers);

router.get('/test', (req, res) => res.json({ msg: 'Auth route working' }));

module.exports = router;