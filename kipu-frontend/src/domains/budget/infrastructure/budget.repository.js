import { allBudgets } from '../application/budgetStore.js';

export class BudgetRepository {
    findAll() {
        return allBudgets.value;
    }

    getProjectSummary() {
        const items = allBudgets.value;
        const total = items.reduce((acc, curr) => acc + curr.budgeted, 0);
        const executed = items.reduce((acc, curr) => acc + curr.executed, 0);

        return {
            total,
            executed,
            available: total - executed,
            percentage: total > 0 ? Math.round((executed / total) * 100) : 0
        };
    }
}