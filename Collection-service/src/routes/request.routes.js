const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const requestController = require('../controllers/request.controller');

// Public routes (no auth required)
// router.get('/public', requestController.getPublicRequests);

// User routes
router.post('/', requestController.createRequest);
router.get('/', requestController.getAllRequests);
router.get('/:id', requestController.getRequest);

// Admin-only routes
router.put('/:id/status', adminOnly, requestController.updateRequestStatus);
// router.get('/statistics', adminOnly, requestController.getStatistics);

module.exports = router;
