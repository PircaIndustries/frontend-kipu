<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { BudgetApi } from '../../infrastructure/budget-api.js';
import { useTeamUserStore } from '@/domains/team/application/team-user.store.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const repository = new BudgetApi();
const teamStore = useTeamUserStore();
const projectsStore = useProjectsStore();

const budgetOptions = ref([]);
const selectedBudget = ref(null);

// ADDED: Boolean flag to determine if the URL forced a specific item context
const isFixedPartida = computed(() => !!route.query.partidaId);

const form = ref({
  partidaId: route.query.partidaId || '',
  amount: 0,
  desc: '',
  responsible: ''
});

const logisticsStaff = computed(() => {
  if (!teamStore.teamUsers) return [];
  return teamStore.teamUsers.filter(u =>
      u.role && (u.role.toLowerCase().includes('logistica') || u.role.toLowerCase().includes('logistics'))
  );
});

const onPartidaChange = async () => {
  if (form.value.partidaId) {
    selectedBudget.value = await repository.findById(form.value.partidaId);
  }
};

onMounted(async () => {
  await teamStore.fetchUsers();

  const allItems = await repository.findAll();
  budgetOptions.value = allItems.filter(item =>
      String(item.projectId) === String(projectsStore.currentProjectId) &&
      !item.isMiniAdvance
  );

  if (form.value.partidaId) onPartidaChange();
});

const save = async () => {
  if (!form.value.partidaId) return alert(t('budget.errors.selectPartida'));
  if (form.value.amount <= 0) return alert(t('budget.errors.positiveAmount'));

  const available = (selectedBudget.value.assignedBudget || 0) - (selectedBudget.value.executedAmount || 0);

  if (form.value.amount > available) {
    return alert(t('budget.errors.insufficientFunds', { available: available.toLocaleString() }));
  }

  try {
    await repository.addTransaction(form.value.partidaId, form.value.amount, form.value.desc);

    // ADDED: If we came from the detail view, navigate back to it instead of the general dashboard
    if (isFixedPartida.value) {
      router.push({ name: 'BudgetDetail', params: { id: form.value.partidaId } });
    } else {
      router.push({ name: 'BudgetManagement' });
    }

  } catch (error) {
    alert(t('budget.errors.saveFailed'));
  }
};
</script>

<template>
  <div class="form-page min-h-screen bg-gray-100 flex items-center justify-center p-6 font-sans">
    <div class="bg-white w-full max-w-[550px] rounded-xl shadow-md border border-gray-200 overflow-hidden text-left">
      <header class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 class="text-lg font-bold text-gray-800">{{ t('budget.register.title') }}</h2>
        <button class="text-2xl text-gray-400 hover:text-gray-600" @click="router.back()">&times;</button>
      </header>

      <div class="p-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5 text-left">
          <label class="text-xs font-bold text-gray-500 uppercase">{{ t('budget.register.partida') }}</label>
          <select v-model="form.partidaId" @change="onPartidaChange" :disabled="isFixedPartida" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer text-sm disabled:opacity-75 disabled:cursor-not-allowed">
            <option value="" disabled>{{ t('budget.register.selectPartida') }}</option>
            <option v-for="b in budgetOptions" :key="b.id" :value="b.id">
              {{ String(b.id).padStart(2, '0') }} - {{ b.activityName || b.activity }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5 text-left">
          <label class="text-xs font-bold text-gray-500 uppercase">{{ t('budget.register.responsible') }}</label>
          <select v-model="form.responsible" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer text-sm">
            <option value="" disabled>{{ t('budget.register.selectResponsible') }}</option>
            <option v-for="u in logisticsStaff" :key="u.id" :value="u.fullName">{{ u.fullName }}</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5 text-left">
          <label class="text-xs font-bold text-gray-500 uppercase">{{ t('budget.register.amount') }}</label>
          <input type="number" v-model="form.amount" :disabled="!form.partidaId" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm disabled:opacity-50" placeholder="0.00">
        </div>

        <div class="flex flex-col gap-1.5 text-left">
          <label class="text-xs font-bold text-gray-500 uppercase">{{ t('budget.register.desc') }}</label>
          <textarea v-model="form.desc" rows="3" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm resize-none"></textarea>
        </div>
      </div>

      <footer class="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
        <button class="flex-1 py-2.5 bg-transparent border border-gray-200 text-gray-600 rounded-lg font-bold text-sm" @click="router.back()">
          {{ t('common.cancel') }}
        </button>
        <button class="flex-2 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800" @click="save">
          {{ t('common.confirm') }}
        </button>
      </footer>
    </div>
  </div>
</template>