import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
const TEAMWORKERS_URL = import.meta.env.VITE_TEAMWORKERS_ENDPOINT_PATH || '/team-workers'
/**
 * Team Workers API service
 */
export const teamWorkerApi = {
    /**
     * Fetches all team workers
     * @returns {Promise<TeamWorkerEntity[]>} Promise resolving to team workers
     */
    async getAllWorkers() {
        try {
            const response = await axios.get(`${API_BASE_URL}${TEAMWORKERS_URL}`)
            return response.data
        } catch (error) {
            console.error('Error fetching team workers:', error)
            throw error
        }
    },

    /**
     * Fetches a team worker by ID
     * @param {string} id - Worker identifier
     * @returns {Promise<TeamWorkerEntity>} Promise resolving to team worker
     */
    async getWorkerById(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}${TEAMWORKERS_URL}/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching worker ${id}:`, error)
            throw error
        }
    },

    /**
     * Creates a new team worker
     * @param {TeamWorkerEntity} worker - Team worker to create
     * @returns {Promise<TeamWorkerEntity>} Promise resolving to created worker
     */
    async createWorker(worker) {
        try {
            const response = await axios.post(`${API_BASE_URL}${TEAMWORKERS_URL}`, worker)
            return response.data
        } catch (error) {
            console.error('Error creating worker:', error)
            throw error
        }
    },

    /**
     * Updates an existing team worker
     * @param {string} id - Worker identifier
     * @param {TeamWorkerEntity} worker - Updated worker data
     * @returns {Promise<TeamWorkerEntity>} Promise resolving to updated worker
     */
    async updateWorker(id, worker) {
        try {
            const response = await axios.put(`${API_BASE_URL}${TEAMWORKERS_URL}/${id}`, worker)
            return response.data
        } catch (error) {
            console.error(`Error updating worker ${id}:`, error)
            throw error
        }
    },

    /**
     * Deletes a team worker
     * @param {string} id - Worker identifier
     * @returns {Promise<void>} Promise resolving when deleted
     */
    async deleteWorker(id) {
        try {
            await axios.delete(`${API_BASE_URL}${TEAMWORKERS_URL}/${id}`)
        } catch (error) {
            console.error(`Error deleting worker ${id}:`, error)
            throw error
        }
    }
}