const mongoose = require('mongoose');
const TheatreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
    city: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Theatre', TheatreSchema);