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
    imageUrl: {
        type: String,
        trim: true,
        default: 'https://lh3.googleusercontent.com/gg-dl/AOI_d__vY7RVsuzbE9lU-32eEXMNR_gJ6pqLM-RDYxwG2wVxntl61RjxGPM6BYGM8AdSEutjsWgBlvQsIhdZ3kptBgRB1Jzw7uOHLcCjsurj1G8UdLHSSifnNNSaS2JVtWACNLgGTdZMMqN5QdJlrqXca-kSwsra9Xeag4ygXld1vMv88Yz45A=s1600-rj'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
