<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NcrRepository } from '../../infrastructure/NcrRepository.js';
import { useProjectsStore } from '../../../project-management/data/useProjectsStore.js';
import NcrListItem from './NcrListItem.vue';
import Button from 'primevue/button';

const router = useRouter();
const repository = new NcrRepository();
const projectsStore = useProjectsStore();
const ncrs = ref([]);

onMounted(async () => {
  await projectsStore.loadProjects();
  ncrs.value = await repository.getAll();
});

const getProjectName = (id) => {
  const project = projectsStore.projects.find(p => p.id === id);
  return project ? project.name : '-';
};

const filteredNcrs = computed(() => {
  const currentId = projectsStore.currentProjectId;
  if (!currentId) return [];
  return ncrs.value.filter(item => String(item.projectId) === String(currentId));
});

const handleCreateNew = () => {
  router.push({ name: 'RegisterNcr' });
};
</script>

<template>
  <div class="ncr-view-container">
    <header class="ncr-header">
      <div class="header-text">
        <h1>No Conformidades (RNC)</h1>
        <p class="subtitle">Gestión de incidencias y tickets de alerta en obra</p>
      </div>
      <Button
          label="Crear Nuevo RNC"
          icon="pi pi-plus"
          class="p-button-danger create-btn"
          @click="handleCreateNew"
      />
    </header>



    <div class="ncr-cards-list">
      <NcrListItem
          v-for="item in filteredNcrs"
          :key="item.id"
          :ncr="item"
          :project-name="getProjectName(item.projectId)"
      />

      <div v-if="filteredNcrs.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>No se encontraron registros de no conformidad.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ncr-view-container { padding: 1.5rem 2rem; }
.ncr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.header-text h1 { margin: 0; font-size: 1.75rem; font-weight: 800; color: #1e293b; }
.subtitle { color: #64748b; margin-top: 0.25rem; font-size: 0.95rem; }
.create-btn { background-color: #ef4444; border: none; font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 8px; }
.filters-bar { margin-bottom: 2rem; }
.project-selector { width: 320px; }
.ncr-cards-list { display: flex; flex-direction: column; gap: 0.5rem; }
.empty-state { text-align: center; padding: 5rem; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0; color: #94a3b8; }
.empty-state i { font-size: 3rem; margin-bottom: 1rem; }

@media (max-width: 768px) {
  .ncr-view-container { padding: 1rem; }
  .ncr-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .create-btn { width: 100%; justify-content: center; }
}
</style>