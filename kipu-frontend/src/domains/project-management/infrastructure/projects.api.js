import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:3000/api/v1';

/**
 * API client for the Project Management bounded context.
 * Handles CRUD operations and business validations for projects.
 */
export const projectsApi = {
    /**
     * Fetches all projects
     * @returns {Promise<Object[]>} Array of project application
     */
    async getAll() {
        try {
            const response = await axios.get(`${API_BASE_URL}/projects`);
            return response.data;
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    /**
     * Creates a new project
     * @param {Object} project - Project application to create
     * @returns {Promise<Object>} Created project application
     */
    async create(project) {
        try {
            const response = await axios.post(`${API_BASE_URL}/projects`, project);
            return response.data;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    /**
     * Checks if a project name already exists
     * @param {string} name - Project name to check
     * @returns {Promise<boolean>} True if name exists
     */
    async checkNameExists(name) {
        try {
            const response = await axios.get(`${API_BASE_URL}/projects`, {
                params: { name }
            });
            return response.data.length > 0;
        } catch (error) {
            console.error('Error checking project name:', error);
            return false;
        }
    },

    /**
     * Updates the status of a project
     * @param {string} id - Project identifier
     * @param {{ status: string, statusJustification?: string }} payload
     * @returns {Promise<Object>} Updated project application
     */
    async updateStatus(id, payload) {
        try {
            const response = await axios.patch(`${API_BASE_URL}/projects/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating project status ${id}:`, error);
            throw error;
        }
    },

    /**
     * Deletes a project by ID
     * @param {string} id - Project identifier
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await axios.delete(`${API_BASE_URL}/projects/${id}`);
        } catch (error) {
            console.error(`Error deleting project ${id}:`, error);
            throw error;
        }
    }
};
