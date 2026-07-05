import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:5230/api/v1';
const API_URL = `${BASE_URL}/ncrs`;

// Configuración de la instancia de Axios con el interceptor de token idéntico al de proyectos
const apiClient = axios.create({
    baseURL: BASE_URL
});

apiClient.interceptors.request.use((config) => {
    const userStr = localStorage.getItem('currentUser'); // Usa la clave correcta descubierta en tu código
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

export class NcrRepository {
    async getAll() {
        try {
            const localData = localStorage.getItem('mock_ncrs');
            if (localData) return JSON.parse(localData);
            
            const { data } = await apiClient.get('/ncrs');
            return data;
        } catch (error) {
            console.warn("Error API NCR, using local storage:", error);
            return JSON.parse(localStorage.getItem('mock_ncrs') || '[]');
        }
    }

    async save(ncrData) {
        try {
            const localData = JSON.parse(localStorage.getItem('mock_ncrs') || '[]');
            const newNcr = { ...ncrData, id: Date.now(), createdAt: new Date().toISOString() };
            localData.push(newNcr);
            localStorage.setItem('mock_ncrs', JSON.stringify(localData));
            return newNcr;
        } catch (error) {
            console.error("Error al guardar NCR localmente:", error);
            throw error;
        }
    }
}