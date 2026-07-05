<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useProjectsStore } from '../../data/useProjectsStore';
import { useAdvanceStore } from '@/domains/progress-monitoring/application/advancesStore.js';
import { teamUserApi } from '@/domains/team/infrastructure/team-user.api.js';
import { LocalFileStorageService } from '@/shared/infrastructure/local-file-storage.service.js';

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
import RadioButton from 'primevue/radiobutton';
import Menu from 'primevue/menu';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const translateStatus = (status) => {
  if (!status) return '';
  switch(status.toLowerCase()) {
    case 'planificación': return t('projects_dashboard.status.planned');
    case 'en ejecución': return t('projects_dashboard.status.in_progress');
    case 'paralizada': return t('projects_dashboard.status.halted');
    case 'finalizada': return t('projects_dashboard.status.completed');
    default: return status;
  }
};

const store = useProjectsStore();
const advanceStore = useAdvanceStore();

// ── Search ──
const searchQuery = ref('');

const displayProjects = computed(() => {
  let list = store.projects;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }
  return list;
});

// ── Dynamic stats ──
const averageAdvance = computed(() => {
  const list = displayProjects.value;
  if (list.length === 0) return 0;
  const sum = list.reduce((acc, p) => acc + calculateProjectProgress(p), 0);
  return Math.round(sum / list.length);
});

const totalRnc = computed(() =>
  displayProjects.value.reduce((acc, p) => acc + calculateProjectRnc(p), 0)
);

const totalCollaborators = computed(() =>
  displayProjects.value.reduce((acc, p) => acc + calculateProjectMembers(p), 0)
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
      budget: Number(form.value.budget),
      status: form.value.status
    });
    form.value = { ...initialForm }; createError.value = '';
    showCreateModal.value = false; showSuccessModal.value = true;

    // Auto-registrar al creador como TeamUser del proyecto
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const currentUser = JSON.parse(userStr);
        if (currentUser?.id) {
          const { useTeamUserStore } = await import('@/domains/team/application/team-user.store.js')
          const teamStore = useTeamUserStore()
          await teamStore.inviteUser({
            userId: Number(currentUser.id),
            fullName: currentUser.name || currentUser.email,
            email: currentUser.email,
            role: 'Administrador'
          })
          await teamStore.fetchPendingInvitations()
          const myInv = teamStore.pendingInvitations.find(n => String(n.userId) === String(currentUser.id))
          if (myInv) await teamStore.acceptInvitation(myInv.id)
        }
      }
    } catch (e) {
      console.error('Error auto-registrando creador como TeamUser:', e)
    }
  } catch (error) { console.log('CREATE ERROR:', error.response?.data); createError.value = error.response?.data?.message || 'Error creating project.'; }
}

// ── Select project ──
const showSelectDialog = ref(false);
const projectToSelect = ref(null);

function onCardClick(project) {
  if (String(project.id) === String(store.currentProjectId)) return;
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
    { label: t('projects_dashboard.status.halted'), value: 'Paralizada' }
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
  } catch (err) { console.error("Error al cambiar estado:", err); }
}

// ── Active Project Details Helpers & Document Form ──
const showLegalCheckDialog = ref(false);
const showAddDocDialog = ref(false);
const newDocForm = ref({
  name: '',
  type: 'Plano de Estructuras',
  file: null,
  fileError: ''
});
const showEditDocDialog = ref(false);
const editDocForm = ref({ id: null, name: '' });

const handleLegalYes = () => {
  showLegalCheckDialog.value = false;
  router.push({ name: 'Signatures', query: { openCreate: 'true' } });
};
const handleLegalNo = () => {
  showLegalCheckDialog.value = false;
  showAddDocDialog.value = true;
};
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 100 * 1024 * 1024) {
      newDocForm.value.fileError = t('projects_dashboard.details.modal.file_error_size');
      newDocForm.value.file = null;
      event.target.value = '';
    } else {
      newDocForm.value.fileError = '';
      newDocForm.value.file = file;
    }
  }
};

const docMenu = ref();
const activeDoc = ref(null);
const docMenuOptions = ref([
  {
    label: () => t('projects_dashboard.details.table.action_download'),
    icon: 'pi pi-download',
    command: async () => {
      if (activeDoc.value?.fileId) {
        const file = await LocalFileStorageService.getFile(activeDoc.value.fileId);
        if (file) {
          const url = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = url;
          a.download = activeDoc.value.fileName || activeDoc.value.name;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    }
  },
  {
    label: () => t('projects_dashboard.details.table.action_edit'),
    icon: 'pi pi-pencil',
    command: () => {
      editDocForm.value = { id: activeDoc.value.id, name: activeDoc.value.name };
      showEditDocDialog.value = true;
    }
  },
  {
    label: () => t('projects_dashboard.details.table.action_delete'),
    icon: 'pi pi-trash',
    command: async () => {
      await store.deleteProjectDocument(store.currentProjectId, activeDoc.value.id);
      if (activeDoc.value.fileId) {
        await LocalFileStorageService.deleteFile(activeDoc.value.fileId);
      }
    }
  }
]);

const toggleDocMenu = (event, doc) => {
  activeDoc.value = doc;
  docMenu.value.toggle(event);
};

const saveEditDoc = async () => {
  if (editDocForm.value.name.trim()) {
    await store.updateProjectDocument(store.currentProjectId, editDocForm.value.id, { name: editDocForm.value.name.trim() });
    showEditDocDialog.value = false;
  }
};

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

async function addTechnicalDocument() {
  if (!newDocForm.value.name.trim()) return;
  if (!newDocForm.value.file) {
    newDocForm.value.fileError = t('projects_dashboard.details.modal.file_error_req');
    return;
  }
  try {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2,6)}`;
    await LocalFileStorageService.saveFile(fileId, newDocForm.value.file);

    await store.addProjectDocument(store.currentProjectId, {
      name: newDocForm.value.name.trim(),
      type: newDocForm.value.type,
      fileId: fileId,
      fileName: newDocForm.value.file.name
    });
    showAddDocDialog.value = false;
    newDocForm.value = { name: '', type: 'Plano de Estructuras', file: null, fileError: '' };
  } catch (err) {
    console.error('Error adding document:', err);
  }
}

const showFullHistoryDialog = ref(false);

const calculateProjectProgress = (p) => {
  const projectAdvances = advanceStore.advances.filter(a => String(a.projectId) === String(p.id));
  if (projectAdvances.length === 0) return 0;

  const totalWeightedSum = projectAdvances.reduce((sum, item) =>
      sum + (Number(item.currentPercentage || 0) * Number(item.weight || 1)), 0);

  const totalWeight = projectAdvances.reduce((sum, item) =>
      sum + Number(item.weight || 1), 0);

  return totalWeight > 0 ? Math.round(totalWeightedSum / totalWeight) : 0;
};

const calculateProjectStatus = (p) => {
  if (p.status === 'Paralizada') return 'Paralizada';
  const progress = calculateProjectProgress(p);
  return progress >= 100 ? 'Finalizada' : (progress > 0 ? 'En ejecución' : 'Planificación');
};

const slicedStatusLogs = computed(() => {
  const logs = store.currentProject?.statusLogs || [];
  return [...logs].reverse().slice(0, 3);
});

const reversedFullLogs = computed(() => {
  const logs = store.currentProject?.statusLogs || [];
  return [...logs].reverse();
});

const allNcrs = ref([]);
const projectMembers = ref({});

import { NcrRepository } from '@/domains/ncr/infrastructure/NcrRepository.js';

const loadGlobalData = async () => {
  await store.loadProjects();
  
  const ncrRepo = new NcrRepository();
  allNcrs.value = await ncrRepo.getAll();
  
  for (const p of store.projects) {
    try {
      const users = await teamUserApi.getAllUsers(p.id);
      projectMembers.value[p.id] = users && users.length > 0 ? users.length : 1;
    } catch(e) {
      projectMembers.value[p.id] = 1;
    }
  }
  
  await advanceStore.loadAdvances();
};

onMounted(async () => {
  if (!route.meta?.hideSidebar) {
    await loadGlobalData();
  }
});

// Refresh data when route changes in case it's cached
watch(() => route.fullPath, async () => {
  if (!route.meta?.hideSidebar) {
    await loadGlobalData();
  }
});

const calculateProjectRnc = (p) => {
  if (!allNcrs.value) return 0;
  return allNcrs.value.filter(n => String(n.projectId) === String(p.id) && n.status !== 'Cerrado').length;
};

const calculateProjectMembers = (p) => {
  return projectMembers.value[p.id] || 1;
};
</script>

<template>
  <div class="projects-page">
    <h1 class="projects-page__title">{{ t('projects_dashboard.title') }}</h1>

    <!-- Top metrics -->
    <header class="stats-grid">
      <div class="stat-card">
        <span><i class="pi pi-folder-open text-blue-500 mr-2"></i>{{ t('projects_dashboard.active_projects') }}</span>
        <strong>{{ store.totalProjects }}</strong>
      </div>
      <div class="stat-card">
        <span><i class="pi pi-chart-line text-green-500 mr-2"></i>{{ t('projects_dashboard.average_advance') }}</span>
        <strong>{{ averageAdvance }}%</strong>
      </div>
      <div class="stat-card">
        <span><i class="pi pi-exclamation-triangle text-orange-500 mr-2"></i>{{ t('projects_dashboard.open_rncs') }}</span>
        <strong class="stat-card__red">{{ totalRnc }}</strong>
      </div>
      <div class="stat-card">
        <span><i class="pi pi-users text-cyan-500 mr-2"></i>{{ totalCollaborators === 1 ? 'Colaborador' : t('projects_dashboard.collaborators') }}</span>
        <strong>{{ totalCollaborators }}</strong>
      </div>
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
    <div v-if="displayProjects.length === 0" class="empty-state">
      <i class="pi pi-folder-open empty-state__icon"></i>
      <h3>{{ t('projects_dashboard.empty_state_title') }}</h3>
      <p>{{ t('projects_dashboard.empty_state_desc') }}</p>
    </div>

    <!-- Projects grid -->
    <div v-else class="projects-grid">
      <div
        v-for="p in displayProjects"
        :key="p.id"
        class="project-card"
        :class="{ 'project-card--current': String(p.id) === String(store.currentProjectId) }"
        @click="onCardClick(p)"
      >
        <!-- Current project banner -->
        <div v-if="String(p.id) === String(store.currentProjectId)" class="project-card__banner">
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
              >{{ translateStatus(p.status) }}</span>
              <Button
                icon="pi pi-sync"
                severity="secondary"
                text rounded
                v-tooltip.top="t('projects_dashboard.details.tooltips.change_status')"
                @click.stop="openStatusDialog(p)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text rounded
                v-tooltip.top="t('projects_dashboard.details.tooltips.delete')"
                @click.stop="openDeleteDialog(p)"
              />
            </div>
          </div>

          <p v-if="p.description" class="project-card__desc">{{ p.description }}</p>

          <!-- Project Progress Row -->
          <div class="project-card__progress-row">
            <span>{{ t('projects_dashboard.progress') }}</span>
            <span>{{ calculateProjectProgress(p) }}%</span>
          </div>

          <!-- Single Progress Bar -->
          <div class="project-card__progress-bar" :class="{ 'project-card__progress-bar--gray': p.status === 'Paralizada' }">
            <div :style="{ width: calculateProjectProgress(p) + '%' }"></div>
          </div>

          <!-- Footer -->
          <div class="project-card__footer">
            <span><i class="pi pi-users"></i> {{ calculateProjectMembers(p) }} {{ calculateProjectMembers(p) === 1 ? 'miembro' : t('projects_dashboard.card_members') }}</span>
            <span>{{ calculateProjectRnc(p) }} {{ t('projects_dashboard.card_rnc') }} | {{ p.pending }} {{ t('projects_dashboard.card_pending') }}</span>
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
            <h2 class="details-panel__title">{{ t('projects_dashboard.details.title', { name: store.currentProject.name }) }}</h2>
            <p class="details-panel__subtitle">{{ store.currentProject.location }} • {{ store.currentProject.startDate }} a {{ store.currentProject.endDate }}</p>
          </div>
        </div>
        <span class="project-card__status-tag" :class="'project-card__status-tag--' + store.currentProject.status.toLowerCase().replace(/\s/g, '-')">
          {{ translateStatus(store.currentProject.status) }}
        </span>
      </div>

      <div class="details-panel__grid">
        <div class="details-card">
          <div class="details-card__header">
            <h3><i class="pi pi-history"></i> {{ t('projects_dashboard.details.history_title') }}</h3>
            <p class="details-card__desc">{{ t('projects_dashboard.details.history_desc') }}</p>
          </div>
          <div class="details-card__content">
            <Timeline :value="slicedStatusLogs" align="left" class="custom-timeline">
              <template #marker="slotProps">
                <span class="timeline-marker-simple"></span>
              </template>
              <template #content="slotProps">
                <div class="timeline-item-simple">
                  <div class="timeline-item-date">{{ slotProps.item.date }}</div>
                  <div class="timeline-item-status">Status: {{ translateStatus(slotProps.item.status) }}</div>
                  <p class="timeline-item-justification">"{{ slotProps.item.justification }}"</p>
                  <div class="timeline-item-author">By: {{ slotProps.item.author || 'System' }}</div>
                </div>
              </template>
            </Timeline>
            <div v-if="store.currentProject.statusLogs && store.currentProject.statusLogs.length > 3" class="flex justify-center mt-3">
              <Button :label="t('projects_dashboard.details.history_full_btn')" icon="pi pi-external-link" size="small" outlined @click="showFullHistoryDialog = true" class="w-full" />
            </div>
            <div v-if="!store.currentProject.statusLogs || store.currentProject.statusLogs.length === 0" class="empty-detail-state">
              <i class="pi pi-info-circle mr-1"></i> {{ t('projects_dashboard.details.history_empty') }}
            </div>
          </div>
        </div>

        <!-- Columna 2: Planos y Expedientes Técnicos (DataTable de PrimeVue) -->
        <div class="details-card">
          <div class="details-card__header flex-row-between">
            <div>
              <h3><i class="pi pi-file"></i> {{ t('projects_dashboard.details.docs_title') }}</h3>
              <p class="details-card__desc">{{ t('projects_dashboard.details.docs_desc') }}</p>
            </div>
            <Button :label="t('projects_dashboard.details.docs_upload_btn')" icon="pi pi-plus" size="small" severity="success" outlined @click="showLegalCheckDialog = true" />
          </div>
          <div class="details-card__content p-0 mt-4">
            <DataTable :value="store.currentProject.documents || []" class="p-datatable-sm documents-table" responsiveLayout="scroll">
              <Column field="name" :header="t('projects_dashboard.details.table.name')" sortable></Column>
              <Column field="type" :header="t('projects_dashboard.details.table.type')" sortable>
                <template #body="slotProps">
                  <span class="doc-type-badge">{{ slotProps.data.type }}</span>
                </template>
              </Column>
              <Column field="uploadDate" :header="t('projects_dashboard.details.table.added_on')" sortable align="center"></Column>
              <Column :header="t('projects_dashboard.details.table.actions')" align="center">
                <template #body="slotProps">
                  <Button icon="pi pi-ellipsis-v" text rounded @click="toggleDocMenu($event, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" />
                </template>
              </Column>
              <template #empty>
                <div class="empty-docs-state">
                  <i class="pi pi-folder-open mb-2 text-gray-400 text-2xl"></i>
                  <p>{{ t('projects_dashboard.details.docs_empty') }}</p>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </div>

      <Menu ref="docMenu" id="overlay_menu" :model="docMenuOptions" :popup="true" />

    <!-- ═══ MODAL PREGUNTA LEGAL ═══ -->
    <Dialog v-model:visible="showLegalCheckDialog" modal :header="t('projects_dashboard.details.modal.legal_title')" :style="{ width: '400px' }">
      <div class="py-4 text-center">
        <i class="pi pi-question-circle text-4xl text-blue-500 mb-4"></i>
        <p class="text-lg text-gray-700">{{ t('projects_dashboard.details.modal.legal_question') }}</p>
      </div>
      <template #footer>
        <Button :label="t('projects_dashboard.details.modal.legal_no')" severity="secondary" text @click="handleLegalNo" />
        <Button :label="t('projects_dashboard.details.modal.legal_yes')" severity="primary" @click="handleLegalYes" />
      </template>
    </Dialog>

    <!-- ═══ SUBIR PLANO O DOCUMENTO TÉCNICO DIALOG ═══ -->
    <Dialog v-model:visible="showAddDocDialog" modal :header="t('projects_dashboard.details.modal.title')" :style="{ width: '450px' }">
      <div class="flex flex-col gap-4 py-4">
        <div class="field">
          <label>{{ t('projects_dashboard.details.modal.name_label') }}</label>
          <InputText v-model="newDocForm.name" :placeholder="t('projects_dashboard.details.modal.name_placeholder')" fluid />
        </div>
        <div class="field">
          <label>{{ t('projects_dashboard.details.modal.type_label') }}</label>
          <Select v-model="newDocForm.type" :options="['Plano de Estructuras', 'Plano de Arquitectura', 'Estudio de Suelos', 'Especificaciones Técnicas']" fluid />
        </div>
        <div class="field">
          <label>{{ t('projects_dashboard.details.modal.file_label') }}</label>
          <input type="file" @change="handleFileUpload" class="p-inputtext p-component w-full" accept=".pdf,.dwg,.doc,.docx,.xls,.xlsx,.jpg,.png" />
          <small v-if="newDocForm.fileError" class="text-red-500">{{ newDocForm.fileError }}</small>
        </div>
      </div>
      <template #footer>
        <Button :label="t('projects_dashboard.details.modal.btn_cancel')" severity="secondary" text @click="showAddDocDialog = false" />
        <Button :label="t('projects_dashboard.details.modal.btn_submit')" severity="success" @click="addTechnicalDocument" />
      </template>
    </Dialog>

    <!-- ═══ EDITAR DOCUMENTO DIALOG ═══ -->
    <Dialog v-model:visible="showEditDocDialog" modal :header="t('projects_dashboard.details.modal.edit_title')" :style="{ width: '400px' }">
      <div class="flex flex-col gap-4 py-4">
        <div class="field">
          <label>{{ t('projects_dashboard.details.modal.name_label') }}</label>
          <InputText v-model="editDocForm.name" fluid />
        </div>
      </div>
      <template #footer>
        <Button :label="t('projects_dashboard.details.modal.btn_cancel')" severity="secondary" text @click="showEditDocDialog = false" />
        <Button :label="t('projects_dashboard.details.modal.btn_submit')" severity="success" @click="saveEditDoc" />
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
      <div class="success-body"><i class="pi pi-check-circle" /><h2>{{ t('projects_dashboard.create_title') }}</h2><p>{{ t('projects_dashboard.create_success_msg') }}</p></div>
    </Dialog>

    <!-- ═══ DISCARD DIALOG ═══ -->
    <Dialog v-model:visible="showDiscardModal" modal :header="t('projects_dashboard.discard_dialog.title')" :style="{ width: '340px' }">
      <p style="margin:0;color:#4b5563;">{{ t('projects_dashboard.discard_dialog.message') }}</p>
      <template #footer>
        <Button :label="t('projects_dashboard.discard_dialog.continue')" text severity="secondary" @click="showDiscardModal = false" />
        <Button :label="t('projects_dashboard.discard_dialog.discard')" severity="danger" @click="confirmDiscard" />
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

    <!-- ⚡⚡⚡ STATUS CHANGE DIALOG ⚡⚡⚡ -->
    <Dialog v-model:visible="showStatusDialog" modal :header="t('projects_dashboard.change_status_dialog.title')" :style="{ width: '420px' }">
      <div class="form-body">
        <div class="field">
          <label>{{ t('projects_dashboard.change_status_dialog.new_status') }}</label>
          <Select v-model="newStatus" :options="allStatusOptions" optionLabel="label" optionValue="value" fluid />
        </div>
        <div v-if="needsJustification" class="field">
          <label>{{ t('projects_dashboard.change_status_dialog.justification') }} <span class="field__required">*</span></label>
          <Textarea v-model="statusJustification" rows="3" fluid :placeholder="t('projects_dashboard.change_status_dialog.justification_ph')" />
          <small v-if="needsJustification && !statusJustification.trim()" class="field__error">
            {{ t('projects_dashboard.change_status_dialog.justification_req') }}
          </small>
        </div>
      </div>
      <template #footer>
        <Button :label="t('projects_dashboard.change_status_dialog.cancel')" severity="secondary" text @click="showStatusDialog = false" />
        <Button :label="t('projects_dashboard.change_status_dialog.submit')" :disabled="!isStatusValid" @click="confirmStatusChange" />
      </template>
    </Dialog>

    <!-- ═══ FULL HISTORY STATUS LOGS DIALOG ═══ -->
    <Dialog
        v-model:visible="showFullHistoryDialog"
        header="Historial Completo de Estados"
        :modal="true"
        :style="{ width: '600px' }"
        dismissableMask
    >
      <div class="max-h-96 overflow-y-auto px-2 py-4">
        <Timeline :value="reversedFullLogs" align="left" class="custom-timeline">
          <template #marker="slotProps">
            <span class="timeline-marker-simple"></span>
          </template>
          <template #content="slotProps">
            <div class="timeline-item-simple">
              <div class="timeline-item-date">{{ slotProps.item.date }}</div>
              <div class="timeline-item-status">Status: {{ translateStatus(slotProps.item.status) }}</div>
              <p class="timeline-item-justification">"{{ slotProps.item.justification }}"</p>
              <div class="timeline-item-author">By: {{ slotProps.item.author || 'System' }}</div>
            </div>
          </template>
        </Timeline>
      </div>
      <template #footer>
        <Button label="Cerrar" severity="secondary" text @click="showFullHistoryDialog = false" />
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
.project-card__header { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
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

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .actions-bar { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
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
  min-width: 0;
  max-width: 100%;
}

.details-card__content {
  overflow-x: auto;
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

.custom-timeline :deep(.p-timeline-event-opposite) {
  display: none !important;
}

.custom-timeline :deep(.p-timeline-event-content) {
  padding: 0 0 1.5rem 1.5rem;
}

.custom-timeline :deep(.p-timeline-event-connector) {
  width: 1px;
  background-color: #e2e8f0;
}

.timeline-marker-simple {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background-color: white;
  margin-top: 5px;
}

.timeline-item-simple {
  padding-bottom: 0;
}

.timeline-item-date {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.timeline-item-status {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.timeline-item-justification {
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
  margin: 0 0 0.25rem 0;
}

.timeline-item-author {
  font-size: 0.75rem;
  color: #94a3b8;
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
