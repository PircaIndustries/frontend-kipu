<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAdvanceStore } from '@/domains/progress-monitoring/application/advancesStore.js';

import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';

const { t } = useI18n();
const router = useRouter();
const store = useAdvanceStore();

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

const navigateToCreate = () => router.push('/advances/new');
</script>

<template>
  <div class="bg-white p-6 rounded-b-xl shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="w-[280px]">
          <InputText
              placeholder="Buscar..."
              class="w-full !rounded-lg"
              @input="(e) => store.setSearchFilter(e.target.value)"
          />
        </div>
        <div class="w-[280px]">
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
        <div class="w-[300px]">
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

      <button class="bg-[#2c3e50] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#34495e] transition-colors font-bold" @click="navigateToCreate">
        <i class="pi pi-plus"></i> {{ t('execution.advances.newBtn') }}
      </button>
    </div>

    <div class="border border-gray-100 rounded-lg overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-400 uppercase font-semibold text-xs">
        <tr>
          <th class="px-6 py-4">{{ t('execution.table.date') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.activity') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.specialty') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.progress') }}</th>
          <th class="px-6 py-4">{{ t('execution.table.status') }}</th>
        </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
        <tr v-if="store.filteredAdvances.length === 0">
          <td colspan="5" class="px-6 py-10 text-center text-gray-400 italic">No hay registros para este proyecto.</td>
        </tr>
        <tr v-for="item in store.filteredAdvances" :key="item.id" class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4">{{ new Date(item.lastUpdate || item.date).toLocaleDateString() }}</td>
          <td class="px-6 py-4">
            <div class="font-bold text-gray-800">{{ item.activityName || item.activity }}</div>
            <div class="text-xs text-gray-400 font-normal">{{ item.details || item.sector }}</div>
          </td>
          <td class="px-6 py-4 text-gray-500">{{ item.specialty }}</td>
          <td class="px-6 py-4 font-bold">{{ item.currentPercentage || item.progress }}%</td>
          <td class="px-6 py-4">
              <span :class="getStatusBadgeClass(item.status)">
                {{ t(`execution.status.${(item.status || 'ACTIVE').toUpperCase()}`) }}
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
  </div>
</template>