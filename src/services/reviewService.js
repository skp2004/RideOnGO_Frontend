import api from './api';
import { API_ENDPOINTS } from '../config/config';

/**
 * Review Service
 * Handles all review-related API calls
 */
const reviewService = {
    /**
     * Get all reviews (for homepage and admin)
     * @returns {Promise<Array>}
     */
    getAllReviews: async () => {
        const response = await api.get(API_ENDPOINTS.REVIEWS);
        return response.data;
    },

    /**
     * Get reviews for a specific bike
     * @param {number} bikeId - Bike ID
     * @returns {Promise<Array>}
     */
    getReviewsByBike: async (bikeId) => {
        const response = await api.get(`${API_ENDPOINTS.REVIEWS}/bike/${bikeId}`);
        return response.data;
    },

    /**
     * Add a new review
     * @param {Object} reviewData - Review data (rating, comments, bikeId)
     * @returns {Promise<Object>}
     */
    addReview: async (reviewData) => {
        const response = await api.post(API_ENDPOINTS.REVIEWS, reviewData);
        return response.data;
    },

    /**
     * Update an existing review
     * @param {number} reviewId - Review ID
     * @param {Object} reviewData - Updated review data
     * @returns {Promise<Object>}
     */
    updateReview: async (reviewId, reviewData) => {
        const response = await api.put(`${API_ENDPOINTS.REVIEWS}/${reviewId}`, reviewData);
        return response.data;
    },

    /**
     * Delete a review
     * @param {number} reviewId - Review ID
     * @returns {Promise<string>}
     */
    deleteReview: async (reviewId) => {
        const response = await api.delete(`${API_ENDPOINTS.REVIEWS}/${reviewId}`);
        return response.data;
    },
};

export default reviewService;
