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
            const userStr = localStorage.getItem('currentUser');
            let userId = '';
            if (userStr) {
                const user = JSON.parse(userStr);
                userId = user.id;
            }
            const response = await apiClient.get('/projects', { params: { userId } });
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
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                project.CreatorUserId = user.id.toString();
                project.CreatorEmail = user.email;
                project.CreatorFullName = user.name || user.email;
            }
            const response = await apiClient.post('/projects', project);
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
            const userStr = localStorage.getItem('currentUser');
            let userId = '';
            if (userStr) {
                const user = JSON.parse(userStr);
                userId = user.id;
            }
            const response = await apiClient.get('/projects', { params: { userId } });
            return response.data.some(p => p.name.toLowerCase() === name.toLowerCase());
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
            const response = await apiClient.patch(`/projects/${id}`, payload);
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
            await apiClient.delete(`/projects/${id}`);
        } catch (error) {
            console.error(`Error deleting project ${id}:`, error);
            throw error;
        }
    }
};
