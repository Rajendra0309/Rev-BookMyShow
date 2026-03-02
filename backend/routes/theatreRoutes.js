const express = require('express');
const router = express.Router();

const {
    // Theatre
    getAllTheatres,
    getTheatreById,
    createTheatre,
    updateTheatre,
    deleteTheatre,
    // Screen
    getScreensByTheatre,
    addScreen,
    updateScreen,
    deleteScreen,
    // Seat
    getSeatsByScreen,
    addSeats,
    deleteAllSeats
} = require('../controllers/theatreController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

/* ------ Theatre Routes ------ */
router.get('/', protect, getAllTheatres);
router.get('/:id', protect, getTheatreById);
router.post('/', protect, adminOnly, createTheatre);
router.put('/:id', protect, adminOnly, updateTheatre);
router.delete('/:id', protect, adminOnly, deleteTheatre);

/* ------ Screen Routes (nested under theatre) ------ */
router.get('/:id/screens', protect, getScreensByTheatre);
router.post('/:id/screens', protect, adminOnly, addScreen);

/* ------ Screen Routes (by screenId) ------ */
router.put('/screens/:screenId', protect, adminOnly, updateScreen);
router.delete('/screens/:screenId', protect, adminOnly, deleteScreen);

/* ------ Seat Routes (nested under screen) ------ */
router.get('/screens/:screenId/seats', protect, getSeatsByScreen);
router.post('/screens/:screenId/seats', protect, adminOnly, addSeats);
router.delete('/screens/:screenId/seats', protect, adminOnly, deleteAllSeats);

module.exports = router;
