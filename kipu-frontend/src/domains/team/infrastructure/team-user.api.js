import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL_LOCAL || 'http://localhost:5230/api/v1';
const TEAMUSERS_URL = import.meta.env.VITE_TEAMUSERS_ENDPOINT_PATH || '/team-users';

export const teamUserApi = {

    async getAllUsers(projectId, globalSearch = '', role = '', isActive = null) {
        try {
            const params = { projectId };

            if (globalSearch) params.globalSearch = globalSearch;
            if (role) params.role = role;
            if (isActive !== null) params.isActive = isActive;

            const response = await axios.get(`${API_BASE_URL}${TEAMUSERS_URL}`, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching team users:', error)
            throw error
        }
    },

    async getUserById(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}${TEAMUSERS_URL}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error)
            throw error
        }
    },

    async createUser(createResource) {
        try {
            const response = await axios.post(`${API_BASE_URL}${TEAMUSERS_URL}`, createResource)
            return response.data
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    },

    async activateUser(id) {
        try {
            const response = await axios.post(`${API_BASE_URL}${TEAMUSERS_URL}/${id}/activate`)
            return response.data
        } catch (error) {
            console.error(`Error activating user ${id}:`, error)
            throw error
        }
    },

    async deactivateUser(id) {
        try {
            const response = await axios.post(`${API_BASE_URL}${TEAMUSERS_URL}/${id}/deactivate`)
            return response.data
        } catch (error) {
            console.error(`Error deactivating user ${id}:`, error)
            throw error
        }
    }
}