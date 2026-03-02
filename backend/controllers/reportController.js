const Notification = require('../models/Notification');
const Booking      = require('../models/Booking');
const BookingSeat  = require('../models/BookingSeat');
const Show         = require('../models/Show');
const Screen       = require('../models/Screen');
const Movie        = require('../models/Movie');
const Theatre      = require('../models/Theatre');

/* ======================================================
   INTERNAL HELPER — Create a Notification
   Called by booking / cancellation flows.
   Usage: await createNotification(userId, 'Your booking is confirmed!');
   ====================================================== */
const createNotification = async (userId, message) => {
    try {
        const notification = await Notification.create({ userId, message });
        return notification;
    } catch (err) {
        console.error('Notification creation failed:', err.message);
    }
};
exports.createNotification = createNotification;


/* ======================================================
   GET NOTIFICATIONS FOR A USER
   GET /api/reports/notifications/:userId
   Protected — user can only see their own (enforced in route)
   ====================================================== */
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/* ======================================================
   MARK NOTIFICATION AS READ
   PUT /api/reports/notifications/:id/read
   ====================================================== */
exports.markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.status = 'Read';
        await notification.save();

        res.status(200).json({ success: true, message: 'Notification marked as read', data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/* ======================================================
   DELETE NOTIFICATION
   DELETE /api/reports/notifications/:id
   ====================================================== */
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/* ======================================================
   REVENUE REPORT  (Admin Only)
   GET /api/reports/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&movieId=
   Returns:
     - totalRevenue
     - revenueByMovie  [ { movieTitle, revenue, bookingCount } ]
     - revenueByDate   [ { date, revenue } ]
   ====================================================== */
exports.getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate, movieId } = req.query;

        // Build base date filter on bookingDate
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate)   dateFilter.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));

        const bookingMatch = { status: 'Confirmed' };
        if (startDate || endDate) bookingMatch.bookingDate = dateFilter;

        // Fetch confirmed bookings
        let bookings = await Booking.find(bookingMatch).populate({
            path: 'showId',
            populate: { path: 'movieId', model: 'Movie' }
        });

        // Optional filter by movie
        if (movieId) {
            bookings = bookings.filter(
                b => b.showId && b.showId.movieId && b.showId.movieId._id.toString() === movieId
            );
        }

        // Calculate totals
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Revenue by movie
        const movieMap = {};
        bookings.forEach(b => {
            const title = b.showId?.movieId?.title || 'Unknown';
            if (!movieMap[title]) movieMap[title] = { revenue: 0, bookingCount: 0 };
            movieMap[title].revenue      += b.totalAmount || 0;
            movieMap[title].bookingCount += 1;
        });
        const revenueByMovie = Object.entries(movieMap).map(([movieTitle, stats]) => ({
            movieTitle, ...stats
        }));

        // Revenue by date (group by booking date — date only, no time)
        const dateMap = {};
        bookings.forEach(b => {
            const dateKey = new Date(b.bookingDate).toISOString().split('T')[0];
            if (!dateMap[dateKey]) dateMap[dateKey] = 0;
            dateMap[dateKey] += b.totalAmount || 0;
        });
        const revenueByDate = Object.entries(dateMap)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date));

        res.status(200).json({
            success: true,
            data: { totalRevenue, revenueByMovie, revenueByDate }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/* ======================================================
   THEATRE OCCUPANCY REPORT  (Admin Only)
   GET /api/reports/occupancy
   Returns per-show occupancy: seatsBooked / totalSeats * 100
   ====================================================== */
exports.getOccupancyReport = async (req, res) => {
    try {
        // Count how many BookingSeats exist per show (via Booking → Show join)
        const bookings = await Booking.find({ status: 'Confirmed' }).select('showId');

        // Map showId → bookingIds
        const showBookingMap = {};
        bookings.forEach(b => {
            const showKey = b.showId.toString();
            if (!showBookingMap[showKey]) showBookingMap[showKey] = [];
            showBookingMap[showKey].push(b._id);
        });

        // Count seats per show grouping BookingSeats by bookingId
        const bookingIds = bookings.map(b => b._id);
        const seatCounts = await BookingSeat.aggregate([
            { $match: { bookingId: { $in: bookingIds } } },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            { $unwind: '$booking' },
            {
                $group: {
                    _id: '$booking.showId',
                    seatsBooked: { $sum: 1 }
                }
            }
        ]);

        // Enrich with show/movie/screen/theatre details
        const result = await Promise.all(
            seatCounts.map(async item => {
                const show = await Show.findById(item._id)
                    .populate('movieId', 'title')
                    .populate({
                        path: 'screenId',
                        populate: { path: 'theatreId', model: 'Theatre', select: 'name city' }
                    });

                const totalSeats = show?.screenId?.totalSeats || 0;
                const occupancyPct = totalSeats > 0
                    ? ((item.seatsBooked / totalSeats) * 100).toFixed(2)
                    : 0;

                return {
                    showId: item._id,
                    movieTitle: show?.movieId?.title || 'Unknown',
                    showDate: show?.showDate,
                    showTime: show?.showTime,
                    screenName: show?.screenId?.screenName || 'Unknown',
                    theatreName: show?.screenId?.theatreId?.name || 'Unknown',
                    city: show?.screenId?.theatreId?.city || 'Unknown',
                    totalSeats,
                    seatsBooked: item.seatsBooked,
                    occupancyPercentage: parseFloat(occupancyPct)
                };
            })
        );

        // Sort by occupancy descending
        result.sort((a, b) => b.occupancyPercentage - a.occupancyPercentage);

        res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/* ======================================================
   BOOKING & CANCELLATION REPORT  (Admin Only)
   GET /api/reports/bookings?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   Returns:
     - totalBookings, confirmed, cancelled, cancellationRate
     - dailyBreakdown [ { date, confirmed, cancelled } ]
   ====================================================== */
exports.getBookingReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchFilter = {};
        if (startDate || endDate) {
            matchFilter.bookingDate = {};
            if (startDate) matchFilter.bookingDate.$gte = new Date(startDate);
            if (endDate)   matchFilter.bookingDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }

        // Aggregate by status
        const statusAgg = await Booking.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        let confirmed = 0, cancelled = 0;
        statusAgg.forEach(item => {
            if (item._id === 'Confirmed')  confirmed  = item.count;
            if (item._id === 'Cancelled')  cancelled  = item.count;
        });

        const totalBookings     = confirmed + cancelled;
        const cancellationRate  = totalBookings > 0
            ? ((cancelled / totalBookings) * 100).toFixed(2)
            : 0;

        // Daily breakdown
        const dailyAgg = await Booking.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        date:   { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Pivot into [ { date, confirmed, cancelled } ]
        const dailyMap = {};
        dailyAgg.forEach(item => {
            const date = item._id.date;
            if (!dailyMap[date]) dailyMap[date] = { date, confirmed: 0, cancelled: 0 };
            if (item._id.status === 'Confirmed') dailyMap[date].confirmed = item.count;
            if (item._id.status === 'Cancelled') dailyMap[date].cancelled = item.count;
        });
        const dailyBreakdown = Object.values(dailyMap);

        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                confirmed,
                cancelled,
                cancellationRate: parseFloat(cancellationRate),
                dailyBreakdown
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
