import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const TEAMUSERS_URL = import.meta.env.VITE_TEAMUSERS_ENDPOINT_PATH;
export const teamUserApi = {
    /**
     * Fetches all team users
     * @returns {Promise<TeamUserEntity[]>} Promise resolving to team users
     */
    async getAllUsers() {
        try {
            const response = await axios.get(`${API_BASE_URL}${TEAMUSERS_URL}`)
            return response.data
        } catch (error) {
            console.error('Error fetching team users:', error)
            throw error
        }
    },

    /**
     * Fetches a team user by ID
     * @param {string} id - User identifier
     * @returns {Promise<TeamUserEntity>} Promise resolving to team user
     */
    async getUserById(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/team-users/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error)
            throw error
        }
    },

    /**
     * Creates a new team user
     * @param {TeamUserEntity} user - Team user to create
     * @returns {Promise<TeamUserEntity>} Promise resolving to created user
     */
    async createUser(user) {
        try {
            const response = await axios.post(`${API_BASE_URL}/team-users`, user)
            return response.data
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    },

    /**
     * Updates an existing team user
     * @param {string} id - User identifier
     * @param {TeamUserEntity} user - Updated user application
     * @returns {Promise<TeamUserEntity>} Promise resolving to updated user
     */
    async updateUser(id, user) {
        try {
            const response = await axios.put(`${API_BASE_URL}/team-users/${id}`, user)
            return response.data
        } catch (error) {
            console.error(`Error updating user ${id}:`, error)
            throw error
        }
    },

    /**
     * Deletes a team user
     * @param {string} id - User identifier
     * @returns {Promise<void>} Promise resolving when deleted
     */
    async deleteUser(id) {
        try {
            await axios.delete(`${API_BASE_URL}/team-users/${id}`)
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error)
            throw error
        }
    }
}