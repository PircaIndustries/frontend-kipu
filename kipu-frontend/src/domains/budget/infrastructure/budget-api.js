import axios from 'axios';

const API_URL = 'http://localhost:3000/budgets';

export class BudgetApi {
    // Obtener todas las partidas desde db.json
    async findAll() {
        const { data } = await axios.get(API_URL);
        return data;
    }

    // Obtener una sola partida por ID
    async findById(id) {
        const { data } = await axios.get(`${API_URL}/${id}`);
        return data;
    }

    // Obtener resumen calculado
    async getProjectSummary() {
        const items = await this.findAll();
        const total = items.reduce((acc, curr) => acc + curr.budgeted, 0);
        const executed = items.reduce((acc, curr) => acc + curr.executed, 0);

        return {
            total,
            executed,
            available: total - executed,
            percentage: total > 0 ? Math.round((executed / total) * 100) : 0
        };
    }

    async addTransaction(id, amount, description = "Gasto registrado") {
        try {
            const item = await this.findById(id);
            if (!item) throw new Error("Partida no encontrada");

            // Convertir siempre a números para evitar errores de concatenación
            const numAmount = Number(amount);
            const numBudgeted = Number(item.budgeted);
            const newExecuted = Number(item.executed) + numAmount;

            const excessAmount = newExecuted - numBudgeted;
            const excessPercentage = (excessAmount / numBudgeted) * 100;

            let updateData = {
                executed: newExecuted,
                status: 'NORMAL',
                alertMessage: null
            };

            // Lógica de alerta del 12.5%
            if (newExecuted > numBudgeted) {
                updateData.status = 'AT_RISK';
                if (excessPercentage >= 12.5) {
                    updateData.alertMessage = `Compra bloqueada: Solicitud excede presupuesto en ${excessPercentage.toFixed(1)}%`;
                } else {
                    updateData.alertMessage = `Alerta: Exceso de presupuesto (S/ ${excessAmount.toLocaleString()})`;
                }
            }

            // Ejecutar ambas peticiones. Si 'transactions' no existe en db.json, esto fallará.
            await axios.post('http://localhost:3000/transactions', {
                budgetId: id,
                amount: numAmount,
                date: new Date().toISOString().split('T')[0],
                description: description
            });

            await axios.patch(`http://localhost:3000/budgets/${id}`, updateData);

        } catch (error) {
            console.error("Error detallado:", error.response?.data || error.message);
            throw error; // Esto permite que el componente capture el error y muestre la alerta
        }
    }

    async updateBudgetValues(id, newBudgeted) {
        try {
            const item = await this.findById(id);
            if (!item) return;

            // Recalculamos el estado basado en el nuevo presupuesto
            let newStatus = 'NORMAL';
            let newAlert = null;

            if (item.executed > newBudgeted) {
                newStatus = 'AT_RISK';
                newAlert = `Alerta: El gasto excede el nuevo presupuesto por S/ ${(item.executed - newBudgeted).toLocaleString()}`;
            }

            await axios.patch(`${API_URL}/${id}`, {
                budgeted: newBudgeted,
                status: newStatus,
                alertMessage: newAlert
            });
        } catch (error) {
            console.error("Error al actualizar valores de presupuesto:", error);
        }
    }
}