const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Screen = require('../models/Screen');

// 🔹 Create Show
exports.createShow = async (req, res) => {
    try {
        const { movieId, screenId, showDate, showTime, ticketPrice } = req.body;

        // 1️⃣ Validate movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // 2️⃣ Validate screen exists
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return res.status(404).json({ message: "Screen not found" });
        }

        // 3️⃣ Create show
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


// 🔹 Get All Shows
exports.getAllShows = async (req, res) => {
    try {
        const shows = await Show.find()
            .populate('movieId')
            .populate('screenId');

        res.status(200).json(shows);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Get Single Show By ID
exports.getShowById = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate('movieId')
            .populate('screenId');

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        res.status(200).json(show);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Cancel Show
exports.cancelShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        show.status = "Cancelled";
        await show.save();

        res.status(200).json({ message: "Show cancelled successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};