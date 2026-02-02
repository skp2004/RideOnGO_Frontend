import api from './api';
import { API_ENDPOINTS } from '../config/config';

/**
 * Booking Service
 * Handles all booking and payment-related API calls
 */
const bookingService = {
    // ============ BOOKINGS ============
    /**
     * Create a new booking
     * @param {Object} bookingData - Booking details
     * @returns {Promise<Object>}
     */
    createBooking: async (bookingData) => {
        const response = await api.post(API_ENDPOINTS.BOOKINGS, bookingData);
        return response.data;
    },

    /**
     * Get booking by ID
     * @param {number} id - Booking ID
     * @returns {Promise<Object>}
     */
    getBookingById: async (id) => {
        const response = await api.get(`${API_ENDPOINTS.BOOKINGS}/${id}`);
        return response.data;
    },

    /**
     * Get all bookings (Admin)
     * @returns {Promise<Array>}
     */
    getAllBookings: async () => {
        const response = await api.get(API_ENDPOINTS.BOOKINGS);
        return response.data;
    },

    /**
     * Get bookings by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Array>}
     */
    getUserBookings: async (userId) => {
        const response = await api.get(`${API_ENDPOINTS.BOOKINGS}/user/${userId}`);
        return response.data;
    },

    /**
     * Update booking status (Admin)
     * @param {number} id - Booking ID
     * @param {string} status - New status (CONFIRMED, ONGOING, COMPLETED, CANCELLED)
     * @returns {Promise<Object>}
     */
    updateBookingStatus: async (id, status) => {
        const response = await api.put(`${API_ENDPOINTS.BOOKINGS}/${id}/status?status=${status}`);
        return response.data;
    },

    /**
     * Cancel a booking
     * @param {number} id - Booking ID
     * @returns {Promise<Object>}
     */
    cancelBooking: async (id) => {
        const response = await api.delete(`${API_ENDPOINTS.BOOKINGS}/${id}`);
        return response.data;
    },

    // ============ RAZORPAY PAYMENTS ============
    /**
     * Create Razorpay order
     * @param {Object} orderData - { bookingId, amount }
     * @returns {Promise<Object>} - { orderId, amount, currency, razorpayKeyId }
     */
    createRazorpayOrder: async (orderData) => {
        const response = await api.post(`${API_ENDPOINTS.PAYMENTS}/create-order`, orderData);
        return response.data;
    },

    /**
     * Verify and save payment after Razorpay checkout
     * @param {Object} paymentData - { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId, paymentMode }
     * @returns {Promise<Object>}
     */
    verifyPayment: async (paymentData) => {
        const response = await api.post(`${API_ENDPOINTS.PAYMENTS}/verify`, paymentData);
        return response.data;
    },

    /**
     * Get payments by booking ID
     * @param {number} bookingId - Booking ID
     * @returns {Promise<Array>}
     */
    getPaymentsByBooking: async (bookingId) => {
        const response = await api.get(`${API_ENDPOINTS.PAYMENTS}/booking/${bookingId}`);
        return response.data;
    },

    /**
     * Get all payments (Admin)
     * @returns {Promise<Array>}
     */
    getAllPayments: async () => {
        const response = await api.get(API_ENDPOINTS.PAYMENTS);
        return response.data;
    },

    // ============ RAZORPAY CHECKOUT HELPER ============
    /**
     * Load Razorpay script dynamically
     * @returns {Promise<boolean>}
     */
    loadRazorpayScript: () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    },

    /**
     * Open Razorpay checkout modal
     * @param {Object} options - Razorpay options
     * @returns {Promise<Object>} - Payment response
     */
    openRazorpayCheckout: (options) => {
        return new Promise((resolve, reject) => {
            const razorpay = new window.Razorpay({
                ...options,
                handler: (response) => {
                    resolve(response);
                },
                modal: {
                    ondismiss: () => {
                        reject(new Error('Payment cancelled by user'));
                    }
                }
            });
            razorpay.open();
        });
    }
};

export default bookingService;
