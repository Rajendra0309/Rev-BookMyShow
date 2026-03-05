const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Screen = require('../models/Screen');


// ================= CREATE SHOW =================
exports.createShow = async (req, res) => {
    try {

        const { movieId, screenId, showDate, showTime, ticketPrice } = req.body;

        // Validate movie
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Validate screen
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).json({ message: "Screen not found" });
        }

        // Prevent duplicate show
        const existingShow = await Show.findOne({
            screenId,
            showDate,
            showTime
        });

        if (existingShow) {
            return res.status(400).json({
                message: "A show already exists on this screen at the same time."
            });
        }

        // Create show
        const newShow = new Show({
            movieId,
            screenId,
            showDate,
            showTime,
            ticketPrice
        });

        await newShow.save();

        res.status(201).json({
            message: "Show created successfully",
            show: newShow
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllShows = async (req, res) => {
    try {
        const { movieId } = req.query;
        const filter = movieId ? { movieId } : {};

        const shows = await Show.find(filter)
            .populate('movieId')
            .populate({
                path: 'screenId',
                populate: {
                    path: 'theatreId'
                }
            })
            .sort({ showDate: 1, showTime: 1 });

        res.status(200).json(shows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= GET SHOW BY ID =================
exports.getShowById = async (req, res) => {
    try {

        const show = await Show.findById(req.params.id)
            .populate('movieId')
            .populate({
                path: 'screenId',
                populate: {
                    path: 'theatreId'
                }
            });

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        res.status(200).json(show);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= CANCEL SHOW =================
exports.cancelShow = async (req, res) => {
    try {

        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        show.status = "Cancelled";

        await show.save();

        res.status(200).json({
            message: "Show cancelled successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= UPDATE SHOW =================
exports.updateShow = async (req, res) => {
    try {

        const { screenId, showDate, showTime, ticketPrice } = req.body;

        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        // Prevent duplicate show during update
        const existingShow = await Show.findOne({
            screenId,
            showDate,
            showTime,
            _id: { $ne: req.params.id }
        });

        if (existingShow) {
            return res.status(400).json({
                message: "Another show already exists at this time."
            });
        }

        // Update fields
        if (screenId) show.screenId = screenId;
        if (showDate) show.showDate = showDate;
        if (showTime) show.showTime = showTime;
        if (ticketPrice) show.ticketPrice = ticketPrice;

        await show.save();

        res.status(200).json({
            message: "Show updated successfully",
            show
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        if (show.status === 'Cancelled') {
            return res.status(400).json({ message: "Cannot edit a cancelled show" });
        }

        const { showDate, showTime, ticketPrice } = req.body;
        if (showDate) show.showDate = showDate;
        if (showTime) show.showTime = showTime;
        if (ticketPrice) show.ticketPrice = ticketPrice;

        await show.save();

        res.status(200).json({ message: "Show updated successfully", show });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};