// ============ SERVER.JS ============
// Main entry point for Waste Management Collection Service
// ===================================

// Load environment variables FIRST
require('dotenv').config();
const { sequelize, syncDatabase } = require('./src/models');

// Core dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const notificationRoutes = require('./src/routes/notification.routes');
const requestRoutes = require('./src/routes/request.routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============ MIDDLEWARE SETUP ============

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-service-key']
}));

// Request logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (custom)
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============ HEALTH CHECK ENDPOINTS ============

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Waste Management Collection Service',
    version: '1.0.0',
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Collection Service',
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'Collection Service',
      error: error.message
    });
  }
});

// ============ BASIC ROUTES ============

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Waste Management Collection Service API ',
    description: 'Microservice for managing waste notifications and collection requests',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      detailed_health: '/health/detailed',
      notifications: '/api/notifications',
      collection_requests: '/api/requests'
    },
    status: 'operational',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/requests', requestRoutes);

// ERROR HANDLING
// 404 handler - FIXED: No '*' parameter
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
      method: req.method,
      timestamp: new Date().toISOString(),
      suggested_routes: ['/', '/health', '/api/notifications', '/api/requests']
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(' Server Error:', {
    error: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const statusCode = err.status || 500;
  const errorResponse = {
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Something went wrong',
      timestamp: new Date().toISOString(),
      path: req.path
    }
  };

  if (NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// ============ DATABASE SYNC AND SERVER START ============

// Sync database models and start server
const startServer = async () => {
  try {
    console.log('Starting database synchronization...');
    await syncDatabase();
    console.log('Database synchronization completed.');

    console.log('Starting server...');
    const server = app.listen(PORT, () => {
      console.log(`
 ===== COLLECTION SERVICE STARTED =====
 Server:     http://localhost:${PORT}
 Environment: ${NODE_ENV}
 API Status: http://localhost:${PORT}/health
 Time:       ${new Date().toISOString()}
========================================
      `);

      console.log('\n Available Endpoints:');
      console.log('  • GET  /health              - Health check');
      console.log('  • GET  /health/detailed     - Detailed health');
      console.log('  • POST /api/notifications   - Create waste notification');
      console.log('  • GET  /api/notifications   - List notifications');
      console.log('  • POST /api/requests        - Create collection request');
      console.log('  • GET  /api/requests        - List collection requests');
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    console.log('Server started successfully and listening for requests...');

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Export app for testing
module.exports = app;
