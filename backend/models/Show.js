const mongoose = require('mongoose');
const ShowSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
    showDate: { type: Date, required: true },
    showTime: { type: String, required: true },
    ticketPrice: {
        Regular: { type: Number, default: 0 },
        Premium: { type: Number, default: 0 },
        VIP: { type: Number, default: 0 }
    },
    status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' }
}, { timestamps: true });
module.exports = mongoose.model('Show', ShowSchema);