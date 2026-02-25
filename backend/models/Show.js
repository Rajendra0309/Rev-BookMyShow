const mongoose = require('mongoose');
const ShowSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
    showDate: { type: Date, required: true },
    showTime: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' }
}, { timestamps: true });
module.exports = mongoose.model('Show', ShowSchema);