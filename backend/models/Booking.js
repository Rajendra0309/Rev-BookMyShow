const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    bookingDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' }
}, { timestamps: true });
module.exports = mongoose.model('Booking', BookingSchema);