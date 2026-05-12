<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// Importación del store reactivo para mantener los datos
import { allNcrs } from '../../data/ncrStore.js';
import { allProjects } from '../../../project-management/data/projectsStore.js';
import NcrListItem from './NcrListItem.vue';

import Button from 'primevue/button';
import Select from 'primevue/select';

const router = useRouter();
const selectedProject = ref(null);

/**
 * Obtiene el nombre del proyecto basado en su ID
 */
const getProjectName = (id) => {
  const project = allProjects.value.find(p => p.id === id);
  return project ? project.name : '-';
};

/**
 * Filtra los NCRs del store basándose en el proyecto seleccionado
 */
const filteredNcrs = computed(() => {
  if (!selectedProject.value) return allNcrs.value;
  return allNcrs.value.filter(item => item.projectId === selectedProject.value.id);
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

    <div class="filters-bar">
      <Select
          v-model="selectedProject"
          :options="allProjects"
          optionLabel="name"
          placeholder="Filtrar por Proyecto"
          class="project-selector"
          showClear
      />
    </div>

    <div class="ncr-cards-list">
      <NcrListItem
          v-for="ncr in filteredNcrs"
          :key="ncr.id"
          :ncr="ncr"
          :project-name="getProjectName(ncr.projectId)"
      />

      <div v-if="filteredNcrs.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>No se encontraron registros de no conformidad.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ncr-view-container {
  padding: 1.5rem 2rem;
}

.ncr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.header-text h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
}

.subtitle {
  color: #64748b;
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.create-btn {
  background-color: #ef4444;
  border: none;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
}

.filters-bar {
  margin-bottom: 2rem;
}

.project-selector {
  width: 320px;
}

/* Contenedor de la lista para separar los cuadros entre sí */
.ncr-cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Pequeño espacio entre cada cuadro */
}

.empty-state {
  text-align: center;
  padding: 5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
  color: #94a3b8;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>