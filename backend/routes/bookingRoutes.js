const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
    createBooking,
    getBookingsByUser,
    cancelBooking,
    getSeatAvailability,
    deleteAllBookings
} = require('../controllers/bookingController');

// Create booking — logged-in user only
router.post('/create', protect, createBooking);

// Get booking history — user sees only their own
router.get('/user/:userId', protect, getBookingsByUser);

// Cancel booking
router.put('/cancel/:id', protect, cancelBooking);

// Seat availability — any logged-in user
router.get('/availability/:showId', protect, getSeatAvailability);

// Delete all bookings — Admin only (testing only)
router.delete('/delete-all', protect, adminOnly, deleteAllBookings);

module.exports = router;