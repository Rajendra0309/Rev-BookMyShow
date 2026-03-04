const Booking = require('../models/Booking');
const Show = require('../models/Show');

// 🔹 Create Booking
exports.createBooking = async (req, res) => {
    try {
        const { userId, showId, seats } = req.body;

        // 1️⃣ Check if show exists
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }
        // Prevent booking if show already started
        const currentDateTime = new Date();
        const [hours, minutes] = show.showTime.split(':').map(Number);
        const showDateTime = new Date(show.showDate);
        showDateTime.setHours(hours, minutes, 0, 0);

        if (currentDateTime > showDateTime) {
            return res.status(400).json({
                message: "Cannot book. Show already started."
            });
        }

        // 2️⃣ Check if show is cancelled
        if (show.status === "Cancelled") {
            return res.status(400).json({
                message: "Cannot book cancelled show"
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
        const totalAmount = show.ticketPrice * seats.length;

        // 5️⃣ Create booking
        const newBooking = new Booking({
            userId,
            showId,
            seats,
            totalAmount
        });

        await newBooking.save();

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
        const { userId } = req.params;

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

        if (!show) {
            return res.status(404).json({ message: "Associated show not found" });
        }

        const currentDateTime = new Date();
        const [hours, minutes] = show.showTime.split(':').map(Number);
        const showDateTime = new Date(show.showDate);
        showDateTime.setHours(hours, minutes, 0, 0);

        if (currentDateTime > showDateTime) {
            return res.status(400).json({
                message: "Cannot cancel after show started"
            });
        }

        booking.status = "Cancelled";
        await booking.save();

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