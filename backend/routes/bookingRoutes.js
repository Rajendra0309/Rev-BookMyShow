const express = require('express');
const router = express.Router();

const { 
    createBooking,
    getBookingsByUser,
    cancelBooking,
    getSeatAvailability,
    deleteAllBookings
} = require('../controllers/bookingController');

// Create booking
router.post('/create', createBooking);

// Get booking history by user
router.get('/user/:userId', getBookingsByUser);

// Cancel booking
router.put('/cancel/:id', cancelBooking);

// Seat availability
router.get('/availability/:showId', getSeatAvailability);

// Delete all bookings (temporary)
router.delete('/delete-all', deleteAllBookings);

module.exports = router;