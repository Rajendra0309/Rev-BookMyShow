const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    showId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show', 
        required: true 
    },
    seats: [{
    type: String,
    required: true
}],
    bookingDate: { 
        type: Date, 
        default: Date.now 
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Confirmed', 'Cancelled'], 
        default: 'Confirmed' 
    },
    paymentMethod: {
        type: String,
        enum: ['Card', 'UPI', 'NetBanking', 'Wallet'],
        default: 'Card'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);