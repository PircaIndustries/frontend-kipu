import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:5230/api/v1';

/**
 * API client for the Identity bounded context.
 * Handles registration, login and email availability checks.
 */
export const identityApi = {
    /**
     * Registers a new user identity
     * @param {{ name: string, email: string, password: string, role: string }} identity
     * @returns {Promise<Object>} Created identity application
     */
    async register(identity) {
        try {
            const response = await axios.post(`${API_BASE_URL}/identities`, identity);
            return response.data;
        } catch (error) {
            console.error('Error registering identity:', error);
            throw error;
        }
    },

    /**
     * Checks if an email is already registered in the system
     * @param {string} email
     * @returns {Promise<boolean>} True if email exists
     */
    async checkEmailExists(email) {
        try {
            const response = await axios.get(`${API_BASE_URL}/identities`, {
                params: { email }
            });
            return response.data.length > 0;
        } catch (error) {
            console.error('Error checking email existence:', error);
            return false;
        }
    },

    /**
     * Authenticates a user with email and password
     * @param {{ email: string, password: string }} credentials
     * @returns {Promise<Object|null>} User application if credentials match, null otherwise
     */
    async login(credentials) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: credentials.email,
                password: credentials.password
            });
            // The real backend returns the authenticated user object or token
            return response.data || null;
        } catch (error) {
            console.error('Error during login:', error);
            // Return null for 400/401/405 to represent invalid credentials
            if (error.response && (error.response.status === 401 || error.response.status === 400 || error.response.status === 405)) {
                return null;
            }
            throw error;
        }
    },

    async verifyLogin(email, code, rememberMe) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/verify-login`, {
                email, code, rememberMe
            });
            return response.data;
        } catch (error) {
            console.error('Error verifying login:', error);
            throw error;
        }
    },

    async forgotPassword(email) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
            return response.data;
        } catch (error) {
            console.error('Error in forgot password:', error);
            throw error;
        }
    },

    async resetPassword(email, code, newPassword) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
                email, code, newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
};
