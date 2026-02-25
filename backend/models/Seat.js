const mongoose = require('mongoose');
const SeatSchema = new mongoose.Schema({
    screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
    seatNumber: { type: String, required: true },
    seatType: { type: String, enum: ['Regular', 'Premium', 'VIP'], default: 'Regular' }
}, { timestamps: true });
module.exports = mongoose.model('Seat', SeatSchema);