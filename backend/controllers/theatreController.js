const Theatre = require('../models/Theatre');
const Screen  = require('../models/Screen');
const Seat    = require('../models/Seat');

/* ================================================================
   THEATRE CRUD
   ================================================================ */

// GET /api/theatres
exports.getAllTheatres = async (req, res) => {
    try {
        const { city } = req.query;
        const filter = {};
        if (city) filter.city = { $regex: city, $options: 'i' };

        const theatres = await Theatre.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, total: theatres.length, data: theatres });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/theatres/:id
exports.getTheatreById = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }
        res.status(200).json({ success: true, data: theatre });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/theatres  (Admin only)
exports.createTheatre = async (req, res) => {
    try {
        const { name, location, city } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Theatre name is required' });
        }

        const theatre = await Theatre.create({ name, location, city });
        res.status(201).json({ success: true, message: 'Theatre created successfully', data: theatre });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/theatres/:id  (Admin only)
exports.updateTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }

        const { name, location, city } = req.body;
        if (name)     theatre.name     = name;
        if (location) theatre.location = location;
        if (city)     theatre.city     = city;

        await theatre.save();
        res.status(200).json({ success: true, message: 'Theatre updated successfully', data: theatre });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/theatres/:id  (Admin only)
exports.deleteTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }

        // Delete all seats and screens belonging to this theatre first
        const screens = await Screen.find({ theatreId: req.params.id });
        const screenIds = screens.map(s => s._id);
        await Seat.deleteMany({ screenId: { $in: screenIds } });
        await Screen.deleteMany({ theatreId: req.params.id });
        await theatre.deleteOne();

        res.status(200).json({ success: true, message: 'Theatre and its screens/seats deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/* ================================================================
   SCREEN MANAGEMENT
   ================================================================ */

// GET /api/theatres/:id/screens
exports.getScreensByTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }

        const screens = await Screen.find({ theatreId: req.params.id });
        res.status(200).json({ success: true, total: screens.length, data: screens });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/theatres/:id/screens  (Admin only)
exports.addScreen = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }

        const { screenName, totalSeats } = req.body;
        if (!screenName || !totalSeats) {
            return res.status(400).json({ success: false, message: 'screenName and totalSeats are required' });
        }

        const screen = await Screen.create({
            theatreId: req.params.id,
            screenName,
            totalSeats
        });

        res.status(201).json({ success: true, message: 'Screen added successfully', data: screen });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/screens/:screenId  (Admin only)
exports.updateScreen = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.screenId);
        if (!screen) {
            return res.status(404).json({ success: false, message: 'Screen not found' });
        }

        const { screenName, totalSeats } = req.body;
        if (screenName) screen.screenName = screenName;
        if (totalSeats) {
            // Validate: new totalSeats must be >= current seat count
            const currentSeatCount = await Seat.countDocuments({ screenId: screen._id });
            if (Number(totalSeats) < currentSeatCount) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot reduce totalSeats below current seat count (${currentSeatCount})`
                });
            }
            screen.totalSeats = totalSeats;
        }

        await screen.save();
        res.status(200).json({ success: true, message: 'Screen updated successfully', data: screen });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/screens/:screenId  (Admin only)
exports.deleteScreen = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.screenId);
        if (!screen) {
            return res.status(404).json({ success: false, message: 'Screen not found' });
        }

        // Delete all seats of this screen first
        await Seat.deleteMany({ screenId: screen._id });
        await screen.deleteOne();

        res.status(200).json({ success: true, message: 'Screen and its seats deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


/* ================================================================
   SEAT LAYOUT CONFIGURATION
   ================================================================ */

// GET /api/screens/:screenId/seats
exports.getSeatsByScreen = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.screenId);
        if (!screen) {
            return res.status(404).json({ success: false, message: 'Screen not found' });
        }

        const seats = await Seat.find({ screenId: req.params.screenId }).sort({ seatNumber: 1 });
        res.status(200).json({ success: true, total: seats.length, data: seats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/screens/:screenId/seats  (Admin only)
// Body: { seats: [{ seatNumber: "A1", seatType: "Regular" }, ...] }
exports.addSeats = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.screenId);
        if (!screen) {
            return res.status(404).json({ success: false, message: 'Screen not found' });
        }

        const { seats } = req.body;
        if (!seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ success: false, message: 'seats array is required' });
        }

        // Seating capacity validation
        const currentSeatCount = await Seat.countDocuments({ screenId: screen._id });
        if (currentSeatCount + seats.length > screen.totalSeats) {
            return res.status(400).json({
                success: false,
                message: `Adding ${seats.length} seats would exceed screen capacity of ${screen.totalSeats}. Currently ${currentSeatCount} seats configured.`
            });
        }

        // Check for duplicate seat numbers within this screen
        const existingSeatNumbers = (await Seat.find({ screenId: screen._id }).select('seatNumber'))
            .map(s => s.seatNumber);
        const duplicates = seats.filter(s => existingSeatNumbers.includes(s.seatNumber));
        if (duplicates.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Duplicate seat numbers: ${duplicates.map(d => d.seatNumber).join(', ')}`
            });
        }

        const seatsToInsert = seats.map(s => ({
            screenId: screen._id,
            seatNumber: s.seatNumber,
            seatType: s.seatType || 'Regular'
        }));

        const createdSeats = await Seat.insertMany(seatsToInsert);
        res.status(201).json({
            success: true,
            message: `${createdSeats.length} seat(s) added successfully`,
            data: createdSeats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/screens/:screenId/seats  (Admin only — deletes ALL seats of a screen)
exports.deleteAllSeats = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.screenId);
        if (!screen) {
            return res.status(404).json({ success: false, message: 'Screen not found' });
        }

        const result = await Seat.deleteMany({ screenId: screen._id });
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} seat(s) deleted successfully`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
