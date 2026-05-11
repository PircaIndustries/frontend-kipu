<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { allNcrs } from '../../data/ncrStore';
import { allProjects } from '../../../projects/data/projectsStore';
import NcrListItem from './NcrListItem.vue'

import Button from 'primevue/button';
import Select from 'primevue/select';

const router = useRouter();
const selectedProject = ref(null);

const getProjectName = (id) => {
  const project = allProjects.value.find(p => p.id === id);
  return project ? project.name : '-';
};

const filteredNcrs = computed(() => {
  if (!selectedProject.value) return allNcrs.value;
  return allNcrs.value.filter(item => item.projectId === selectedProject.value.id);
});
</script>

<template>
  <div class="view-content">
    <header class="ncr-header">
      <div class="title-group">
        <h1>No Conformidades (RNC)</h1>
        <p class="subtitle">Gestión de incidencias y tickets de alerta</p>
      </div>
      <Button
          label="Crear Nuevo RNC"
          icon="pi pi-plus"
          class="btn-new-ncr"
          @click="router.push({ name: 'RegisterNcr' })"
      />
    </header>

    <div class="filters-bar">
      <Select
          v-model="selectedProject"
          :options="allProjects"
          optionLabel="name"
          placeholder="Filtrar por Proyecto"
          class="filter-select"
          showClear
      />
    </div>

    <div class="ncr-list-container">
      <div v-if="filteredNcrs.length" class="list-wrapper">
        <NcrListItem
            v-for="item in filteredNcrs"
            :key="item.id"
            :ncr="item"
            :project-name="getProjectName(item.projectId)"
        />
      </div>

      <div v-else class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>No hay reportes de no conformidad registrados.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-content { padding: 1.5rem 0; }
.ncr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.title-group h1 { margin: 0; font-size: 1.6rem; color: #1e293b; font-weight: 700; }
.subtitle { color: #64748b; font-size: 0.95rem; }

.btn-new-ncr { background-color: #ef4444; border: none; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 8px; }
.btn-new-ncr:hover { background-color: #dc2626 !important; }

.filters-bar { margin-bottom: 2rem; }
.filter-select { width: 300px; }

.ncr-list-container {
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  background: #f8fafc;
  border-radius: 12px;
  color: #94a3b8;
  border: 2px dashed #e2e8f0;
}

.empty-state i { font-size: 2.5rem; margin-bottom: 1rem; }
</style>