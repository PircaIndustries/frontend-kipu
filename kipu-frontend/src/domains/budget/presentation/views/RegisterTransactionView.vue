<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { BudgetApi } from '../../infrastructure/budget-api.js';

const router = useRouter();
const route = useRoute();
const repository = new BudgetApi();

const budgetOptions = ref([]);

const form = ref({
  partidaId: route.query.partidaId || '',
  amount: 0,
  desc: ''
});

onMounted(async () => {
  budgetOptions.value = await repository.findAll();
});

const save = async () => {
  if (!form.value.partidaId || form.value.amount <= 0) return;

  try {
    await repository.addTransaction(
        form.value.partidaId,
        form.value.amount,
        form.value.desc
    );

    router.push({ name: 'BudgetManagement' });
  } catch (error) {
    alert("Error al procesar la transacción.");
  }
};
</script>

<template>
  <div class="form-page">
    <div class="form-card">
      <div class="form-header">
        <h2 class="form-title">Registrar Gasto</h2>
        <button class="close-btn" @click="router.back()">&times;</button>
      </div>

      <div class="form-body">
        <div class="input-group">
          <label class="input-label">Partida Presupuestal</label>
          <select v-model="form.partidaId" class="custom-input">
            <option value="" disabled>Seleccione una partida</option>
            <option v-for="b in budgetOptions" :key="b.id" :value="b.id">
              {{ b.id }} - {{ b.name }}
            </option>
          </select>
        </div>

        <div class="input-group">
          <label class="input-label">Monto del Gasto (S/)</label>
          <input
              type="number"
              v-model="form.amount"
              placeholder="0.00"
              class="custom-input"
          >
        </div>

        <div class="input-group">
          <label class="input-label">Descripción Detallada</label>
          <textarea
              v-model="form.desc"
              rows="4"
              placeholder="Ej. Compra de materiales para..."
              class="custom-input"
          ></textarea>
        </div>
      </div>

      <div class="form-footer">
        <button class="btn-cancel" @click="router.back()">Cancelar</button>
        <button class="btn-save" @click="save">Confirmar Transacción</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-page { background-color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.form-card { background-color: #ffffff; width: 100%; max-width: 550px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden; }
.form-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.form-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
.close-btn { font-size: 2rem; border: none; background: none; cursor: pointer; color: #64748b; line-height: 1; }
.form-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-label { display: block; font-weight: 700; font-size: 0.9rem; color: #334155; text-align: left; }
.custom-input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; color: #0f172a; background-color: #ffffff; transition: border-color 0.2s, box-shadow 0.2s; }
.custom-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.custom-input::placeholder { color: #94a3b8; }
.form-footer { padding: 1.5rem; background-color: #f8fafc; display: flex; gap: 1rem; border-top: 1px solid #e2e8f0; }
.btn-save { flex: 2; background-color: #0f172a; color: #ffffff; border: none; padding: 0.875rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background-color 0.2s; }
.btn-save:hover { background-color: #1e293b; }
.btn-cancel { flex: 1; background-color: transparent; border: 1px solid #cbd5e1; color: #64748b; padding: 0.875rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-cancel:hover { background-color: #f1f5f9; }
</style>