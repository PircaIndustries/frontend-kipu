import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:5230/api/v1';
const API_URL = `${BASE_URL}/ncrs`;

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

export class NcrRepository {
    async getAll() {
        try {
            const { data } = await apiClient.get('/ncrs');
            return data;
        } catch (error) {
            console.error('Error fetching NCRs:', error);
            return [];
        }
    }

    async save(ncrData) {
        const { data } = await apiClient.post('/ncrs', ncrData);
        return data;
    }
}
