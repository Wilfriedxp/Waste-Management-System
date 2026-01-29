// request.service.js
const { CollectionRequest } = require('../models');
const apiClient = require('../utils/api-client');

class RequestService {
  async createRequest(data) {
    try {
      const {
        user_id,
        pickup_address,
        waste_types,
        estimated_volume = 1,
        preferred_date,
        preferred_time_slot,
        notes,
        urgency = 'normal',
        contact_phone,
        contact_email
      } = data;

      // Basic validation
      if (!user_id || !pickup_address || !waste_types || !Array.isArray(waste_types)) {
        throw new Error('Missing required fields: user_id, pickup_address, waste_types (array)');
      }

      // Create request in database
      const request = await CollectionRequest.create({
        user_id,
        pickup_address,
        waste_types,
        estimated_volume: parseFloat(estimated_volume),
        preferred_date: preferred_date ? new Date(preferred_date) : null,
        preferred_time_slot,
        notes: notes || null,
        urgency,
        status: 'pending',
        contact_phone,
        contact_email,
        // Add timestamp for requested_at
        requested_at: new Date()
      });

      console.log(`Collection request saved to database: ID ${request.id}`);

      return {
        success: true,
        data: request.toJSON(),
        message: 'Collection request created successfully'
      };

    } catch (error) {
      console.error('Error creating collection request:', error);
      throw new Error(`Collection request creation failed: ${error.message}`);
    }
  }

  async getAllRequests(filters = {}) {
    try {
      const requests = await CollectionRequest.findAll({
        where: filters,
        order: [['requested_at', 'DESC']]
      });

      return {
        success: true,
        data: requests.map(r => r.toJSON()),
        count: requests.length
      };
    } catch (error) {
      console.error('Error fetching collection requests:', error);
      throw error;
    }
  }

  async getRequestById(id) {
    try {
      const request = await CollectionRequest.findByPk(id);

      if (!request) {
        throw new Error(`Collection request with ID ${id} not found`);
      }

      return {
        success: true,
        data: request.toJSON()
      };
    } catch (error) {
      console.error(`Error fetching collection request ${id}:`, error);
      throw error;
    }
  }

  async updateRequestStatus(id, status, additionalData = {}) {
    try {
      const request = await CollectionRequest.findByPk(id);

      if (!request) {
        throw new Error(`Collection request with ID ${id} not found`);
      }

      const updateData = { status, ...additionalData };

      if (status === 'scheduled' && additionalData.scheduled_date) {
        updateData.scheduled_date = new Date(additionalData.scheduled_date);
        updateData.scheduled_time = additionalData.scheduled_time;
        updateData.assigned_collector_id = additionalData.assigned_collector_id;
      }

      if (status === 'completed') {
        updateData.completed_at = new Date();
      }

      await request.update(updateData);

      return {
        success: true,
        data: request.toJSON(),
        message: 'Collection request updated successfully'
      };
    } catch (error) {
      console.error(`Error updating collection request ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new RequestService();
