import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:5230/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch (e) {
            console.error('Error parsing currentUser from localStorage', e);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const identityApi = {
    async register(identity) {
        try {
            const response = await apiClient.post('/identities', identity);
            return response.data;
        } catch (error) {
            console.error('Error registering identity:', error);
            throw error;
        }
    },

    async getAllUsers() {
        try {
            const response = await apiClient.get('/identities');
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            return [];
        }
    },

    async checkEmailExists(email) {
        try {
            const response = await apiClient.get('/identities', {
                params: { email }
            });
            return response.data.length > 0;
        } catch (error) {
            console.error('Error checking email existence:', error);
            return false;
        }
    },

    async login(credentials) {
        try {
            const response = await apiClient.post('/auth/login', {
                email: credentials.email,
                password: credentials.password,
                rememberMe: credentials.rememberMe || false
            });
            return response.data || null;
        } catch (error) {
            console.error('Error during login:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 400 || error.response.status === 405)) {
                return null;
            }
            throw error;
        }
    },

    async verifyLogin(email, code, rememberMe) {
        try {
            const response = await apiClient.post('/auth/verify-login', {
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
            const response = await apiClient.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            console.error('Error in forgot password:', error);
            throw error;
        }
    },

    async resetPassword(email, code, newPassword) {
        try {
            const response = await apiClient.post('/auth/reset-password', {
                email, code, newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
};
