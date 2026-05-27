const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    uploadMoviePoster
} = require('../controllers/movieController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin Routes
router.post('/', protect, adminOnly, createMovie);
router.post('/upload', protect, adminOnly, upload.single('image'), uploadMoviePoster);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

// Logged-in User Routes
router.get('/', protect, getAllMovies);
router.get('/:id', protect, getMovieById);

module.exports = router;