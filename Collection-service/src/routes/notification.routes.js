const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

// Public routes (no auth required)
router.get('/public', notificationController.getPublicNotifications);

// Temporarily make POST public for testing
router.post('/', notificationController.createNotification);

// User routes
router.get('/', notificationController.getAllNotifications);
router.get('/:id', notificationController.getNotification);

// Admin-only routes
router.put('/:id/verify', adminOnly, notificationController.verifyNotification);
router.put('/:id/schedule-cleanup', adminOnly, notificationController.scheduleCleanup);
router.get('/statistics', adminOnly, notificationController.getStatistics);

module.exports = router;