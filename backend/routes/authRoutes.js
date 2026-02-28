const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    getAllUsers,
    changePassword,
    forgotPassword,
    getSecurityQuestion
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/security-question', getSecurityQuestion);

router.get('/profile', protect, getProfile);
router.post('/change-password', protect, changePassword);

router.get('/users', protect, adminOnly, getAllUsers);

router.get('/test', (req, res) => res.json({ msg: 'Auth route working' }));

module.exports = router;