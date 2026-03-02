const express = require('express');
const router = express.Router();

const {
    createNotification,
    getUserNotifications,
    markNotificationRead,
    deleteNotification,
    getRevenueReport,
    getOccupancyReport,
    getBookingReport
} = require('../controllers/reportController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

/* --------------------------------------------------
   NOTIFICATION ROUTES
   -------------------------------------------------- */
// Get all notifications for a user
router.get('/notifications/:userId', protect, getUserNotifications);

// Mark a notification as read
router.put('/notifications/:id/read', protect, markNotificationRead);

// Delete a notification
router.delete('/notifications/:id', protect, deleteNotification);

/* --------------------------------------------------
   REPORT ROUTES  (Admin Only)
   -------------------------------------------------- */
// Revenue report: GET /api/reports/revenue?startDate=&endDate=&movieId=
router.get('/revenue', protect, adminOnly, getRevenueReport);

// Theatre occupancy report: GET /api/reports/occupancy
router.get('/occupancy', protect, adminOnly, getOccupancyReport);

// Booking & cancellation report: GET /api/reports/bookings?startDate=&endDate=
router.get('/bookings', protect, adminOnly, getBookingReport);

module.exports = router;
