<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { allProjects } from '../../data/projectsStore';
import { ProjectService } from '../../application/services/ProjectService';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import Select from 'primevue/select';

const { t } = useI18n();
const router = useRouter();

const showCreateModal = ref(false);
const showSuccessModal = ref(false);
const showDiscardModal = ref(false);
const errorMessage = ref('');
const searchQuery = ref('');
const lastCreatedProjectId = ref(null);

const statusOptions = computed(() => [
  { label: t('project-management.create.statusOptions.planning'), value: 'Planificación' },
  { label: t('project-management.create.statusOptions.progress-monitoring'), value: 'En ejecución' },
  { label: t('project-management.create.statusOptions.paused'), value: 'Pausado' }
]);

const initialForm = {
  name: '',
  location: '',
  imageUrl: '',
  startDate: null,
  endDate: null,
  budget: null,
  status: 'Planificación'
};

const form = ref({ ...initialForm });

const isDirty = computed(() => {
  return form.value.name !== '' ||
      form.value.location !== '' ||
      form.value.imageUrl !== '' ||
      form.value.startDate !== null ||
      form.value.endDate !== null ||
      form.value.budget !== null;
});

const filteredProjects = computed(() => {
  if (!searchQuery.value) return allProjects.value;
  const query = searchQuery.value.toLowerCase();
  return allProjects.value.filter(p => p.name.toLowerCase().includes(query));
});

const handleCloseCreateModal = (visible) => {
  if (!visible) {
    if (isDirty.value) {
      showDiscardModal.value = true;
    } else {
      showCreateModal.value = false;
    }
  } else {
    showCreateModal.value = true;
  }
};

const confirmDiscard = () => {
  form.value = { ...initialForm };
  errorMessage.value = '';
  showDiscardModal.value = false;
  showCreateModal.value = false;
};

const handleSave = () => {
  const errorKey = ProjectService.validateDates(form.value.startDate, form.value.endDate);
  if (errorKey) {
    errorMessage.value = t(errorKey);
    return;
  }

  const newProject = ProjectService.create(form.value);
  lastCreatedProjectId.value = newProject.id;

  form.value = { ...initialForm };
  errorMessage.value = '';
  showCreateModal.value = false;
  showSuccessModal.value = true;
};

const goToProject = () => {
  showSuccessModal.value = false;
  if (lastCreatedProjectId.value) {
    router.push({
      name: 'AdvancesRegistry',
      query: { projectId: lastCreatedProjectId.value }
    });
  }
};
</script>

<template>
  <div class="projects-dashboard">
    <header class="stats-grid">
      <div class="stat-card"><span>{{ t('project-management.stats.active') }}</span> <strong>{{ allProjects.length }}</strong></div>
      <div class="stat-card"><span>{{ t('project-management.stats.average') }}</span> <strong>48%</strong></div>
      <div class="stat-card"><span>{{ t('project-management.stats.rnc') }}</span> <strong class="red">12</strong></div>
      <div class="stat-card"><span>{{ t('project-management.stats.total') }}</span> <strong>45</strong></div>
    </header>

    <div class="actions-bar">
      <span class="p-input-icon-left search-container">
        <i class="pi pi-search" />
        <InputText v-model="searchQuery" :placeholder="t('project-management.searchPlaceholder')" class="search-input" />
      </span>
      <Button :label="t('project-management.newProject')" icon="pi pi-plus" @click="showCreateModal = true" class="new-btn" />
    </div>

    <div class="projects-grid">
      <div v-for="p in filteredProjects" :key="p.id" class="project-card">
        <img :src="p.image" alt="Project image" />
        <div class="card-content">
          <div class="card-header">
            <h3>{{ p.name }}</h3>
            <span class="status-tag">{{ p.status }}</span>
          </div>
          <div class="progress-bar"><div :style="{ width: p.progress + '%' }"></div></div>
          <div class="card-footer">
            <span><i class="pi pi-users"></i> {{ p.members }} miembros</span>
            <span class="alerts">{{ p.rnc }} RNC | {{ p.pending }} pendientes</span>
          </div>
        </div>
      </div>
    </div>

    <Dialog :visible="showCreateModal" @update:visible="handleCloseCreateModal" modal :header="t('project-management.create.header')" :style="{ width: '450px' }">
      <div class="form-body">
        <div class="field">
          <label>{{ t('project-management.create.name') }}</label>
          <InputText v-model="form.name" fluid />
        </div>
        <div class="field">
          <label>{{ t('project-management.create.location') }}</label>
          <InputText v-model="form.location" fluid />
        </div>
        <div class="field">
          <label>{{ t('project-management.create.imageUrl') }}</label>
          <InputText v-model="form.imageUrl" fluid placeholder="https://..." />
        </div>
        <div class="field">
          <label>{{ t('project-management.create.status') }}</label>
          <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" fluid />
        </div>
        <div class="date-row">
          <div class="field">
            <label>{{ t('project-management.create.start') }}</label>
            <DatePicker v-model="form.startDate" showIcon fluid />
          </div>
          <div class="field">
            <label>{{ t('project-management.create.end') }}</label>
            <DatePicker v-model="form.endDate" showIcon fluid />
          </div>
        </div>
        <div class="field">
          <label>{{ t('project-management.create.budget') }}</label>
          <InputText v-model="form.budget" type="number" fluid />
        </div>
        <Message v-if="errorMessage" severity="error" size="small">{{ errorMessage }}</Message>
      </div>
      <template #footer>
        <Button :label="t('project-management.create.cancel')" severity="secondary" text @click="handleCloseCreateModal(false)" />
        <Button :label="t('project-management.create.submit')" @click="handleSave" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showSuccessModal" modal :style="{ width: '400px' }">
      <div class="success-body">
        <i class="pi pi-check-circle" />
        <h2>{{ t('project-management.create.successHeader') }}</h2>
        <Button :label="t('project-management.create.goToProject')" @click="goToProject" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showDiscardModal" modal :header="t('project-management.create.discard.title')" :style="{ width: '350px' }">
      <p style="margin: 0; color: #4b5563;">{{ t('project-management.create.discard.message') }}</p>
      <template #footer>
        <Button :label="t('project-management.create.discard.continue')" text severity="secondary" @click="showDiscardModal = false" />
        <Button :label="t('project-management.create.discard.confirm')" severity="danger" @click="confirmDiscard" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.projects-dashboard { padding: 2rem; background: #fdfdfd; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.25rem; border-radius: 8px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 0.5rem; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.stat-card strong { font-size: 1.5rem; color: #2c3e50; }
.stat-card strong.red { color: #e74c3c; }

.actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem; }
.search-container { flex: 1; position: relative; }
.search-input { width: 100%; padding-left: 2.5rem; }
.search-container i { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.new-btn { flex-shrink: 0; }

.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2rem; }
.project-card { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #eee; transition: transform 0.2s; }
.project-card:hover { transform: translateY(-5px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.project-card img { width: 100%; height: 180px; object-fit: cover; background-color: #f0f0f0; }
.card-content { padding: 1.25rem; }
.card-header { display: flex; justify-content: space-between; align-items: start; }
.status-tag { background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
.progress-bar { height: 6px; background: #f0f0f0; border-radius: 3px; margin: 1.25rem 0; }
.progress-bar div { height: 100%; background: #4caf50; border-radius: 3px; }
.card-footer { display: flex; justify-content: space-between; font-size: 0.85rem; color: #7f8c8d; }

.form-body { display: flex; flex-direction: column; gap: 1rem; }
.date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #34495e; }
.success-body { padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; text-align: center; }
.success-body i { font-size: 4rem; color: #4caf50; }
</style>