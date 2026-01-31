import api from './api';
import { API_ENDPOINTS } from '../config/config';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{token: string, message: string}>}
     */
    login: async (email, password) => {
        const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
        return response.data;
    },

    /**
     * Admin login with email and password
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @returns {Promise<{token: string, message: string}>}
     */
    adminLogin: async (email, password) => {
        const response = await api.post(API_ENDPOINTS.ADMIN_LOGIN, { email, password });
        return response.data;
    },

    /**
     * Get currently logged in user details
     * @returns {Promise<Object>} User object with profile details
     */
    getLoggedUser: async () => {
        const response = await api.get(API_ENDPOINTS.LOGGED_USER);
        return response.data;
    },

    /**
     * Register a new user with optional file uploads
     * @param {Object} userData - User registration data (firstName, lastName, email, password, phone, dob)
     * @param {File|null} profileImage - Optional profile image file
     * @param {File|null} aadhaarImage - Optional Aadhaar document image file
     * @param {File|null} licenseImage - Optional driving license image file
     * @returns {Promise<Object>}
     */
    register: async (userData, profileImage = null, aadhaarImage = null, licenseImage = null) => {
        const formData = new FormData();

        // Append required fields
        formData.append('firstName', userData.firstName);
        formData.append('lastName', userData.lastName);
        formData.append('email', userData.email);
        formData.append('password', userData.password);
        formData.append('phone', userData.phone);

        // Append optional date of birth
        if (userData.dob) {
            formData.append('dob', userData.dob);
        }

        // Append optional file uploads
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }
        if (aadhaarImage) {
            formData.append('aadhaarImage', aadhaarImage);
        }
        if (licenseImage) {
            formData.append('licenseImage', licenseImage);
        }

        const response = await api.post(API_ENDPOINTS.REGISTER, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Update currently logged in user profile
     * @param {Object} userData - Updated user data (firstName, lastName, email, phone, dob)
     * @returns {Promise<Object>} Updated user object
     */
    updateProfile: async (userData) => {
        const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, userData);
        return response.data;
    },

    /**
     * Logout user - clears local storage
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

export default authService;
