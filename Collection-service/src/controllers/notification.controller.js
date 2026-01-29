const notificationService = require('../services/notification.service');

class NotificationController {
  async createNotification(req, res) {
    try {
      const notification = await notificationService.createNotification(req.body);
      res.status(201).json({
        success: true,
        data: notification.data,
        message: notification.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAllNotifications(req, res) {
    try {
      const notifications = await notificationService.getAllNotifications(req.query);
      res.json({
        success: true,
        data: notifications.data,
        count: notifications.count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotification(req, res) {
    try {
      const notification = await notificationService.getNotificationById(req.params.id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }
      res.json({
        success: true,
        data: notification.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPublicNotifications(req, res) {
    try {
      const notifications = await notificationService.getPublicNotifications(req.query);
      res.json({
        success: true,
        data: notifications.data,
        count: notifications.count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async verifyNotification(req, res) {
    try {
      const { id } = req.params;
      const verified_by = req.user ? req.user.id : null; // Handle missing user for testing

      const result = await notificationService.verifyNotification(id, verified_by);
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async scheduleCleanup(req, res) {
    try {
      const { id } = req.params;
      const { scheduled_date } = req.body;

      const result = await notificationService.scheduleCleanup(id, scheduled_date);
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const statistics = await notificationService.getStatistics();
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();
