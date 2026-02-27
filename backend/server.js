const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes (to be added as modules are built)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));// this is for movie-management
// app.use('/api/theatres', require('./routes/theatreRoutes')); // Samarth
// app.use('/api/shows',    require('./routes/showRoutes'));     // Samrudhi
// app.use('/api/bookings', require('./routes/bookingRoutes')); // Samrudhi
// app.use('/api/reports',  require('./routes/reportRoutes'));  // Spoorthy

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));