// API Configuration Constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

// Image Configuration Constants
export const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || '';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/ums/users/signin',
    ADMIN_LOGIN: '/ums/users/admin/signin',
    LOGGED_USER: '/ums/users/me',
    REGISTER: '/ums/users/signup',
    UPDATE_PROFILE: '/ums/users/me',

    // User endpoints
    USERS: '/ums/users',

    // BMS endpoints (Bike Management System)
    BRANDS: '/bms/brands',
    BIKES: '/bms/bikes',
    LOCATIONS: '/bms/locations',
};
