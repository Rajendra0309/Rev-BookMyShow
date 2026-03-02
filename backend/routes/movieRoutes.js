const express = require('express');
const router = express.Router();

<<<<<<< HEAD
const { createMovie } = require('../controllers/movieController');

router.post('/create', createMovie);
=======
const {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie
} = require('../controllers/movieController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin Routes
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

// Logged-in User Routes
router.get('/', protect, getAllMovies);
router.get('/:id', protect, getMovieById);
>>>>>>> main

module.exports = router;