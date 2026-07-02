import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL_LOCAL || 'http://localhost:5230/api/v1';
const TEAMUSERS_URL = import.meta.env.VITE_TEAMUSERS_ENDPOINT_PATH || '/team-users';

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

export const teamUserApi = {

    async getAllUsers(projectId, globalSearch = '', role = '', isActive = null) {
        try {
            const params = { projectId };

            if (globalSearch) params.globalSearch = globalSearch;
            if (role) params.role = role;
            if (isActive !== null) params.isActive = isActive;

            const response = await apiClient.get(TEAMUSERS_URL, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching team users:', error)
            throw error
        }
    },

    async getUserById(id) {
        try {
            const response = await apiClient.get(`${TEAMUSERS_URL}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error)
            throw error
        }
    },

    async createUser(createResource) {
        try {
            const response = await apiClient.post(TEAMUSERS_URL, createResource)
            return response.data
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    },

    async activateUser(id) {
        try {
            const response = await apiClient.post(`${TEAMUSERS_URL}/${id}/activate`)
            return response.data
        } catch (error) {
            console.error(`Error activating user ${id}:`, error)
            throw error
        }
    },

    async deactivateUser(id) {
        try {
            const response = await apiClient.post(`${TEAMUSERS_URL}/${id}/deactivate`)
            return response.data
        } catch (error) {
            console.error(`Error deactivating user ${id}:`, error)
            throw error
        }
    }
}