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

export const notificationsApi = {
    async getByUser(userId) {
        const response = await apiClient.get('/notifications', { params: { userId } });
        return response.data;
    },
    async accept(id) {
        const response = await apiClient.post(`/notifications/${id}/accept`);
        return response.data;
    },
    async reject(id) {
        const response = await apiClient.post(`/notifications/${id}/reject`);
        return response.data;
    }
};
