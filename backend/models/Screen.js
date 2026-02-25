const mongoose = require('mongoose');
const ScreenSchema = new mongoose.Schema({
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    screenName: { type: String, required: true },
    totalSeats: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Screen', ScreenSchema);