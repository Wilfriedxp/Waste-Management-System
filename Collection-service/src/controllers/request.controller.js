const requestService = require('../services/request.service');

class RequestController {
  async createRequest(req, res) {
    try {
      const request = await requestService.createRequest(req.body);
      res.status(201).json({
        success: true,
        data: request.data,
        message: request.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAllRequests(req, res) {
    try {
      const requests = await requestService.getAllRequests(req.query);
      res.json({
        success: true,
        data: requests.data,
        count: requests.count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getRequest(req, res) {
    try {
      const request = await requestService.getRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Collection request not found'
        });
      }
      res.json({
        success: true,
        data: request.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, ...additionalData } = req.body;

      const result = await requestService.updateRequestStatus(id, status, additionalData);
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
}

module.exports = new RequestController();
