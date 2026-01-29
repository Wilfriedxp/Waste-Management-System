const axios = require('axios');

/**
 * API Client for communicating with other microservices
 * This is the communication hub for Collection Service
 */
class ApiClient {
  constructor() {
    // Initialize connections to other services
    this.setupGeoService();
    this.setupUserService();
  }

  /**
   * Setup connection to Geo/Tariff Service
   * This service provides location and pricing
   */
  setupGeoService() {
    this.geoService = axios.create({
      baseURL: process.env.GEO_SERVICE_URL || 'http://localhost:3002/api',
      timeout: parseInt(process.env.GEO_SERVICE_TIMEOUT) || 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': process.env.SERVICE_API_KEY,
        'x-service-name': 'collection-service'
      }
    });

    // Add response interceptor for logging
    this.geoService.interceptors.response.use(
      (response) => {
        console.log(`Geo Service: ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`Geo Service error: ${error.config?.url} - ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup connection to User Service
   * This service manages user accounts and authentication
   */
  setupUserService() {
    this.userService = axios.create({
      baseURL: process.env.USER_SERVICE_URL || 'http://localhost:3001/api',
      timeout: parseInt(process.env.USER_SERVICE_TIMEOUT) || 5000,
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': process.env.SERVICE_API_KEY || 'collection-service-key'
      }
    });

    this.userService.interceptors.response.use(
      (response) => {
        console.log(`User Service: ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`User Service error: ${error.config?.url} - ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get location coordinates and tariff from Geo Service
   * @param {string} address - User's address
   * @param {string} wasteType - Type of waste (plastic, paper, etc.)
   * @param {number} volume - Estimated volume in cubic meters
   * @returns {Promise<Object>} Location and tariff data
   */
  async getLocationAndTariff(address, wasteType, volume = 1) {
    try {
      console.log(`Requesting location/tariff for: ${address.substring(0, 50)}...`);
      
      const payload = {
        address: address.trim(),
        waste_type: wasteType.toLowerCase(),
        volume: parseFloat(volume),
        request_time: new Date().toISOString(),
        service: 'collection-service'
      };

      const response = await this.geoService.post('/locations/process', payload);
      
      // Validate response structure
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response from Geo Service');
      }

      return {
        success: true,
        data: response.data.data || response.data,
        metadata: {
          service: 'geo-service',
          response_time: response.headers['x-response-time'],
          cached: response.headers['x-cached'] === 'true'
        }
      };
    } catch (error) {
      console.error(' Geo Service request failed:', error.message);
      
      // Fallback: Provide default values so our service keeps working
      const fallbackData = {
        latitude: 0,
        longitude: 0,
        estimated_cost: volume * 50, // Default $50 per cubic meter
        currency: 'USD',
        nearest_site: null,
        confidence: 'low',
        message: 'Using default values - Geo Service unavailable'
      };

      return {
        success: false,
        data: fallbackData,
        metadata: {
          service: 'fallback',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get nearby waste collection sites
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @param {number} radius - Search radius in kilometers
   * @returns {Promise<Array>} List of nearby sites
   */
  async getNearbySites(latitude, longitude, radius = 5) {
    try {
      const response = await this.geoService.get('/sites/nearby', {
        params: {
          lat: latitude,
          lng: longitude,
          radius: radius,
          available: true,
          service_type: 'collection'
        }
      });

      return response.data?.sites || [];
    } catch (error) {
      console.error('Failed to get nearby sites:', error.message);
      return [];
    }
  }

  /**
   * Verify user exists in User Service
   * @param {string} userId - User ID from User Service
   * @returns {Promise<Object>} User verification result
   */
  async verifyUser(userId) {
    try {
      const response = await this.userService.get(`/users/${userId}/verify`);
      
      if (!response.data.exists) {
        throw new Error(`User ${userId} not found`);
      }

      return {
        exists: true,
        user: response.data.user,
        verified_at: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`User ${userId} not found in User Service`);
      }
      throw new Error(`User Service error: ${error.message}`);
    }
  }

  /**
   * Get user details from User Service
   * @param {string} userId - User ID from User Service
   * @returns {Promise<Object|null>} User details or null
   */
  async getUserDetails(userId) {
    try {
      const response = await this.userService.get(`/users/${userId}`, {
        params: {
          fields: 'id,email,name,phone,address,role,status'
        }
      });

      return response.data;
    } catch (error) {
      console.warn(` Could not fetch details for user ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * Get available waste collectors for a date
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} area - Optional area/zone
   * @returns {Promise<Array>} Available collectors
   */
  async getAvailableCollectors(date, area = null) {
    try {
      const params = { date };
      if (area) params.area = area;

      const response = await this.userService.get('/users/collectors/available', {
        params
      });

      return response.data?.collectors || [];
    } catch (error) {
      console.error('Failed to get available collectors:', error.message);
      return [];
    }
  }

  /**
   * Health check - verify all services are reachable
   * @returns {Promise<Object>} Health status of all services
   */
  async healthCheck() {
    const services = {
      geo_service: 'unhealthy',
      user_service: 'unhealthy'
    };

    try {
      // Check Geo Service
      const geoResponse = await this.geoService.get('/health', { timeout: 3000 });
      services.geo_service = geoResponse.data?.status === 'OK' ? 'healthy' : 'unhealthy';
    } catch (error) {
      console.error('Geo Service health check failed:', error.message);
    }

    try {
      // Check User Service
      const userResponse = await this.userService.get('/health', { timeout: 3000 });
      services.user_service = userResponse.data?.status === 'OK' ? 'healthy' : 'unhealthy';
    } catch (error) {
      console.error('User Service health check failed:', error.message);
    }

    return {
      timestamp: new Date().toISOString(),
      service: 'api-client',
      services
    };
  }
}

// Create singleton instance
const apiClient = new ApiClient();

module.exports = apiClient;