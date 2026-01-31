const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

const express = require('express');
const cors = require('cors');
const sequelize = require('../config/database');
require('./models/index');

const app = express();
const jobroutes = require('./routes/jobroutes');

// 1. Better CORS (Explicitly allow your frontend port)
app.use(cors({
  origin: 'http://localhost:3001' 
}));

app.use(express.json());

// 2. LOGGING MIDDLEWARE (Add this!)
// This tells you in the terminal EVERY time a request hits your server.
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} request to ${req.url}`);
  next();
});

app.use('/api', jobroutes);

const PORT = 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected!');

    await sequelize.sync({ alter: true });
    console.log(' Database Synced');

    app.listen(PORT, () => {
      console.log(` Server is officially listening on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1); 
  }
}

startServer();