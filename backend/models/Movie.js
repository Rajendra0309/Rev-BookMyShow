const mongoose = require('mongoose');
const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String },
    language: { type: String },
    duration: { type: Number }, // in minutes
    rating: { type: String },
    description: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Movie', MovieSchema);