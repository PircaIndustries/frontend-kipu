import axios from 'axios';
import i18n from '@/locales/i18n';
import { BudgetAssembler } from './budget.assembler.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

// Get base URL from environment or fallback
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

const API_URL = `/budget-items`;

export class BudgetApi {
    async findAll() {
        try {
            const localData = localStorage.getItem('mock_budget_items');
            if (localData) return JSON.parse(localData);

            const { data } = await apiClient.get(`${API_URL}/progress`);
            return data.filter(item => !item.isMiniAdvance);
        } catch (error) {
            console.warn("Budget API findAll failed, using mock data.", error);
            return [];
        }
    }

    async findById(id) {
        try {
            const { data } = await apiClient.get(`${API_URL}/progress/${id}`);
            return data;
        } catch (error) {
            console.warn("Budget API findById failed.", error);
            return null;
        }
    }

    // ADDED: Fetch transactions explicitly linked to a single budget item
    async getTransactionsByBudgetId(budgetId) {
        try {
            const { data } = await apiClient.get(`${API_URL}/transactions?budgetId=${budgetId}`);
            return data;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }

    async getProjectSummary() {
        const projectsStore = useProjectsStore();
        const items = await this.findAll();

        const currentProjectItems = items.filter(item => String(item.projectId) === String(projectsStore.currentProjectId));
        const totalBudget = projectsStore.currentProject ? Number(projectsStore.currentProject.budget || 0) : 0;

        const executed = currentProjectItems.reduce((acc, curr) => acc + Number(curr.executedAmount || 0), 0);

        return {
            total: totalBudget,
            executed,
            available: totalBudget - executed,
            percentage: totalBudget > 0 ? Math.round((executed / totalBudget) * 100) : 0
        };
    }

    async addTransaction(id, amount, description = "Gasto registrado") {
        try {
            const item = await this.findById(id);
            if (!item) throw new Error(i18n.global.t('errors.item_not_found'));

            if (item.isMiniAdvance) {
                throw new Error(i18n.global.t('errors.expenses_mini_advance'));
            }

            const numAmount = Number(amount);
            const newExecuted = Number(item.executedAmount || 0) + numAmount;

            await apiClient.post(`${API_URL}/transactions`, {
                budgetId: id,
                amount: numAmount,
                date: new Date().toISOString().split('T')[0],
                description: description
            });

            await apiClient.patch(`${API_URL}/progress/${id}`, {
                executedAmount: newExecuted
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async requestExtension(id, additionalBudget) {
        try {
            const item = await this.findById(id);
            if (!item) throw new Error(i18n.global.t('errors.item_not_found'));

            const newBudgeted = Number(item.assignedBudget || 0) + Number(additionalBudget);

            await apiClient.patch(`${API_URL}/progress/${id}`, {
                assignedBudget: newBudgeted
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}