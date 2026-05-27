<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { BudgetApi } from '../../infrastructure/budget-api.js';
import { useAdvanceStore } from '@/domains/progress-monitoring/application/advancesStore.js';

const props = defineProps({ id: String });
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const repository = new BudgetApi();
const advanceStore = useAdvanceStore();

const item = ref(null);
const transactions = ref([]);

onMounted(async () => {
  await advanceStore.loadAdvances();

  const budgetId = props.id || route.params.id;
  item.value = await repository.findById(budgetId);

  transactions.value = await repository.getTransactionsByBudgetId(budgetId);
  transactions.value.sort((a, b) => new Date(b.date) - new Date(a.date));
});

const budgetedAmount = computed(() => Number(item.value?.assignedBudget || 0));
const executedAmount = computed(() => Number(item.value?.executedAmount || 0));

const progressPercentage = computed(() => {
  if (budgetedAmount.value <= 0) return 0;
  return Math.min(Math.round((executedAmount.value / budgetedAmount.value) * 100), 100);
});

const sequentialId = computed(() => {
  if (!item.value?.id) return '';
  const index = advanceStore.filteredAdvances.findIndex(a => String(a.id) === String(item.value.id));
  return index !== -1 ? String(index + 1).padStart(2, '0') : '00';
});

// ADDED: Smooth scroll function to highlight the specific transaction
const scrollToTransaction = (txId) => {
  const element = document.getElementById(`tx-${txId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // ADDED: Flash effect to easily identify the targeted row
    element.classList.add('bg-rose-50', 'border-rose-300');
    setTimeout(() => {
      element.classList.remove('bg-rose-50', 'border-rose-300');
    }, 2000);
  }
};
</script>

<template>
  <div v-if="item" class="detail-wrapper text-left font-sans">
    <nav class="top-nav">
      <button class="back-link" @click="router.back()">
        &larr; {{ t('budget.detail.back') }}
      </button>
      <div class="breadcrumb">
        <span>{{ t('budget.title') }}</span> / <span>{{ t('budget.detail.breadcrumb') }}</span> / <span class="active">{{ sequentialId }}</span>
      </div>
    </nav>

    <header class="page-header">
      <div class="header-content">
        <div class="title-group">
          <div class="badge-id">{{ sequentialId }}</div>
          <h1 class="text-2xl font-black text-slate-800">{{ item.activityName || item.activity }}</h1>
        </div>
        <p class="description">{{ item.details || item.sector }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-action secondary">{{ t('budget.detail.exportBtn') }}</button>
        <button class="btn-action primary" @click="router.push({ name: 'RegisterTransaction', query: { partidaId: item.id } })">
          {{ t('budget.register.btn') }}
        </button>
      </div>
    </header>

    <div class="dashboard-grid">
      <div class="main-panel flex flex-col gap-6">
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-label">{{ t('budget.detail.assigned') }}</span>
            <span class="stat-value text-slate-800">S/ {{ budgetedAmount.toLocaleString() }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">{{ t('budget.detail.executed') }}</span>
            <span class="stat-value highlight">S/ {{ executedAmount.toLocaleString() }}</span>
            <div class="mini-progress">
              <div class="fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-label">{{ t('budget.detail.available') }}</span>
            <span class="stat-value success">S/ {{ (budgetedAmount - executedAmount).toLocaleString() }}</span>
          </div>
        </div>

        <div class="card progress-section">
          <div class="card-header">
            <h3>{{ t('budget.detail.status') }}</h3>
            <span class="pct-badge">{{ progressPercentage }}%</span>
          </div>
          <div class="large-progress-bar">
            <div class="bar-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header border-b border-slate-100 pb-4 mb-4">
            <h3 class="uppercase tracking-wide text-slate-700">{{ t('budget.detail.expensesTitle') }}</h3>
          </div>
          <div v-if="transactions.length > 0" class="flex flex-col gap-3">
            <div v-for="tx in transactions" :key="tx.id" :id="`tx-${tx.id}`"
                 class="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-lg transition-all duration-500">
              <div>
                <span class="block text-xs font-bold text-slate-400">{{ tx.date }}</span>
                <strong class="text-sm text-slate-700">{{ tx.description }}</strong>
              </div>
              <strong class="text-rose-600 font-bold">- S/ {{ Number(tx.amount).toLocaleString() }}</strong>
            </div>
          </div>
          <div v-else class="py-8 text-center text-sm text-slate-400 italic">
            {{ t('budget.detail.emptyExpenses') }}
          </div>
        </div>
      </div>

      <aside class="side-panel">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <h2 class="text-sm font-black text-slate-700 uppercase tracking-wide mb-2">{{ t('budget.detail.recentTitle') }}</h2>
          <div v-for="tx in transactions.slice(0, 5)" :key="'side-'+tx.id"
               @click="scrollToTransaction(tx.id)"
               class="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all">
            <div>
              <strong class="text-xs text-slate-700 block font-bold truncate max-w-[120px]">{{ tx.description }}</strong>
              <span class="text-[10px] font-medium text-slate-400">{{ tx.date }}</span>
            </div>
            <strong class="text-xs text-rose-600 font-bold">-S/ {{ Number(tx.amount).toLocaleString() }}</strong>
          </div>
          <div v-if="transactions.length === 0" class="text-center py-4 text-xs text-slate-400 italic">
            {{ t('budget.detail.emptyExpenses') }}
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.detail-wrapper { padding: 1.5rem 2.5rem; background-color: #f8fafc; min-height: 100vh; color: #1e293b; font-family: 'Inter', sans-serif; }
.top-nav { display: flex; justify-content: space-between; margin-bottom: 2rem; font-size: 0.9rem; }
.back-link { background: none; border: none; color: #64748b; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s; }
.back-link:hover { color: #0f172a; }
.breadcrumb { color: #94a3b8; }
.breadcrumb .active { color: #64748b; font-weight: 600; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
.title-group { display: flex; align-items: center; gap: 1rem; }
.badge-id { background: #e2e8f0; color: #475569; padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
.page-header h1 { margin: 0; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; }
.description { margin: 0.5rem 0 0; color: #64748b; font-size: 1.1rem; }
.header-actions { display: flex; gap: 0.75rem; }
.btn-action { padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-action.primary { background-color: #0f172a; color: white; }
.btn-action.primary:hover { background-color: #1e293b; transform: translateY(-1px); }
.btn-action.secondary { background-color: white; color: #475569; border: 1px solid #e2e8f0; }
.dashboard-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.stat-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; }
.stat-value { display: block; font-size: 1.5rem; font-weight: 800; margin-top: 0.5rem; }
.stat-value.highlight { color: #0f172a; }
.stat-value.success { color: #10b981; }
.mini-progress { background: #f1f5f9; height: 6px; border-radius: 3px; margin-top: 1rem; overflow: hidden; }
.mini-progress .fill { background: #3b82f6; height: 100%; border-radius: 3px; }
.card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.pct-badge { background: #eff6ff; color: #1e40af; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem; }
.large-progress-bar { background: #f1f5f9; height: 24px; border-radius: 12px; overflow: hidden; }
.bar-fill { height: 100%; background: #3b82f6; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.side-panel { display: flex; flex-direction: column; gap: 1.25rem; }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: 1fr; }
}
</style>