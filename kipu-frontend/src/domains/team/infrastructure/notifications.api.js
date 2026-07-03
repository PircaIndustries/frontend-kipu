import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL_LOCAL || 'http://localhost:5230/api/v1';
const NOTIFICATIONS_URL = '/notifications';

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

export const notificationsApi = {

    async getByUser(userId) {
        try {
            const response = await apiClient.get(NOTIFICATIONS_URL, { params: { userId } })
            return response.data
        } catch (error) {
            console.error('Error fetching notifications:', error)
            throw error
        }
    },

    async acceptNotification(id) {
        try {
            const response = await apiClient.post(`${NOTIFICATIONS_URL}/${id}/accept`)
            return response.data
        } catch (error) {
            console.error(`Error accepting notification ${id}:`, error)
            throw error
        }
    },

    async rejectNotification(id) {
        try {
            const response = await apiClient.post(`${NOTIFICATIONS_URL}/${id}/reject`)
            return response.data
        } catch (error) {
            console.error(`Error rejecting notification ${id}:`, error)
            throw error
        }
    }
};
