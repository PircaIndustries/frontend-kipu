import { ref } from 'vue';

export const allBudgets = ref([
    {
        id: '01.01',
        name: 'Cimentación',
        description: 'Trabajos preliminares y cimentación',
        budgeted: 80000,
        executed: 65000,
        status: 'NORMAL',
        alertMessage: null
    },
    {
        id: '01.02',
        name: 'Estructura',
        description: 'Columnas, vigas y losas',
        budgeted: 50000,
        executed: 38000,
        status: 'AT_RISK',
        alertMessage: 'Compra bloqueada: Solicitud SM-045 excede presupuesto en 12.5%'
    }
]);

export const addTransaction = (id, amount) => {
    const item = allBudgets.value.find(b => b.id === id);
    if (item) {
        item.executed += amount;
        if (item.executed > item.budgeted) {
            item.status = 'AT_RISK';
            item.alertMessage = `Alerta: El gasto actual excede el presupuesto por S/ ${item.executed - item.budgeted}`;
        }
    }
};