import { AdvanceAssembler } from './advance.assembler.js';
import i18n from '@/locales/i18n';
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

export class AdvanceApi {
    constructor() {
        this.baseUrl = `/progress-items`;
    }

    async getAll(projectId) {
        if (!projectId) return [];
        const res = await apiClient.get(`${this.baseUrl}/project/${projectId}`);
        return AdvanceAssembler.toEntityList(res.data);
    }

    async create(data) {
        const res = await apiClient.post(this.baseUrl, data);
        return AdvanceAssembler.toEntity(res.data);
    }

    async update(id, data) {
        const res = await apiClient.put(`${this.baseUrl}/${id}`, data);
        return AdvanceAssembler.toEntity(res.data);
    }

    async delete(id) {
        if (!id) throw new Error(i18n.global.t('errors.id_required_delete'));
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }
}