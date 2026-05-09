<script setup>
/**
 * AdvancesView Component
 * Dedicated solely to the progress registry table and filtering.
 */
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
// Import shared state
import { allAdvances } from '../../data/advancesStore';

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';

const { t } = useI18n();
const router = useRouter();

/** * Filter states */
const selectedSpecialty = ref(null);
const dateRange = ref(null);

const specialties = ref([
  { name: t('execution.advances.specialties.structures'), value: 'Estructuras' },
  { name: t('execution.advances.specialties.installations'), value: 'Instalaciones' },
  { name: t('execution.advances.specialties.architecture'), value: 'Arquitectura' }
]);

const clearFilters = () => {
  selectedSpecialty.value = null;
  dateRange.value = null;
};

/** * Reactive Filter Logic using the shared store */
const filteredAdvances = computed(() => {
  return allAdvances.value.filter(item => {
    const matchesSpecialty = !selectedSpecialty.value || item.specialty === selectedSpecialty.value.value;

    let matchesDate = true;
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      const start = new Date(dateRange.value[0]).setHours(0,0,0,0);
      const end = new Date(dateRange.value[1]).setHours(23,59,59,999);
      const itemDate = new Date(item.date).getTime();
      matchesDate = itemDate >= start && itemDate <= end;
    }

    return matchesSpecialty && matchesDate;
  });
});

const getStatusSeverity = (status) => {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'IN_PROGRESS': return 'info';
    case 'DELAYED': return 'danger';
    default: return 'warning';
  }
};
</script>

<template>
  <div class="view-content">
    <header class="advances-header">
      <div class="title-group">
        <h1>{{ t('execution.advances.title') }}</h1>
        <p class="subtitle">{{ t('execution.advances.subtitle') }}</p>
      </div>
      <Button
          :label="t('execution.advances.newBtn')"
          icon="pi pi-plus"
          class="p-button-primary new-advance-btn"
          @click="router.push('/advances/new')"
      />
    </header>

    <div class="filters-bar">
      <Select
          v-model="selectedSpecialty"
          :options="specialties"
          optionLabel="name"
          :placeholder="t('execution.advances.filterSpecialty')"
          class="filter-dropdown"
          showClear
      />

      <DatePicker
          v-model="dateRange"
          selectionMode="range"
          showIcon
          iconDisplay="input"
          :placeholder="t('execution.advances.filterWeek')"
          class="filter-calendar"
          showButtonBar
      />

      <Button
          v-if="selectedSpecialty || dateRange"
          icon="pi pi-filter-slash"
          severity="secondary"
          text
          @click="clearFilters"
      />
    </div>

    <DataTable :value="filteredAdvances" class="p-datatable-sm custom-table">
      <Column field="date" :header="t('execution.table.date')">
        <template #body="slotProps">
          {{ new Date(slotProps.data.date).toLocaleDateString() }}
        </template>
      </Column>
      <Column :header="t('execution.table.activity')">
        <template #body="slotProps">
          <div class="activity-cell">
            <span class="activity-name">{{ slotProps.data.activity }}</span>
            <span class="activity-sector">{{ slotProps.data.sector }}</span>
          </div>
        </template>
      </Column>
      <Column field="specialty" :header="t('execution.table.specialty')"></Column>
      <Column :header="t('execution.table.progress')">
        <template #body="slotProps">
          <div class="progress-cell">
            <ProgressBar :value="slotProps.data.progress" :showValue="false" style="height: 6px; flex-grow: 1;" />
            <span class="progress-text">{{ slotProps.data.progress }}%</span>
          </div>
        </template>
      </Column>
      <Column :header="t('execution.table.status')">
        <template #body="slotProps">
          <Tag :value="t(`execution.status.${slotProps.data.status}`)"
               :severity="getStatusSeverity(slotProps.data.status)" />
        </template>
      </Column>
      <Column>
        <template #body>
          <Button icon="pi pi-angle-right" text plain />
        </template>
      </Column>
    </DataTable>

    <div class="info-footer">
      <i class="pi pi-info-circle"></i>
      <span>{{ t('execution.advances.weeklyReport', { count: filteredAdvances.length }) }}</span>
    </div>
  </div>
</template>

<style scoped>
.view-content { padding: 0.5rem 0; }
.advances-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.title-group h1 { margin: 0; font-size: 1.5rem; color: #2c3e50; }
.subtitle { color: #95a5a6; font-size: 0.9rem; }
.new-advance-btn { background-color: #3498db; border: none; }
.filters-bar { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
.filter-dropdown, .filter-calendar { min-width: 240px; }
.activity-cell { display: flex; flex-direction: column; }
.activity-name { font-weight: 600; color: #2c3e50; }
.activity-sector { font-size: 0.8rem; color: #95a5a6; }
.progress-cell { display: flex; align-items: center; gap: 1rem; min-width: 180px; }
.progress-text { font-size: 0.85rem; font-weight: 700; width: 40px; }
.info-footer { margin-top: 2rem; background: #f8f9fa; padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.75rem; color: #7f8c8d; border: 1px solid #e9ecef; }
</style>