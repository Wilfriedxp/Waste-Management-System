// notification.service.js
const { WasteNotification, CollectionRequest } = require('../models');
const apiClient = require('../utils/api-client');

class NotificationService {
  async createNotification(data) {
    try {
      const {
        user_id,
        address,
        waste_type,
        estimated_volume = 1,
        notes,
        urgency = 'normal'
      } = data;

      // Basic validation
      if (!user_id || !address || !waste_type) {
        throw new Error('Missing required fields: user_id, address, waste_type');
      }

      // Calculate estimated cost (simple formula - adjust as needed)
      const estimated_cost = estimated_volume * 50; // 50 per unit volume

      // Create notification in database
      const notification = await WasteNotification.create({
        user_id,
        address,
        waste_type,
        estimated_volume: parseFloat(estimated_volume),
        notes: notes || null,
        urgency,
        status: 'pending',
        estimated_cost,
        // Add timestamp for created_at
        created_at: new Date()
      });

      console.log(` Notification saved to database: ID ${notification.id}`);

      return {
        success: true,
        data: notification.toJSON(),
        message: 'Notification created successfully'
      };

    } catch (error) {
      console.error(' Error creating notification:', error);
      throw new Error(`Notification creation failed: ${error.message}`);
    }
  }

  async getAllNotifications(filters = {}) {
    try {
      const notifications = await WasteNotification.findAll({
        where: filters,
        order: [['reported_at', 'DESC']]
      });

      return {
        success: true,
        data: notifications.map(n => n.toJSON()),
        count: notifications.length
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getNotificationById(id) {
    try {
      const notification = await WasteNotification.findByPk(id);

      if (!notification) {
        throw new Error(`Notification with ID ${id} not found`);
      }

      return {
        success: true,
        data: notification.toJSON()
      };
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error);
      throw error;
    }
  }

  async getPublicNotifications(filters = {}) {
    try {
      const notifications = await WasteNotification.findAll({
        where: {
          ...filters,
          public_visibility: true,
          status: 'verified'
        },
        order: [['reported_at', 'DESC']]
      });

      return {
        success: true,
        data: notifications.map(n => n.toJSON()),
        count: notifications.length
      };
    } catch (error) {
      console.error('Error fetching public notifications:', error);
      throw error;
    }
  }

  async verifyNotification(id, verified_by) {
    try {
      const notification = await WasteNotification.findByPk(id);

      if (!notification) {
        throw new Error(`Notification with ID ${id} not found`);
      }

      await notification.update({
        status: 'verified',
        verified_by,
        verified_at: new Date()
      });

      return {
        success: true,
        data: notification.toJSON(),
        message: 'Notification verified successfully'
      };
    } catch (error) {
      console.error(`Error verifying notification ${id}:`, error);
      throw error;
    }
  }

  async scheduleCleanup(id, scheduled_date) {
    try {
      const notification = await WasteNotification.findByPk(id);

      if (!notification) {
        throw new Error(`Notification with ID ${id} not found`);
      }

      await notification.update({
        status: 'scheduled_for_cleanup',
        cleanup_scheduled_date: scheduled_date
      });

      return {
        success: true,
        data: notification.toJSON(),
        message: 'Cleanup scheduled successfully'
      };
    } catch (error) {
      console.error(`Error scheduling cleanup for notification ${id}:`, error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const total = await WasteNotification.count();
      const pending = await WasteNotification.count({ where: { status: 'pending' } });
      const verified = await WasteNotification.count({ where: { status: 'verified' } });
      const scheduled = await WasteNotification.count({ where: { status: 'scheduled_for_cleanup' } });
      const cleaned = await WasteNotification.count({ where: { status: 'cleaned' } });

      return {
        total_notifications: total,
        pending_verification: pending,
        verified: verified,
        scheduled_for_cleanup: scheduled,
        cleaned: cleaned
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
