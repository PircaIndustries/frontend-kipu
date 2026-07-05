<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAdvanceStore } from '@/domains/progress-monitoring/application/advancesStore.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const { t } = useI18n();
const router = useRouter();
const store = useAdvanceStore();
const projectsStore = useProjectsStore();
const toast = useToast();

// Calendar range state
const dates = ref(null);

// Computed list to ensure i18n translates reactively
const specialtiesOptions = computed(() => [
  { name: t('execution.advances.specialties.structures'), value: 'Estructuras' },
  { name: t('execution.advances.specialties.installations'), value: 'Instalaciones' },
  { name: t('execution.advances.specialties.architecture'), value: 'Arquitectura' }
]);

onMounted(() => {
  store.loadAdvances();
});

const onDateRangeChange = () => {
  if (dates.value && dates.value.length === 2 && dates.value[1]) {
    store.setDateRange(dates.value[0], dates.value[1]);
  } else if (!dates.value) {
    store.setDateRange(null, null);
  }
};

const getStatusBadgeClass = (s) => {
  const status = (s || 'ACTIVE').toUpperCase();
  const base = 'px-3 py-1 rounded-md text-xs font-bold uppercase';
  if (status === 'FINISHED' || status === 'COMPLETED') return `${base} bg-green-100 text-emerald-600`;
  if (status === 'DELAYED') return `${base} bg-red-100 text-red-600`;
  return `${base} bg-blue-100 text-blue-500`;
};

const showHaltedDialog = ref(false);

const navigateToCreate = () => {
  // ADDED: Prevent navigation if no project is active
  if (!projectsStore.currentProjectId) {
    alert("Select a project first");
    return;
  }
  if (projectsStore.currentProject?.status?.toLowerCase() === 'paralizada') {
    showHaltedDialog.value = true;
    return;
  }
  router.push('/advances/new');
};

// ADDED: Navigate to edit mode
const navigateToEdit = (id) => {
  router.push(`/advances/edit/${id}`);
};

const navigateToHistory = (activityName) => {
  router.push(`/advances/activity-history/${encodeURIComponent(activityName)}`);
};
</script>

<template>
  <div class="bg-white p-6 rounded-b-xl shadow-sm">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div class="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center w-full md:w-auto">
        <div class="w-full sm:w-[280px]">
          <InputText
              placeholder="Buscar..."
              class="w-full !rounded-lg"
              @input="(e) => store.setSearchFilter(e.target.value)"
          />
        </div>
        <div class="w-full sm:w-[280px]">
          <Select
              :options="specialtiesOptions"
              optionLabel="name"
              optionValue="value"
              :placeholder="t('execution.advances.filterSpecialty')"
              class="w-full !rounded-lg"
              @change="(e) => store.setSpecialtyFilter(e.value)"
              showClear
          />
        </div>
        <div class="w-full sm:w-[300px]">
          <DatePicker
              v-model="dates"
              selectionMode="range"
              :placeholder="t('execution.advances.filterWeek')"
              class="w-full !rounded-lg"
              @update:modelValue="onDateRangeChange"
              showIcon
          />
        </div>
      </div>

      <button class="bg-[#2c3e50] text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#34495e] transition-colors font-bold w-full md:w-auto" @click="navigateToCreate">
        <i class="pi pi-plus"></i> {{ t('execution.advances.newBtn') }}
      </button>
    </div>

    <div class="border border-gray-100 rounded-lg overflow-x-auto">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead class="bg-gray-50 text-gray-400 uppercase font-semibold text-xs">
        <tr>
          <th class="px-6 py-4">{{ t('execution.table.date') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.activity') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.specialty') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.progress') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.weight') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.status') }}</th>
        </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
        <tr v-for="group in store.groupedAdvances" :key="group.activityName"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="navigateToHistory(group.activityName)">

          <td class="px-6 py-4 text-gray-500">
            {{ group.lastUpdate ? new Date(group.lastUpdate).toLocaleDateString() : '-' }}
          </td>

          <td class="px-6 py-4 font-bold text-gray-800">{{ group.activityName }}</td>

          <td class="px-6 py-4 text-gray-500">{{ group.specialty }}</td>

          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" :style="{ width: Math.min(group.totalProgress, 100) + '%' }"></div>
              </div>
              <span class="font-bold text-sm">{{ group.totalProgress }}%</span>
            </div>
          </td>

          <td class="px-6 py-4 font-bold text-gray-700">{{ group.totalWeight }}</td>

          <td class="px-6 py-4">
      <span :class="group.totalProgress >= 100 ? 'bg-green-100 text-emerald-600' : 'bg-blue-100 text-blue-500'"
            class="px-3 py-1 rounded-md text-xs font-bold uppercase">
        {{ group.totalProgress >= 100 ? t('execution.status.COMPLETED') : t('execution.statusOptions.progress') }}
      </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-3 text-gray-500 text-sm">
      <i class="pi pi-info-circle text-blue-500"></i>
      <span>{{ t('execution.advances.weeklyReport', { count: store.filteredAdvances.length }) }}</span>
    </div>

    <Dialog v-model:visible="showHaltedDialog" modal header="Proyecto Paralizado" :style="{ width: '400px' }">
      <div class="flex items-center gap-4 mb-4">
        <i class="pi pi-exclamation-triangle text-orange-500 text-4xl"></i>
        <p class="m-0 text-gray-700">
          No puedes registrar avances. Debes reanudar la obra seleccionando el estado <strong>"En ejecución"</strong> desde el panel de proyecto.
        </p>
      </div>
      <template #footer>
        <Button label="Entendido" icon="pi pi-check" @click="showHaltedDialog = false" autofocus />
      </template>
    </Dialog>
  </div>
</template>