import axios from 'axios'

// Usamos el puerto local de .NET Core
const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL_LOCAL || 'http://localhost:5230/api/v1'
const TEAMWORKERS_URL = '/team-workers'

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

export const teamWorkerApi = {
    /**
     * Consume el endpoint: GET /api/v1/teamworkers?projectId=...
     */
    async getAllWorkers(projectId, globalSearch = '') {
        try {
            const params = { projectId }
            if (globalSearch) params.globalSearch = globalSearch

            const response = await apiClient.get(TEAMWORKERS_URL, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching team workers:', error)
            throw error
        }
    },

    async getWorkerById(id) {
        try {
            const response = await apiClient.get(`${TEAMWORKERS_URL}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching worker ${id}:`, error)
            throw error
        }
    },

    /**
     * Envía CreateTeamWorkerResource
     */
    async createWorker(workerResource) {
        try {
            const response = await apiClient.post(TEAMWORKERS_URL, workerResource)
            return response.data
        } catch (error) {
            console.error('Error creating worker:', error)
            throw error
        }
    },

    /**
     * Consume el endpoint DELETE de C#
     */
    async deleteWorker(id) {
        try {
            await apiClient.delete(`${TEAMWORKERS_URL}/${id}`)
        } catch (error) {
            console.error(`Error deleting worker ${id}:`, error)
            throw error
        }
    },

    /**
     * Command: POST /api/v1/teamworkers/{id}/machineries
     */
    async assignMachinery(teamWorkerId, machineryResource) {
        try {
            const response = await apiClient.post(`${TEAMWORKERS_URL}/${teamWorkerId}/machineries`, machineryResource)
            return response.data
        } catch (error) {
            console.error(`Error assigning machinery to worker ${teamWorkerId}:`, error)
            throw error
        }
    },

    /**
     * Command: DELETE /api/v1/teamworkers/{id}/machineries/{id}
     */
    async removeMachinery(teamWorkerId, machineryId) {
        try {
            const response = await apiClient.delete(`${TEAMWORKERS_URL}/${teamWorkerId}/machineries/${machineryId}`)
            return response.data
        } catch (error) {
            console.error(`Error removing machinery from worker ${teamWorkerId}:`, error)
            throw error
        }
    }
}