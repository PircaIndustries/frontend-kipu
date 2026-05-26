import axios from 'axios';
import { BudgetAssembler } from './budget.assembler.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

const API_URL = 'http://localhost:3000';

export class BudgetApi {
    async findAll() {
        const { data } = await axios.get(`${API_URL}/progress`);
        return data;
    }

    async findById(id) {
        const { data } = await axios.get(`${API_URL}/progress/${id}`);
        return data;
    }

    // ADDED: Fetch transactions explicitly linked to a single budget item
    async getTransactionsByBudgetId(budgetId) {
        try {
            const { data } = await axios.get(`${API_URL}/transactions?budgetId=${budgetId}`);
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
            if (!item) throw new Error("Item not found");

            const numAmount = Number(amount);
            const newExecuted = Number(item.executedAmount || 0) + numAmount;

            await axios.post(`${API_URL}/transactions`, {
                budgetId: id,
                amount: numAmount,
                date: new Date().toISOString().split('T')[0],
                description: description
            });

            await axios.patch(`${API_URL}/progress/${id}`, {
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
            if (!item) throw new Error("Item not found");

            const newBudgeted = Number(item.assignedBudget || 0) + Number(additionalBudget);

            await axios.patch(`${API_URL}/progress/${id}`, {
                assignedBudget: newBudgeted
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}