const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const { createNotification } = require('./reportController');
const { generateTicketPDF } = require('../utils/pdfGenerator');
const { sendTicketEmail } = require('../utils/emailService');


// 🔹 Create Razorpay Payment Order
exports.createPaymentOrder = async (req, res) => {
    try {
        const { showId, seats } = req.body;

        // 1️⃣ Check if show exists
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        // Prevent booking if show already started (date + time combined)
        const currentDateTime = new Date();
        const [hours, minutes] = (show.showTime || '00:00').split(':').map(Number);
        const showDateTime = new Date(show.showDate);
        showDateTime.setHours(hours, minutes, 0, 0);

        if (currentDateTime > showDateTime) {
            return res.status(400).json({
                message: "Cannot pay. Show has already started."
            });
        }

        // 2️⃣ Check if show is cancelled
        if (show.status === "Cancelled") {
            return res.status(400).json({
                message: "Cannot pay for a cancelled show"
            });
        }

        // 3️⃣ Check if seats already booked
        const existingBooking = await Booking.find({
            showId,
            seats: { $in: seats },
            status: "Confirmed"
        });

        if (existingBooking.length > 0) {
            return res.status(400).json({
                message: "One or more seats already booked"
            });
        }

        // 4️⃣ Calculate total amount
        const seatDocs = await Seat.find({
            screenId: show.screenId,
            seatNumber: { $in: seats }
        });

        const totalAmount = seatDocs.reduce((sum, seat) => {
            const price = show.ticketPrice?.[seat.seatType] ?? show.ticketPrice?.Regular ?? 0;
            return sum + price;
        }, 0);

        // 5️⃣ Create order in Razorpay
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: totalAmount * 100, // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.status(201).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            totalAmount
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Create Booking (Verifies Payment & Completes Ticket Confirmation)
exports.createBooking = async (req, res) => {
    try {
        const { showId, seats, razorpayPaymentId, razorpayOrderId, razorpaySignature, paymentMethod } = req.body;
        const userId = req.user.id;

        // 1️⃣ Cryptographically verify the Razorpay signature
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
        const generatedSignature = hmac.digest('hex');
        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        // 2️⃣ Check if show exists
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        // Prevent booking if show already started
        const currentDateTime = new Date();
        const [hours, minutes] = (show.showTime || '00:00').split(':').map(Number);
        const showDateTime = new Date(show.showDate);
        showDateTime.setHours(hours, minutes, 0, 0);

        if (currentDateTime > showDateTime) {
            return res.status(400).json({
                message: "Cannot book. Show has already started."
            });
        }

        // 3️⃣ Double-check seat occupancy (concurrency check)
        const existingBooking = await Booking.find({
            showId,
            seats: { $in: seats },
            status: "Confirmed"
        });

        if (existingBooking.length > 0) {
            return res.status(400).json({
                message: "One or more seats already booked"
            });
        }

        // 4️⃣ Calculate total amount
        const seatDocs = await Seat.find({
            screenId: show.screenId,
            seatNumber: { $in: seats }
        });

        const totalAmount = seatDocs.reduce((sum, seat) => {
            const price = show.ticketPrice?.[seat.seatType] ?? show.ticketPrice?.Regular ?? 0;
            return sum + price;
        }, 0);

        // 5️⃣ Create the booking with transaction details
        const newBooking = new Booking({
            userId,
            showId,
            seats,
            totalAmount,
            paymentMethod: paymentMethod || 'Card',
            paymentStatus: 'Completed',
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        });

        await newBooking.save();

        // 🔔 Spoorthy: Notify user of booking confirmation
        const showDateStr = show.showDate
            ? new Date(show.showDate).toDateString()
            : 'upcoming';
        await createNotification(
            userId,
            `Booking confirmed! 🎉 Show on ${showDateStr} at ${show.showTime}. Total: ₹${totalAmount}.`
        );

        (async () => {
            try {
                const populatedShow = await Show.findById(showId)
                    .populate('movieId')
                    .populate({
                        path: 'screenId',
                        populate: { path: 'theatreId' }
                    });

                if (populatedShow && populatedShow.movieId && populatedShow.screenId && populatedShow.screenId.theatreId) {
                    const movie = populatedShow.movieId;
                    const theatre = populatedShow.screenId.theatreId;
                    const user = req.user;

                    if (user && user.email) {
                        const pdfBuffer = await generateTicketPDF(newBooking, populatedShow, movie, theatre);
                        await sendTicketEmail(user.email, user.name || 'Customer', pdfBuffer, movie.title);
                    }
                }
            } catch (emailErr) {
                console.error('⚠️ Failed to compile ticket or send confirmation email:', emailErr.message);
            }
        })();

        res.status(201).json({
            message: "Booking successful",
            booking: newBooking
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Get Booking History by User
exports.getBookingsByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await Booking.find({ userId })
            .populate('showId')
            .populate('seats');

        res.status(200).json(bookings);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const show = await Show.findById(booking.showId);

        const currentDateTime = new Date();
        const [hours, minutes] = (show.showTime || '00:00').split(':').map(Number);
        const showDateTime = new Date(show.showDate);
        showDateTime.setHours(hours, minutes, 0, 0);

        if (currentDateTime > showDateTime) {
            return res.status(400).json({
                message: "Cannot cancel after show started"
            });
        }

        booking.status = "Cancelled";
        await booking.save();

        // 🔔 Spoorthy: Notify user of booking cancellation
        await createNotification(
            booking.userId.toString(),
            `Your booking has been cancelled. Show was on ${new Date(show.showDate).toDateString()} at ${show.showTime}.`
        );

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// 🔹 Delete All Bookings (Temporary)
exports.deleteAllBookings = async (req, res) => {
    try {
        await Booking.deleteMany({});
        res.status(200).json({ message: "All bookings deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// 🔹 Get Seat Availability for a Show
exports.getSeatAvailability = async (req, res) => {
    try {
        const { showId } = req.params;

        const bookings = await Booking.find({
            showId,
            status: "Confirmed"
        });

        let bookedSeats = [];

        bookings.forEach((booking) => {
            bookedSeats = [...bookedSeats, ...booking.seats];
        });

        res.status(200).json({
            showId,
            bookedSeats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};