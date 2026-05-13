<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectsStore } from '../../data/useProjectsStore';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import Select from 'primevue/select';

const { t } = useI18n();
const store = useProjectsStore();

// ── Search ──
const searchQuery = ref('');
const filteredProjects = computed(() => {
  if (!searchQuery.value) return store.projects;
  const q = searchQuery.value.toLowerCase();
  return store.projects.filter(p => p.name.toLowerCase().includes(q));
});

// ── Dynamic stats ──
const averageAdvance = computed(() => {
  if (store.projects.length === 0) return 0;
  const sum = store.projects.reduce((acc, p) => acc + (p.progress || 0), 0);
  return Math.round(sum / store.projects.length);
});

const totalRnc = computed(() =>
  store.projects.reduce((acc, p) => acc + (p.rnc || 0), 0)
);

const totalCollaborators = computed(() =>
  store.projects.reduce((acc, p) => acc + (p.members || 0), 0)
);

// ── Create project ──
const showCreateModal = ref(false);
const showSuccessModal = ref(false);
const showDiscardModal = ref(false);
const createError = ref('');
const nameChecking = ref(false);
const nameDuplicated = ref(false);
let nameCheckTimeout = null;

const statusOptions = computed(() => [
  { label: t('projects_dashboard.create_status_planned'), value: 'Planificación' },
  { label: t('projects_dashboard.create_status_in_progress'), value: 'En ejecución' }
]);

const initialForm = { name: '', description: '', location: '', startDate: null, endDate: null, budget: null, status: 'Planificación' };
const form = ref({ ...initialForm });

const isDirty = computed(() =>
  form.value.name !== '' || form.value.description !== '' || form.value.location !== '' ||
  form.value.startDate !== null || form.value.endDate !== null || form.value.budget !== null
);

// Async name duplication check with debounce
watch(() => form.value.name, (newName) => {
  nameDuplicated.value = false;
  if (nameCheckTimeout) clearTimeout(nameCheckTimeout);
  if (!newName.trim()) { nameChecking.value = false; return; }
  nameChecking.value = true;
  nameCheckTimeout = setTimeout(async () => {
    try { nameDuplicated.value = await store.checkNameExists(newName.trim()); }
    catch { nameDuplicated.value = false; }
    finally { nameChecking.value = false; }
  }, 500);
});

const isCreateValid = computed(() =>
  form.value.name.trim() && !nameDuplicated.value && !nameChecking.value &&
  form.value.description.trim() && form.value.location.trim()
);

function handleCloseCreate(visible) {
  if (!visible) { isDirty.value ? (showDiscardModal.value = true) : (showCreateModal.value = false); }
  else { showCreateModal.value = true; }
}
function confirmDiscard() { form.value = { ...initialForm }; createError.value = ''; showDiscardModal.value = false; showCreateModal.value = false; }

async function handleSave() {
  if (form.value.startDate && form.value.endDate && new Date(form.value.endDate) < new Date(form.value.startDate)) {
    createError.value = 'End date cannot be before start date.'; return;
  }
  try {
    await store.addProject({
      name: form.value.name,
      description: form.value.description,
      location: form.value.location,
      startDate: form.value.startDate?.toISOString().split('T')[0],
      endDate: form.value.endDate?.toISOString().split('T')[0],
      budget: form.value.budget,
      status: form.value.status
    });
    form.value = { ...initialForm }; createError.value = '';
    showCreateModal.value = false; showSuccessModal.value = true;
  } catch { createError.value = 'Error creating project.'; }
}

// ── Select project ──
const showSelectDialog = ref(false);
const projectToSelect = ref(null);

function onCardClick(project) {
  if (project.id === store.currentProjectId) return;
  projectToSelect.value = project;
  showSelectDialog.value = true;
}
function confirmSelect() {
  if (projectToSelect.value) store.setCurrentProject(projectToSelect.value.id);
  showSelectDialog.value = false; projectToSelect.value = null;
}

// ── Delete project ──
const showDeleteDialog = ref(false);
const projectToDelete = ref(null);
const deleteConfirmName = ref('');

function openDeleteDialog(project) {
  projectToDelete.value = project;
  deleteConfirmName.value = '';
  showDeleteDialog.value = true;
}

const isDeleteValid = computed(() =>
  projectToDelete.value && deleteConfirmName.value === projectToDelete.value.name
);

async function confirmDelete() {
  if (!isDeleteValid.value) return;
  try {
    await store.deleteProject(projectToDelete.value.id);
    showDeleteDialog.value = false;
    projectToDelete.value = null;
    deleteConfirmName.value = '';
  } catch { /* handled in store */ }
}

// ── Change status ──
const showStatusDialog = ref(false);
const statusProject = ref(null);
const newStatus = ref('');
const statusJustification = ref('');

const allStatusOptions = computed(() => [
  { label: t('projects_dashboard.create_status_planned'), value: 'Planificación' },
  { label: t('projects_dashboard.create_status_in_progress'), value: 'En ejecución' },
  { label: 'Paralizada', value: 'Paralizada' },
  { label: 'Finalizada', value: 'Finalizada' }
]);

function openStatusDialog(project) {
  statusProject.value = project;
  newStatus.value = project.status;
  statusJustification.value = '';
  showStatusDialog.value = true;
}

const needsJustification = computed(() => newStatus.value === 'Paralizada');
const isStatusValid = computed(() => {
  if (!newStatus.value) return false;
  if (needsJustification.value && !statusJustification.value.trim()) return false;
  return true;
});

/** Map status to automatic progress value. */
const STATUS_PROGRESS_MAP = {
  'Planificación': 12,
  'En ejecución': 45,
  'Finalizada': 100,
  'Paralizada': null  // keeps current progress, bar turns gray
};

async function confirmStatusChange() {
  if (!isStatusValid.value || !statusProject.value) return;
  try {
    const progress = STATUS_PROGRESS_MAP[newStatus.value];
    await store.updateProjectStatus(
      statusProject.value.id,
      newStatus.value,
      statusJustification.value.trim() || undefined,
      progress
    );
    showStatusDialog.value = false; statusProject.value = null;
  } catch { /* error handled in store */ }
}

onMounted(() => { store.loadProjects(); });
</script>

<template>
  <div class="projects-page">
    <h1 class="projects-page__title">{{ t('projects_dashboard.title') }}</h1>

    <!-- Stats (dynamic) -->
    <header class="stats-grid">
      <div class="stat-card"><span>{{ t('projects_dashboard.active_projects') }}</span><strong>{{ store.totalProjects }}</strong></div>
      <div class="stat-card"><span>{{ t('projects_dashboard.average_advance') }}</span><strong>{{ averageAdvance }}%</strong></div>
      <div class="stat-card"><span>{{ t('projects_dashboard.open_rncs') }}</span><strong class="stat-card__red">{{ totalRnc }}</strong></div>
      <div class="stat-card"><span>{{ t('projects_dashboard.collaborators') }}</span><strong>{{ totalCollaborators }}</strong></div>
    </header>

    <!-- Actions bar -->
    <div class="actions-bar">
      <span class="search-container">
        <i class="pi pi-search" />
        <InputText v-model="searchQuery" :placeholder="t('projects_dashboard.search_placeholder')" class="search-input" />
      </span>
      <Button :label="t('projects_dashboard.new_project')" icon="pi pi-plus" @click="showCreateModal = true" />
    </div>

    <!-- Empty state -->
    <div v-if="store.projects.length === 0" class="empty-state">
      <i class="pi pi-folder-open empty-state__icon"></i>
      <h3>{{ t('projects_dashboard.empty_state_title') }}</h3>
      <p>{{ t('projects_dashboard.empty_state_desc') }}</p>
    </div>

    <!-- Projects grid -->
    <div v-else class="projects-grid">
      <div
        v-for="p in filteredProjects"
        :key="p.id"
        class="project-card"
        :class="{ 'project-card--current': p.id === store.currentProjectId }"
        @click="onCardClick(p)"
      >
        <!-- Current project banner -->
        <div v-if="p.id === store.currentProjectId" class="project-card__banner">
          <i class="pi pi-check-circle"></i> {{ t('projects_dashboard.current_project') }}
        </div>

        <img :src="p.image" :alt="p.name" class="project-card__image" />

        <div class="project-card__body">
          <div class="project-card__header">
            <h3 class="project-card__name">{{ p.name }}</h3>
            <div class="project-card__header-actions">
              <!-- Status tag — clickable to change status -->
              <span
                class="project-card__status-tag project-card__status-tag--clickable"
                :class="'project-card__status-tag--' + p.status.toLowerCase().replace(/\s/g, '-')"
                @click.stop="openStatusDialog(p)"
                v-tooltip.top="'Click to change status'"
              >{{ p.status }}</span>
              <!-- Delete button -->
              <button
                class="project-card__delete-btn"
                @click.stop="openDeleteDialog(p)"
                v-tooltip.top="'Delete'"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>

          <p v-if="p.description" class="project-card__desc">{{ p.description }}</p>

          <!-- Progress -->
          <div class="project-card__progress-row">
            <span class="project-card__progress-label">{{ t('projects_dashboard.progress') }}</span>
            <span class="project-card__progress-value">{{ p.progress }}%</span>
          </div>
          <div class="project-card__progress-bar" :class="{ 'project-card__progress-bar--gray': p.status === 'Paralizada' }">
            <div :style="{ width: p.progress + '%' }"></div>
          </div>

          <!-- Footer -->
          <div class="project-card__footer">
            <span><i class="pi pi-users"></i> {{ p.members }} {{ t('projects_dashboard.card_members') }}</span>
            <span>{{ p.rnc }} {{ t('projects_dashboard.card_rnc') }} | {{ p.pending }} {{ t('projects_dashboard.card_pending') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CREATE PROJECT DIALOG ═══ -->
    <Dialog :visible="showCreateModal" @update:visible="handleCloseCreate" modal :header="t('projects_dashboard.create_title')" :style="{ width: '480px' }">
      <div class="form-body">
        <div class="field">
          <label>{{ t('projects_dashboard.create_name') }}</label>
          <InputText v-model="form.name" :placeholder="t('projects_dashboard.create_name_placeholder')" fluid />
          <small v-if="nameChecking" class="field__hint">{{ t('projects_dashboard.create_hint_verify') }}</small>
          <small v-if="nameDuplicated" class="field__error">{{ t('projects_dashboard.create_err_name_dup') }}</small>
        </div>
        <div class="field">
          <label>{{ t('projects_dashboard.create_desc') }}</label>
          <InputText v-model="form.description" :placeholder="t('projects_dashboard.create_desc_placeholder')" fluid />
        </div>
        <div class="field">
          <label>{{ t('projects_dashboard.create_loc') }}</label>
          <InputText v-model="form.location" :placeholder="t('projects_dashboard.create_loc_placeholder')" fluid />
        </div>
        <div class="field">
          <label>{{ t('projects_dashboard.create_status') }}</label>
          <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" fluid />
        </div>
        <div class="date-row">
          <div class="field"><label>{{ t('projects_dashboard.create_start_date') }}</label><DatePicker v-model="form.startDate" showIcon fluid /></div>
          <div class="field"><label>{{ t('projects_dashboard.create_end_date') }}</label><DatePicker v-model="form.endDate" showIcon fluid /></div>
        </div>
        <div class="field">
          <label>{{ t('projects_dashboard.create_budget') }}</label>
          <InputText v-model="form.budget" type="number" :placeholder="t('projects_dashboard.create_budget_placeholder')" fluid />
        </div>
        <Message v-if="createError" severity="error" size="small">{{ createError }}</Message>
      </div>
      <template #footer>
        <Button :label="t('projects_dashboard.create_cancel')" severity="secondary" text @click="handleCloseCreate(false)" />
        <Button :label="t('projects_dashboard.create_submit')" :disabled="!isCreateValid" @click="handleSave" />
      </template>
    </Dialog>

    <!-- ═══ CREATE SUCCESS DIALOG ═══ -->
    <Dialog v-model:visible="showSuccessModal" modal :style="{ width: '380px' }">
      <div class="success-body"><i class="pi pi-check-circle" /><h2>{{ t('projects_dashboard.create_title') }}</h2><p>Project created successfully.</p></div>
    </Dialog>

    <!-- ═══ DISCARD DIALOG ═══ -->
    <Dialog v-model:visible="showDiscardModal" modal header="Discard changes?" :style="{ width: '340px' }">
      <p style="margin:0;color:#4b5563;">Unsaved changes will be lost.</p>
      <template #footer>
        <Button label="Continue editing" text severity="secondary" @click="showDiscardModal = false" />
        <Button label="Discard" severity="danger" @click="confirmDiscard" />
      </template>
    </Dialog>

    <!-- ═══ SELECT PROJECT DIALOG ═══ -->
    <Dialog v-model:visible="showSelectDialog" modal :header="t('projects_dashboard.select_title')" :style="{ width: '420px' }">
      <p class="select-dialog__text">
        {{ t('projects_dashboard.select_desc') }}
        <strong>{{ projectToSelect?.name }}</strong>
      </p>
      <p class="select-dialog__prompt">{{ t('projects_dashboard.select_prompt') }}</p>
      <template #footer>
        <Button :label="t('projects_dashboard.select_cancel')" severity="secondary" text @click="showSelectDialog = false" />
        <Button :label="t('projects_dashboard.select_continue')" @click="confirmSelect" />
      </template>
    </Dialog>

    <!-- ═══ DELETE PROJECT DIALOG ═══ -->
    <Dialog v-model:visible="showDeleteDialog" modal :header="t('projects_dashboard.delete_title')" :style="{ width: '460px' }">
      <div class="delete-dialog">
        <p class="delete-dialog__warning">
          {{ t('projects_dashboard.delete_desc_1') }} <strong>{{ projectToDelete?.name }}</strong>{{ t('projects_dashboard.delete_desc_2') }}
        </p>
        <p class="delete-dialog__prompt">
          {{ t('projects_dashboard.delete_prompt_1') }} <strong>"{{ projectToDelete?.name }}"</strong> {{ t('projects_dashboard.delete_prompt_2') }}
        </p>
        <InputText v-model="deleteConfirmName" :placeholder="t('projects_dashboard.delete_placeholder')" fluid />
      </div>
      <template #footer>
        <Button :label="t('projects_dashboard.create_cancel')" severity="secondary" text @click="showDeleteDialog = false" />
        <Button
          :label="t('projects_dashboard.delete_submit')"
          severity="danger"
          :disabled="!isDeleteValid"
          @click="confirmDelete"
        />
      </template>
    </Dialog>

    <!-- ═══ STATUS CHANGE DIALOG ═══ -->
    <Dialog v-model:visible="showStatusDialog" modal header="Change Project Status" :style="{ width: '420px' }">
      <div class="form-body">
        <div class="field">
          <label>New Status</label>
          <Select v-model="newStatus" :options="allStatusOptions" optionLabel="label" optionValue="value" fluid />
        </div>
        <div v-if="needsJustification" class="field">
          <label>Justification <span class="field__required">*</span></label>
          <Textarea v-model="statusJustification" rows="3" fluid placeholder="Document the reason for halting this project..." />
          <small v-if="needsJustification && !statusJustification.trim()" class="field__error">
            Justification is required when setting status to 'Paralizada'.
          </small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showStatusDialog = false" />
        <Button label="Update Status" :disabled="!isStatusValid" @click="confirmStatusChange" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.projects-page { padding: 2rem; background: #f4f7f6; min-height: 100%; }
.projects-page__title { font-size: 1.5rem; font-weight: 700; color: #2c3e50; margin: 0 0 1.5rem; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: white; padding: 1.25rem; border-radius: 0.5rem; border: 1px solid #e9ecef; display: flex; flex-direction: column; gap: 0.375rem; transition: transform 0.2s, box-shadow 0.2s; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.stat-card span { font-size: 0.82rem; color: #6c757d; }
.stat-card strong { font-size: 1.4rem; color: #2c3e50; }
.stat-card__red { color: #e74c3c !important; }

/* Actions */
.actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; }
.search-container { flex: 1; position: relative; }
.search-input { width: 100%; padding-left: 2.5rem; }
.search-container i { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }

/* Empty state */
.empty-state { text-align: center; padding: 4rem 2rem; color: #95a5a6; }
.empty-state__icon { font-size: 3rem; margin-bottom: 1rem; }

/* Grid */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }

/* Card base */
.project-card {
  background: white; border-radius: 0.75rem; overflow: hidden;
  border: 2px solid #e9ecef; cursor: pointer; position: relative;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.project-card:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); border-color: #bdc3c7; }

/* Current project — highlighted */
.project-card--current {
  border-color: #3498db !important; cursor: default;
  box-shadow: 0 0 0 1px #3498db, 0 4px 16px rgba(52,152,219,0.15);
}
.project-card--current:hover { transform: none; box-shadow: 0 0 0 1px #3498db, 0 4px 16px rgba(52,152,219,0.15); }

/* Current project banner */
.project-card__banner {
  background: #3498db; color: white; padding: 0.375rem 1rem;
  font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.375rem;
}

.project-card__image { width: 100%; height: 160px; object-fit: cover; background: #e9ecef; }

.project-card__body { padding: 1.25rem; position: relative; }
.project-card__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem; }
.project-card__name { font-size: 1rem; font-weight: 600; color: #2c3e50; margin: 0; }
.project-card__desc { font-size: 0.78rem; color: #7f8c8d; margin: 0 0 0.75rem; line-height: 1.4; }

/* Status tags */
.project-card__status-tag { padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 700; white-space: nowrap; }
.project-card__status-tag--planificación { background: #e3f2fd; color: #1976d2; }
.project-card__status-tag--en-ejecución { background: #e8f5e9; color: #388e3c; }
.project-card__status-tag--paralizada { background: #fff3e0; color: #e65100; }
.project-card__status-tag--finalizada { background: #f3e5f5; color: #7b1fa2; }

/* Progress */
.project-card__progress-row { display: flex; justify-content: space-between; font-size: 0.78rem; color: #7f8c8d; margin-bottom: 0.25rem; }
.project-card__progress-bar { height: 5px; background: #f0f0f0; border-radius: 3px; margin-bottom: 0.75rem; }
.project-card__progress-bar div { height: 100%; background: #4caf50; border-radius: 3px; transition: width 0.3s; }

/* Footer */
.project-card__footer { display: flex; justify-content: space-between; font-size: 0.78rem; color: #7f8c8d; }

/* Header actions (status tag + delete) */
.project-card__header-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.project-card__status-tag--clickable {
  cursor: pointer;
  transition: filter 0.2s, transform 0.15s;
}

.project-card__status-tag--clickable:hover {
  filter: brightness(0.9);
  transform: scale(1.05);
}

.project-card__delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: #95a5a6;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}

.project-card__delete-btn:hover {
  background: #fdecea;
  color: #e74c3c;
}

/* Paralizada gray progress bar */
.project-card__progress-bar--gray div {
  background: #bdc3c7 !important;
}

/* Form shared */
.form-body { display: flex; flex-direction: column; gap: 1rem; }
.date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field label { font-size: 0.82rem; font-weight: 600; color: #34495e; }
.field__error { color: #e74c3c; font-size: 0.72rem; }
.field__hint { color: #3498db; font-size: 0.72rem; }
.field__required { color: #e74c3c; }

/* Success */
.success-body { padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; }
.success-body i { font-size: 3.5rem; color: #4caf50; }
.success-body h2 { margin: 0; font-size: 1.1rem; color: #212529; }
.success-body p { margin: 0; color: #6c757d; font-size: 0.85rem; }

/* Select dialog */
.select-dialog__text { margin: 0 0 0.5rem; color: #4b5563; font-size: 0.9rem; }
.select-dialog__prompt { margin: 0; color: #6c757d; font-size: 0.85rem; }

/* Delete dialog */
.delete-dialog { display: flex; flex-direction: column; gap: 1rem; }
.delete-dialog__warning { margin: 0; color: #4b5563; font-size: 0.9rem; line-height: 1.5; }
.delete-dialog__prompt { margin: 0; color: #6c757d; font-size: 0.85rem; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .projects-grid { grid-template-columns: 1fr; }
}
</style>