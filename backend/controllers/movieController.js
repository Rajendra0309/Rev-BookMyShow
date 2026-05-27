const Movie = require('../models/Movie');
const { notifyCustomersForMovie } = require('../services/movieNotificationService');
const { uploadToS3 } = require('../utils/s3Upload');

/* ======================================================
   CREATE MOVIE (Admin Only)
   ====================================================== */
exports.createMovie = async (req, res) => {
    try {
        const { title, genre, language, duration, rating, description, imageUrl } = req.body;

        const normalizedTitle = String(title || '').trim();
        const existingMovie = await Movie.findOne({
            title: { $regex: `^${normalizedTitle.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, $options: 'i' }
        });

        if (existingMovie) {
            if (existingMovie.status === 'Active') {
                return res.status(400).json({
                    success: false,
                    message: "Movie with this title already exists"
                });
            }

            existingMovie.genre = genre;
            existingMovie.language = language;
            existingMovie.duration = duration;
            existingMovie.rating = rating;
            existingMovie.description = description;
            existingMovie.imageUrl = imageUrl;
            existingMovie.status = 'Active';
            await existingMovie.save();

            notifyCustomersForMovie(existingMovie).catch((error) => {
                console.error('Customer movie notification failed:', error.message);
            });

            return res.status(200).json({
                success: true,
                message: "Movie reactivated successfully",
                data: existingMovie
            });
        }

        const movie = await Movie.create({
            title: normalizedTitle,
            genre,
            language,
            duration,
            rating,
            description,
            imageUrl
        });

        // Run notification flow in background so movie creation remains fast.
        notifyCustomersForMovie(movie).catch((error) => {
            console.error('Customer movie notification failed:', error.message);
        });

        res.status(201).json({
            success: true,
            message: "Movie created successfully",
            data: movie
        });

    } catch (error) {

        // Duplicate title error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Movie with this title already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ======================================================
   GET ALL MOVIES (Only Active + Filters + Pagination)
   ====================================================== */
exports.getAllMovies = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        let filter = { status: 'Active' };

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };

            filter.$or = [
                { title: searchRegex },
                { language: searchRegex },
                { genre: searchRegex }
            ];
        }

        const total = await Movie.countDocuments(filter);

        const movies = await Movie.find(filter)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: movies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ======================================================
   GET MOVIE BY ID (Only if Active)
   ====================================================== */
exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findOne({
            _id: req.params.id,
            status: 'Active'
        });

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        res.status(200).json({
            success: true,
            data: movie
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ======================================================
   UPDATE MOVIE (Admin Only + Only Active)
   ====================================================== */
exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findOne({
            _id: req.params.id,
            status: 'Active'
        });

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found or inactive"
            });
        }

        Object.assign(movie, req.body);
        await movie.save();

        res.status(200).json({
            success: true,
            message: "Movie updated successfully",
            data: movie
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Movie title must be unique"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ======================================================
   SOFT DELETE MOVIE (Admin Only)
   ====================================================== */
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        movie.status = 'Inactive';
        await movie.save();

        res.status(200).json({
            success: true,
            message: "Movie deactivated successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ======================================================
   UPLOAD MOVIE POSTER TO S3 (Admin Only)
   ====================================================== */
exports.uploadMoviePoster = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: "Only image files are allowed"
            });
        }

        const imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully to AWS S3",
            imageUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};