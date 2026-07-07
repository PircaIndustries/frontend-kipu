<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { NcrRepository } from '../../infrastructure/NcrRepository.js';
import { useProjectsStore } from '../../../project-management/data/useProjectsStore.js';
import { useI18n } from 'vue-i18n';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Message from 'primevue/message';

const router = useRouter();
const repository = new NcrRepository();
const projectsStore = useProjectsStore();
const { t } = useI18n();

const saveError = ref(false);

const severityOptions = computed(() => [
  { label: t('ncr.register.severity_low', 'Bajo'), value: 'Bajo' },
  { label: t('ncr.register.severity_moderate', 'Moderado'), value: 'Moderado' },
  { label: t('ncr.register.severity_high', 'Alto'), value: 'Alto' },
  { label: t('ncr.register.severity_critical', 'Critico'), value: 'Critico' }
]);

const form = ref({
  title: '',
  description: '',
  specialty: '',
  severity: 'Moderado',
});

onMounted(async () => {
  try {
    await projectsStore.loadProjects();
  } catch (error) {
    console.error("Error al cargar proyectos:", error);
  }
});

const handleSave = async () => {
  if (!form.value.title || !projectsStore.currentProjectId) {
    saveError.value = true;
    return;
  }

  saveError.value = false;

  const severityString = String(form.value.severity);

  const newNcrEntry = {
    title: form.value.title,
    description: form.value.description || 'Sin descripción',
    severity: severityString, // Asegura mandar texto: "Bajo", "Moderado", "Alto", "Critico"
    projectId: parseInt(projectsStore.currentProjectId, 10),
    speciality: form.value.specialty || 'General'
  };

  try {
    await repository.save(newNcrEntry);
    router.push({ name: 'Registry' });
  } catch (error) {
    console.error("Error devuelto por el backend Kipu API:", error.response?.data || error.message);
    saveError.value = true;
  }
};
</script>

<template>
  <div class="register-container">
    <header class="form-header">
      <div class="title-group">
        <h1>{{ t('ncr.register.title', 'Registrar RNC') }}</h1>
        <p class="subtitle">{{ t('ncr.register.subtitle', 'Genere una alerta inmediata para el equipo de diseño') }}</p>
      </div>
      <Button icon="pi pi-times" severity="secondary" text @click="router.back()" />
    </header>

    <div class="form-grid">
      <section class="main-form">
        <Message v-if="saveError" severity="error" class="mb-4">{{ t('ncr.register.save_error', 'No se pudo guardar el reporte debido a un error en el servidor o campos inválidos.') }}</Message>
        <div class="field">
          <label>{{ t('ncr.register.project', 'Proyecto') }}</label>
          <InputText :value="projectsStore.currentProjectName" disabled fluid />
        </div>

        <div class="field">
          <label>{{ t('ncr.register.incidence_title', 'Título de la incidencia') }}</label>
          <InputText v-model="form.title" :placeholder="t('ncr.register.incidence_title_ph', 'Ej. Error de plomada en muro')" fluid />
        </div>

        <div class="field-row">
          <div class="field">
            <label>{{ t('ncr.register.specialty', 'Especialidad afectada') }}</label>
            <InputText v-model="form.specialty" :placeholder="t('ncr.register.specialty_ph', 'Ej. Estructuras...')" fluid />
          </div>
          <div class="field">
            <label>{{ t('ncr.register.severity', 'Nivel de severidad') }}</label>
            <Select v-model="form.severity" :options="severityOptions" optionLabel="label" optionValue="value" fluid />
          </div>
        </div>

        <div class="field">
          <label>{{ t('ncr.register.description', 'Descripción detallada') }}</label>
          <Textarea v-model="form.description" rows="8" :placeholder="t('ncr.register.description_ph', 'Explique la falla técnica...')" fluid />
        </div>
      </section>
    </div>

    <footer class="form-footer">
      <Button :label="t('ncr.register.cancel_btn', 'Cancelar')" severity="secondary" text @click="router.back()" />
      <Button :label="t('ncr.register.submit_btn', 'Registrar')" class="btn-submit" @click="handleSave" />
    </footer>
  </div>
</template>

<style scoped>
.register-container { max-width: 1000px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; }
.form-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f1f1; padding-bottom: 1rem; margin-bottom: 2rem; }
.title-group h1 { margin: 0; font-size: 1.5rem; color: #2c3e50; }
.subtitle { color: #95a5a6; font-size: 0.9rem; }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
.field { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

@media (max-width: 768px) {
  .form-grid, .field-row { grid-template-columns: 1fr; }
}
.form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f1f1; }
.btn-submit { background: #e74c3c; border: none; padding: 0.75rem 1.5rem; color: white; font-weight: 600; border-radius: 8px; }
</style>