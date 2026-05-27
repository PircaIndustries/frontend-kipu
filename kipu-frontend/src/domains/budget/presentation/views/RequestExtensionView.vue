<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { BudgetApi } from '../../infrastructure/budget-api.js';
import { useTeamUserStore } from '@/domains/team/application/team-user.store.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

const { t } = useI18n();
const router = useRouter();
const repository = new BudgetApi();
const teamStore = useTeamUserStore();
const projectsStore = useProjectsStore();

const projectSummary = ref({ total: 0, executed: 0, available: 0 });
const budgetOptions = ref([]); // ADDED: Local ref for raw fresh data

const form = ref({
  partidaId: '',
  additionalAmount: 0,
  authorizedPerson: '',
  reason: ''
});

const gestorManagers = computed(() => {
  if (!teamStore.teamUsers) return [];
  return teamStore.teamUsers.filter(u =>
      u.role && (u.role.toLowerCase().includes('gestor') || u.role.toLowerCase().includes('manager'))
  );
});

onMounted(async () => {
  projectSummary.value = await repository.getProjectSummary();
  await teamStore.fetchUsers();

  // ADDED: Force fresh API call strictly filtered by current project ID context
  const allItems = await repository.findAll();
  budgetOptions.value = allItems.filter(item => String(item.projectId) === String(projectsStore.currentProjectId));
});

const saveExtension = async () => {
  if (!form.value.partidaId) return alert(t('budget.errors.selectPartida'));
  if (form.value.additionalAmount <= 0) return alert(t('budget.errors.positiveAmount'));
  if (!form.value.authorizedPerson) return alert(t('budget.errors.selectResponsible'));

  if (form.value.additionalAmount > projectSummary.value.available) {
    return alert(t('budget.errors.insufficientFunds', { available: projectSummary.value.available.toLocaleString() }));
  }

  try {
    await repository.requestExtension(form.value.partidaId, form.value.additionalAmount);
    router.push({ name: 'BudgetManagement' });
  } catch (error) {
    alert(t('budget.errors.saveFailed'));
  }
};
</script>

<template>
  <div class="form-page min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
    <div class="bg-white w-full max-w-[580px] rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <header class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 text-left">
        <h2 class="text-xl font-black text-slate-800">{{ t('budget.extension.title') }}</h2>
        <button class="text-2xl text-slate-400 hover:text-slate-600 font-bold transition-colors" @click="router.back()">&times;</button>
      </header>

      <div class="p-6 flex flex-col gap-5 text-left">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-black text-slate-500 uppercase tracking-wider">{{ t('budget.register.partida') }}</label>
          <select v-model="form.partidaId" class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer text-sm font-semibold text-slate-700 focus:border-sky-500 focus:bg-white transition-all">
            <option value="" disabled>{{ t('budget.register.selectPartida') }}</option>
            <option v-for="b in budgetOptions" :key="b.id" :value="b.id">
              {{ String(b.id).padStart(2, '0') }} - {{ b.activityName || b.activity }} (S/ {{ (b.assignedBudget || 0).toLocaleString() }})
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-black text-slate-500 uppercase tracking-wider">{{ t('budget.register.amount') }}</label>
          <input type="number" v-model="form.additionalAmount" class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-800 focus:border-sky-500 focus:bg-white transition-all" placeholder="0.00">
          <small class="text-[11px] text-slate-400 font-semibold mt-0.5 block">
            {{ t('budget.extension.maxAvailable') }}: <span class="text-sky-600 font-bold">S/ {{ projectSummary.available.toLocaleString() }}</span>
          </small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-black text-slate-500 uppercase tracking-wider">{{ t('budget.extension.authorizedLabel') }}</label>
          <select v-model="form.authorizedPerson" class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer text-sm font-semibold text-slate-700 focus:border-sky-500 focus:bg-white transition-all">
            <option value="" disabled>{{ t('budget.register.selectResponsible') }}</option>
            <option v-for="user in gestorManagers" :key="user.id" :value="user.fullName">{{ user.fullName }}</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-black text-slate-500 uppercase tracking-wider">{{ t('budget.extension.reasonLabel') }}</label>
          <textarea v-model="form.reason" rows="3" class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 focus:border-sky-500 focus:bg-white transition-all resize-none" placeholder="..."></textarea>
        </div>
      </div>

      <footer class="p-4 bg-slate-50 border-t border-slate-100 flex gap-4">
        <button class="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-sm" @click="router.back()">
          {{ t('common.cancel') }}
        </button>
        <button class="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-sm shadow-sky-100" @click="saveExtension">
          {{ t('common.confirm') }}
        </button>
      </footer>
    </div>
  </div>
</template>