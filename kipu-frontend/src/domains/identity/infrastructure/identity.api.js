import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:3000/api/v1';

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
            const response = await axios.get(`${API_BASE_URL}/identities`, {
                params: { email: credentials.email }
            });
            const user = response.data.find(
                u => u.email === credentials.email && u.password === credentials.password
            );
            return user || null;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    }
};
