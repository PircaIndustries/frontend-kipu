import axios from 'axios';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

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

const BUDGET_PATH = import.meta.env.VITE_BUDGET_ENDPOINT_PATH || '/budget-items';

export class BudgetApi {
    async findAll() {
        const projectsStore = useProjectsStore();
        const projectId = projectsStore.currentProjectId;
        try {
            const { data } = await apiClient.get(`${BUDGET_PATH}/project/${projectId}`);
            return data.filter(item => !item.isMiniAdvance);
        } catch (error) {
            console.warn("Budget API findAll failed, using mock data.", error);
            const localData = localStorage.getItem('mock_budget_items');
            if (localData) return JSON.parse(localData);
            return [];
        }
    }

    async findById(id) {
        try {
            const { data } = await apiClient.get(`${BUDGET_PATH}/${id}`);
            return data;
        } catch (error) {
            console.warn("Budget API findById failed.", error);
            return null;
        }
    }

    async getTransactionsByBudgetId(budgetId) {
        try {
            const item = await this.findById(budgetId);
            return item?.transactions || [];
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }

    async getProjectSummary() {
        const projectsStore = useProjectsStore();
        const items = await this.findAll();

        const totalBudget = projectsStore.currentProject ? Number(projectsStore.currentProject.budget || 0) : 0;
        const executed = items.reduce((acc, curr) => acc + Number(curr.executedAmount || 0), 0);

        return {
            total: totalBudget,
            executed,
            available: totalBudget - executed,
            percentage: totalBudget > 0 ? Math.round((executed / totalBudget) * 100) : 0
        };
    }

    async addTransaction(id, amount, description = "Gasto registrado") {
        try {
            await apiClient.post(`${BUDGET_PATH}/${id}/transactions`, {
                amount: Number(amount),
                date: new Date().toISOString().split('T')[0],
                description: description
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async requestExtension(id, additionalBudget) {
        try {
            await apiClient.post(`${BUDGET_PATH}/${id}/extensions`, {
                amount: Number(additionalBudget)
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
