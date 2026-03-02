const Movie = require('../models/Movie');

exports.createMovie = async (req, res) => {
    try {
        const { title, duration, genre } = req.body;

        const newMovie = new Movie({
            title,
            duration,
            genre
        });

        await newMovie.save();

        res.status(201).json({
            message: "Movie created successfully",
            movie: newMovie
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};