const mongoose = require('mongoose');
const BookingSeatSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true }
});
module.exports = mongoose.model('BookingSeat', BookingSeatSchema);