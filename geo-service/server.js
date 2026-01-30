// server.js
const express = require('express');
const cors = require('cors');
const tariffRoutes = require('./tariff');
const siteRoutes = require('./site');

const app = express();
const PORT = 8002; // Geo/Tariff Service Port

// Middleware
app.use(cors()); // Allow frontend to talk to us
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/tariffs', tariffRoutes); // Endpoints: /api/tariffs
app.use('/api/sites', siteRoutes);     // Endpoints: /api/sites

// Health Check
app.get('/', (req, res) => {
    res.send("Douala Waste Geo/Tariff Service is Running...");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Geo/Tariff Service running on http://localhost:${PORT}`);
});