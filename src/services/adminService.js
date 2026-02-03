import api from './api';
import { API_ENDPOINTS } from '../config/config';

/**
 * Admin Service
 * Handles all admin-related API calls for BMS (Bike Management System)
 */
const adminService = {
    // ============ BRANDS ============
    /**
     * Get all brands
     * @returns {Promise<Array>}
     */
    getBrands: async () => {
        const response = await api.get(API_ENDPOINTS.BRANDS);
        return response.data;
    },

    /**
     * Get brand by ID
     * @param {number} id - Brand ID
     * @returns {Promise<Object>}
     */
    getBrandById: async (id) => {
        const response = await api.get(`${API_ENDPOINTS.BRANDS}/${id}`);
        return response.data;
    },

    /**
     * Create a new brand
     * @param {Object} brandData - Brand data
     * @returns {Promise<Object>}
     */
    createBrand: async (brandData) => {
        const response = await api.post(API_ENDPOINTS.BRANDS, brandData);
        return response.data;
    },

    /**
     * Update a brand
     * @param {number} id - Brand ID
     * @param {Object} brandData - Updated brand data
     * @returns {Promise<Object>}
     */
    updateBrand: async (id, brandData) => {
        const response = await api.put(`${API_ENDPOINTS.BRANDS}/${id}`, brandData);
        return response.data;
    },

    /**
     * Delete a brand
     * @param {number} id - Brand ID
     * @returns {Promise<Object>}
     */
    deleteBrand: async (id) => {
        const response = await api.delete(`${API_ENDPOINTS.BRANDS}/${id}`);
        return response.data;
    },

    // ============ BIKES ============
    /**
     * Get all bikes
     * @returns {Promise<Array>}
     */
    getBikes: async () => {
        const response = await api.get(API_ENDPOINTS.BIKES);
        return response.data;
    },

    /**
     * Get bike by ID
     * @param {number} id - Bike ID
     * @returns {Promise<Object>}
     */
    getBikeById: async (id) => {
        const response = await api.get(`${API_ENDPOINTS.BIKES}/${id}`);
        return response.data;
    },

    /**
     * Create a new bike
     * @param {Object} bikeData - Bike data (FormData for image upload)
     * @returns {Promise<Object>}
     */
    createBike: async (bikeData) => {
        const response = await api.post(API_ENDPOINTS.BIKES, bikeData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Update a bike
     * @param {number} id - Bike ID
     * @param {Object} bikeData - Updated bike data (BikeRequestDTO)
     * @returns {Promise<Object>}
     */
    updateBike: async (id, bikeData) => {
        const response = await api.put(`${API_ENDPOINTS.BIKES}/${id}`, bikeData);
        return response.data;
    },

    /**
     * Delete a bike
     * @param {number} id - Bike ID
     * @returns {Promise<Object>}
     */
    deleteBike: async (id) => {
        const response = await api.delete(`${API_ENDPOINTS.BIKES}/${id}`);
        return response.data;
    },

    // ============ LOCATIONS ============
    /**
     * Get all locations
     * @returns {Promise<Array>}
     */
    getLocations: async () => {
        const response = await api.get(API_ENDPOINTS.LOCATIONS);
        return response.data;
    },

    /**
     * Get location by ID
     * @param {number} id - Location ID
     * @returns {Promise<Object>}
     */
    getLocationById: async (id) => {
        const response = await api.get(`${API_ENDPOINTS.LOCATIONS}/${id}`);
        return response.data;
    },

    /**
     * Create a new location
     * @param {Object} locationData - Location data
     * @returns {Promise<Object>}
     */
    createLocation: async (locationData) => {
        const response = await api.post(API_ENDPOINTS.LOCATIONS, locationData);
        return response.data;
    },

    /**
     * Update a location
     * @param {number} id - Location ID
     * @param {Object} locationData - Updated location data
     * @returns {Promise<Object>}
     */
    updateLocation: async (id, locationData) => {
        const response = await api.put(`${API_ENDPOINTS.LOCATIONS}/${id}`, locationData);
        return response.data;
    },

    /**
     * Delete a location
     * @param {number} id - Location ID
     * @returns {Promise<Object>}
     */
    deleteLocation: async (id) => {
        const response = await api.delete(`${API_ENDPOINTS.LOCATIONS}/${id}`);
        return response.data;
    },

    // ============ ADMIN PROFILE ============
    /**
     * Get current admin profile
     * @returns {Promise<Object>}
     */
    getAdminProfile: async () => {
        const response = await api.get(API_ENDPOINTS.LOGGED_USER);
        return response.data;
    },

    /**
     * Update current admin profile
     * @param {Object} userData - Updated user data (firstName, lastName, phone, dob)
     * @returns {Promise<Object>}
     */
    updateAdminProfile: async (userData) => {
        const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, userData);
        return response.data;
    },

    /**
     * Logout admin - clear token and storage
     */
    logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    },

    // ============ USERS ============
    /**
     * Get all users
     * @returns {Promise<Array>}
     */
    getUsers: async () => {
        const response = await api.get(API_ENDPOINTS.USERS);
        return response.data;
    },

    /**
     * Get user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object>}
     */
    getUserById: async (id) => {
        const response = await api.get(`${API_ENDPOINTS.USERS}/${id}`);
        return response.data;
    },

    /**
     * Delete a user
     * @param {number} id - User ID
     * @returns {Promise<Object>}
     */
    deleteUser: async (id) => {
        const response = await api.delete(`${API_ENDPOINTS.USERS}/${id}`);
        return response.data;
    },

    /**
     * Verify a user (Admin only)
     * Requires user to have both Aadhaar and License uploaded
     * @param {number} userId - User ID
     * @returns {Promise<Object>}
     */
    verifyUser: async (userId) => {
        const response = await api.put(`${API_ENDPOINTS.USERS}/${userId}/verify`);
        return response.data;
    },

    /**
     * Unverify a user (Admin only)
     * @param {number} userId - User ID
     * @returns {Promise<Object>}
     */
    unverifyUser: async (userId) => {
        const response = await api.put(`${API_ENDPOINTS.USERS}/${userId}/unverify`);
        return response.data;
    },
};

export default adminService;
