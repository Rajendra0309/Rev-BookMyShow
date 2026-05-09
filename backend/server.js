const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public endpoints for ALB checks and quick verification.
const distPath = path.join(__dirname, '../frontend/dist');
const indexHtml = path.resolve(distPath, 'index.html');

app.get('/', (req, res) => {
    // If a built frontend exists, serve it at root so render/AWS can return the SPA
    if (fs.existsSync(indexHtml)) {
        return res.sendFile(indexHtml);
    }

    res.status(200).json({ message: 'Rev-BookMyShow backend is running' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/theatres', require('./routes/theatreRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Serve React frontend when a built `dist` exists (works in Render/AWS deployments)
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('/*splat', (req, res) => {
        res.sendFile(indexHtml);
    });
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start backend:', err.message);
        process.exit(1);
    }
};

startServer();