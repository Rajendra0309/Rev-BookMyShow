const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Unread', 'Read'], default: 'Unread' }
}, { timestamps: true });
module.exports = mongoose.model('Notification', NotificationSchema);