import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:5230/api/v1';

const apiClient = axios.create({
    baseURL: BASE_URL
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

export class WasteRepository {
    // ==========================================
    // MATERIAL WASTE (MERMAS)
    // ==========================================

    async getMaterialWastes() {
        try {
            const { data } = await apiClient.get('/materials/waste'); // Cambiado
            return data;
        } catch (error) {
            console.error("Error al obtener registros de mermas:", error);
            return [];
        }
    }

    async getMaterialWasteById(id) {
        try {
            const { data } = await apiClient.get(`/materials/waste/${id}`); // Cambiado
            return data;
        } catch (error) {
            console.error(`Error al obtener la merma con ID ${id}:`, error);
            return null;
        }
    }

    async createMaterialWaste(wasteData) {
        try {
            const { data } = await apiClient.post('/materials/waste', wasteData); // Cambiado
            return data;
        } catch (error) {
            console.error("Error al guardar registro de merma:", error);
            throw error;
        }
    }

    async updateMaterialWaste(id, wasteData) {
        try {
            const { data } = await apiClient.put(`/materials/waste/${id}`, wasteData); // Cambiado
            return data;
        } catch (error) {
            console.error(`Error al actualizar la merma con ID ${id}:`, error);
            throw error;
        }
    }

    async deleteMaterialWaste(id) {
        try {
            const { data } = await apiClient.delete(`/materials/waste/${id}`); // Cambiado
            return data;
        } catch (error) {
            console.error(`Error al eliminar la merma con ID ${id}:`, error);
            throw error;
        }
    }

    // ==========================================
    // WASTE CLASSIFICATIONS
    // ==========================================

    async getWasteClassifications() {
        try {
            const { data } = await apiClient.get('/wasteclassifications'); // Cambiado
            return data;
        } catch (error) {
            console.error("Error al obtener clasificaciones de mermas:", error);
            return [];
        }
    }

    async createWasteClassification(classificationData) {
        try {
            const { data } = await apiClient.post('/wasteclassifications', classificationData); // Cambiado
            return data;
        } catch (error) {
            console.error("Error al guardar clasificación de mermas:", error);
            throw error;
        }
    }
}