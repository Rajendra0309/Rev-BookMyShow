// const mongoose = require('mongoose');
// const MovieSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     genre: { type: String },
//     language: { type: String },
//     duration: { type: Number }, // in minutes
//     rating: { type: String },
//     description: { type: String }
// }, { timestamps: true });
// module.exports = mongoose.model('Movie', MovieSchema);

// // new schema by madhusudan
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true, 
        unique: true 
    },
    genre: { 
        type: [String], 
        default: [] 
    },
    language: { 
        type: String, 
        trim: true 
    },
    duration: { 
        type: Number, 
        min: 1 
    },
    rating: { 
        type: Number, 
        min: 0, 
        max: 10 
    },
    description: { 
        type: String 
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
