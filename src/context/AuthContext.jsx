import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create the auth context
const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the app and provides auth state
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing token and fetch user on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const userData = await authService.getLoggedUser();
                    setUser(userData);
                    setToken(storedToken);
                } catch (err) {
                    // Token is invalid, clear it
                    console.error('Failed to fetch user:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    /**
     * Login user with email and password
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} User data
     */
    const login = async (email, password) => {
        setError(null);
        try {
            // Call login API
            const response = await authService.login(email, password);
            const { token: authToken } = response;

            // Store token
            localStorage.setItem('token', authToken);
            setToken(authToken);

            // Fetch user details
            const userData = await authService.getLoggedUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (err) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    /**
     * Register a new user with optional file uploads
     * @param {Object} userData - User registration data
     * @param {File|null} profileImage - Optional profile image
     * @param {File|null} aadhaarImage - Optional aadhaar document
     * @param {File|null} licenseImage - Optional license document
     * @returns {Promise<Object>} Registration response
     */
    const register = async (userData, profileImage = null, aadhaarImage = null, licenseImage = null) => {
        setError(null);
        try {
            const response = await authService.register(userData, profileImage, aadhaarImage, licenseImage);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    /**
     * Logout user and clear auth state
     */
    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
        setError(null);
    };

    /**
     * Refresh user data from API
     */
    const refreshUser = async () => {
        if (!token) return null;

        try {
            const userData = await authService.getLoggedUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (err) {
            console.error('Failed to refresh user:', err);
            return null;
        }
    };

    // Context value
    const value = {
        user,
        token,
        loading,
        isLoading: loading, // Alias for compatibility
        error,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
        setError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
