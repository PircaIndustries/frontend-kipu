<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { BudgetApi } from '../../infrastructure/budget-api.js';

const router = useRouter();
const route = useRoute();
const repository = new BudgetApi();

const item = ref(null);
const newBudgeted = ref(0);

onMounted(async () => {
  item.value = await repository.findById(route.params.id);
  if (item.value) {
    newBudgeted.ref = item.value.budgeted;
  }
});

const handleUpdate = async () => {
  await repository.updateBudgetValues(item.value.id, newBudgeted.value);
  router.push({ name: 'BudgetDetail', params: { id: item.value.id } });
};
</script>

<template>
  <div class="form-page" v-if="item">
    <div class="form-card">
      <div class="form-header">
        <h2 class="form-title">Revisar Partida: {{ item.id }}</h2>
        <button class="close-btn" @click="router.back()">&times;</button>
      </div>

      <div class="form-body">
        <div class="alert-info">
          <strong>Estado Actual:</strong> {{ item.alertMessage }}
        </div>

        <div class="input-group">
          <label class="input-label">Presupuesto Asignado (S/)</label>
          <input type="number" v-model="newBudgeted" class="custom-input">
          <p class="input-help">Incremente el presupuesto para autorizar gastos adicionales.</p>
        </div>

        <div class="stats-preview">
          <span>Ejecutado hasta hoy: S/ {{ item.executed.toLocaleString() }}</span>
        </div>
      </div>

      <div class="form-footer">
        <button class="btn-cancel" @click="router.back()">Descartar</button>
        <button class="btn-save" @click="handleUpdate">Actualizar y Autorizar</button>
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
.alert-info { background: #fef2f2; color: #991b1b; padding: 1rem; border-radius: 8px; font-size: 0.9rem; margin-bottom: 1rem; border: 1px solid #fee2e2; }
.input-help { font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; }
.stats-preview { padding-top: 1rem; border-top: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; }
</style>