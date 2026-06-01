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
import Timeline from 'primevue/timeline';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Badge from 'primevue/badge';

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

const allStatusOptions = computed(() => {
  const currentStatus = statusProject.value?.status;

  // If the project is currently 'Paralizada', only allow resuming to 'En ejecución'
  if (currentStatus === 'Paralizada') {
    return [
      { label: t('projects_dashboard.create_status_in_progress'), value: 'En ejecución' }
    ];
  }

  // If the project is NOT 'Paralizada', only allow setting it to 'Paralizada'
  return [
    { label: 'Paralizada', value: 'Paralizada' }
  ];
});

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


async function confirmStatusChange() {
  if (!isStatusValid.value || !statusProject.value) return;
  try {
    await store.updateProjectStatus(
      statusProject.value.id, newStatus.value,
      statusJustification.value.trim() || undefined,
      null
    );
    showStatusDialog.value = false; statusProject.value = null;
  } catch { console.error("Error al cambiar estado:", err); }
}

// ── Active Project Details Helpers & Document Form ──
const showAddDocDialog = ref(false);
const docForm = ref({
  name: '',
  type: 'Plano',
  version: 'v1.0',
  isSigned: false,
  deadline: null
});

const docTypes = [
  { label: 'Plano de Estructuras', value: 'Plano' },
  { label: 'Expediente Técnico', value: 'Expediente' },
  { label: 'Informe de Avance', value: 'Informe' },
  { label: 'Memoria Descriptiva', value: 'Memoria' }
];

const getTimelineIcon = (status) => {
  switch (status) {
    case 'Planificación': return 'pi pi-calendar-plus';
    case 'En ejecución': return 'pi pi-play-circle';
    case 'Paralizada': return 'pi pi-exclamation-triangle';
    case 'Finalizada': return 'pi pi-check-circle';
    default: return 'pi pi-info-circle';
  }
};

const getTimelineColor = (status) => {
  switch (status) {
    case 'Planificación': return '#3498db';
    case 'En ejecución': return '#2ecc71';
    case 'Paralizada': return '#e67e22';
    case 'Finalizada': return '#9b59b6';
    default: return '#95a5a6';
  }
};

async function handleAddDocument() {
  if (!docForm.value.name.trim()) return;
  try {
    await store.addProjectDocument(store.currentProjectId, {
      name: docForm.value.name.trim(),
      type: docForm.value.type,
      version: docForm.value.version,
      isSigned: docForm.value.isSigned,
      deadline: docForm.value.deadline?.toISOString().split('T')[0] || ''
    });
    showAddDocDialog.value = false;
    docForm.value = { name: '', type: 'Plano', version: 'v1.0', isSigned: false, deadline: null };
  } catch (err) {
    console.error('Error adding document:', err);
  }
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

          <!-- Project Progress Row -->
          <div class="project-card__progress-row">
            <span>{{ t('projects_dashboard.progress') }}</span>
            <!-- Dynamically computed progress from currentProject getter -->
            <span>{{ store.currentProject?.id === p.id ? store.currentProject.progress : p.progress }}%</span>
          </div>

          <!-- Single Progress Bar -->
          <div class="project-card__progress-bar" :class="{ 'project-card__progress-bar--gray': (store.currentProject?.id === p.id ? store.currentProject.status : p.status) === 'Paralizada' }">
            <div :style="{ width: (store.currentProject?.id === p.id ? store.currentProject.progress : (p.progress || 0)) + '%' }"></div>
          </div>

          <!-- Footer -->
          <div class="project-card__footer">
            <span><i class="pi pi-users"></i> {{ p.members }} {{ t('projects_dashboard.card_members') }}</span>
            <span>{{ p.rnc }} {{ t('projects_dashboard.card_rnc') }} | {{ p.pending }} {{ t('projects_dashboard.card_pending') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ DETALLES DEL PROYECTO SELECCIONADO (1:N STATUS LOGS & 1:N DOCUMENTS) ═══ -->
    <div v-if="store.currentProject" class="details-panel">
      <div class="details-panel__header">
        <div class="details-panel__title-area">
          <i class="pi pi-briefcase details-panel__icon"></i>
          <div>
            <h2 class="details-panel__title">Ficha Técnica: {{ store.currentProject.name }}</h2>
            <p class="details-panel__subtitle">{{ store.currentProject.location }} • {{ store.currentProject.startDate }} a {{ store.currentProject.endDate }}</p>
          </div>
        </div>
        <span class="project-card__status-tag" :class="'project-card__status-tag--' + store.currentProject.status.toLowerCase().replace(/\s/g, '-')">
          {{ store.currentProject.status }}
        </span>
      </div>

      <div class="details-panel__grid">
        <div class="details-card">
          <div class="details-card__header">
            <h3><i class="pi pi-history"></i> Historial de Estados</h3>
            <p class="details-card__desc">Trazabilidad histórica de los cambios de estado con su respectiva justificación técnica.</p>
          </div>
          <div class="details-card__content">
            <Timeline :value="store.currentProject.statusLogs || []" align="left" class="custom-timeline">
              <template #marker="slotProps">
                <span class="timeline-marker" :style="{ backgroundColor: getTimelineColor(slotProps.item.status) }">
                  <i :class="getTimelineIcon(slotProps.item.status)" style="color: white; font-size: 0.75rem;"></i>
                </span>
              </template>
              <template #content="slotProps">
                <div class="timeline-item-card">
                  <div class="timeline-item-header">
                    <span class="timeline-item-status" :style="{ color: getTimelineColor(slotProps.item.status) }">
                      {{ slotProps.item.status }}
                    </span>
                    <span class="timeline-item-date">{{ slotProps.item.date }}</span>
                  </div>
                  <p class="timeline-item-justification">{{ slotProps.item.justification }}</p>
                  <div v-if="slotProps.item.progress !== null" class="timeline-item-progress">
                    Avance asignado: <span class="font-bold text-gray-800">{{ slotProps.item.progress }}%</span>
                  </div>
                </div>
              </template>
            </Timeline>
            <div v-if="!store.currentProject.statusLogs || store.currentProject.statusLogs.length === 0" class="empty-detail-state">
              <i class="pi pi-info-circle mr-1"></i> Sin registros de cambios de estado.
            </div>
          </div>
        </div>

        <!-- Columna 2: Planos y Expedientes Técnicos (DataTable de PrimeVue) -->
        <div class="details-card">
          <div class="details-card__header flex-row-between">
            <div>
              <h3><i class="pi pi-file"></i> Expedientes y Planos Técnicos</h3>
              <p class="details-card__desc">Lista de planos constructivos y especificaciones técnicas aprobadas para esta obra.</p>
            </div>
            <Button label="Subir Plano" icon="pi pi-plus" size="small" severity="success" outlined @click="showAddDocDialog = true" />
          </div>
          <div class="details-card__content">
            <DataTable :value="store.currentProject.documents || []" responsiveLayout="scroll" class="p-datatable-sm custom-datatable" :paginator="true" :rows="3">
              <Column field="name" header="Nombre Documento / Plano" sortable>
                <template #body="slotProps">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-file-pdf text-red-500 text-lg"></i>
                    <span class="font-semibold text-gray-800">{{ slotProps.data.name }}</span>
                  </div>
                </template>
              </Column>
              <Column field="type" header="Tipo" sortable style="width: 20%">
                <template #body="slotProps">
                  <Badge :value="slotProps.data.type" severity="info" />
                </template>
              </Column>
              <Column field="version" header="Versión" style="width: 15%">
                <template #body="slotProps">
                  <span class="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border">{{ slotProps.data.version }}</span>
                </template>
              </Column>
              <Column field="isSigned" header="Firma Digital" sortable style="width: 20%">
                <template #body="slotProps">
                  <Badge 
                    :value="slotProps.data.isSigned ? 'Firmado' : 'Pendiente'" 
                    :severity="slotProps.data.isSigned ? 'success' : 'danger'" 
                  />
                </template>
              </Column>
              <Column field="deadline" header="Vence" sortable style="width: 15%"></Column>
            </DataTable>
            <div v-if="!store.currentProject.documents || store.currentProject.documents.length === 0" class="empty-detail-state">
              <i class="pi pi-folder-open mr-1"></i> No se han registrado planos ni especificaciones para esta obra.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ DIÁLOGO PARA AÑADIR PLANO / DOCUMENTO TÉCNICO ═══ -->
    <Dialog v-model:visible="showAddDocDialog" modal header="Subir Plano o Documento Técnico" :style="{ width: '450px' }">
      <div class="form-body">
        <div class="field">
          <label>Nombre del Documento / Plano <span class="field__required">*</span></label>
          <InputText v-model="docForm.name" placeholder="Ej. Plano de Cimentaciones Sector B" fluid />
        </div>
        <div class="field">
          <label>Tipo de Elemento</label>
          <Select v-model="docForm.type" :options="docTypes" optionLabel="label" optionValue="value" fluid />
        </div>
        <div class="field">
          <label>Versión</label>
          <InputText v-model="docForm.version" placeholder="Ej. v1.0" fluid />
        </div>
        <div class="field">
          <label>Estado de Firma Digital</label>
          <div class="flex gap-4 mt-1">
            <div class="flex items-center gap-2">
              <input type="radio" id="signed-true" :value="true" v-model="docForm.isSigned" />
              <label for="signed-true" class="cursor-pointer text-sm">Firmado Digitalmente</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="radio" id="signed-false" :value="false" v-model="docForm.isSigned" />
              <label for="signed-false" class="cursor-pointer text-sm">Firma Pendiente</label>
            </div>
          </div>
        </div>
        <div class="field">
          <label>Fecha Límite para Aprobación</label>
          <DatePicker v-model="docForm.deadline" showIcon fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="showAddDocDialog = false" />
        <Button label="Registrar Documento" :disabled="!docForm.name.trim()" @click="handleAddDocument" />
      </template>
    </Dialog>

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

/* ── Active Project Details Section ── */
.details-panel {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 2px solid #e9ecef;
  margin-top: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  animation: detailsFadeIn 0.3s ease-out;
}

@keyframes detailsFadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.details-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1.25rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.details-panel__title-area {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.details-panel__icon {
  font-size: 1.5rem;
  color: #1abc9c;
  background: #e8f8f5;
  padding: 0.75rem;
  border-radius: 0.75rem;
}

.details-panel__title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.details-panel__subtitle {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: 0.25rem 0 0;
}

.details-panel__grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .details-panel__grid {
    grid-template-columns: 1fr;
  }
}

.details-card {
  background: #fafbfc;
  border: 1px solid #eef2f5;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.01);
}

.details-card__header {
  margin-bottom: 1.5rem;
}

.flex-row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.details-card__header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.details-card__header h3 i {
  color: #3498db;
}

.details-card__desc {
  font-size: 0.8rem;
  color: #95a5a6;
  margin: 0.25rem 0 0;
}

.details-card__content {
  flex: 1;
}

/* Timeline Custom Styles */
.custom-timeline {
  padding: 0.5rem 0;
}

.timeline-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.timeline-item-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.01);
  margin-left: 0.5rem;
}

.timeline-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-item-status {
  font-size: 0.85rem;
  font-weight: 700;
}

.timeline-item-date {
  font-size: 0.75rem;
  color: #95a5a6;
}

.timeline-item-justification {
  font-size: 0.8rem;
  color: #555;
  margin: 0 0 0.5rem;
  line-height: 1.5;
}

.timeline-item-progress {
  font-size: 0.75rem;
  color: #7f8c8d;
  border-top: 1px dashed #e9ecef;
  padding-top: 0.5rem;
  display: flex;
  justify-content: space-between;
}

.empty-detail-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #95a5a6;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Datatable Custom Styles */
.custom-datatable {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.custom-datatable :deep(.p-datatable-thead > tr > th) {
  background-color: #f8f9fa;
  font-size: 0.82rem;
  font-weight: 700;
  color: #4b5563;
  padding: 0.75rem 1rem;
}

.custom-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
}
</style>