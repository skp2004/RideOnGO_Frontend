import axios from 'axios';
import { API_BASE_URL } from '../config/config';

// Create axios instance with default configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // Check for admin token first, then regular token
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('token');
        const token = adminToken || userToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            const { status, data } = error.response;

            // Unauthorized - token expired or invalid
            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Optionally redirect to login
                window.location.href = '/login';
            }

            // Return error message from server if available
            const errorMessage = data?.message || data?.error || 'An error occurred';
            return Promise.reject(new Error(errorMessage));
        }

        // Network error
        if (error.request) {
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        return Promise.reject(error);
    }
);

export default api;
