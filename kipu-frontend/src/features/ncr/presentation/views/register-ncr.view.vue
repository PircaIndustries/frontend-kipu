<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importamos el store y la función de guardado
import { addNcr } from '../../data/ncrStore';
import { allProjects } from '../../../projects/data/projectsStore';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';

const router = useRouter();

const form = ref({
  project: null,
  title: '',
  description: '',
  specialty: null,
  severity: 'Moderado',
  photo: null
});

const handleSave = async () => {
  // Validación básica
  if (!form.value.title || !form.value.project) return;

  // Creamos el objeto con la estructura que espera el store
  const newNcrEntry = {
    id: String(Date.now()), // ID único temporal
    ncrTitle: form.value.title,
    specialty: form.value.specialty?.name || 'General',
    date: new Date().toISOString(),
    severityLevel: form.value.severity,
    description: form.value.description,
    projectId: form.value.project.id,
    // Si hay foto, creamos una URL temporal para visualizarla
    photoUrl: form.value.photo ? URL.createObjectURL(form.value.photo) : null
  };

  // Guardamos en el store global
  addNcr(newNcrEntry);

  // Redirigimos a la lista
  router.push({ name: 'NcrRegistry' });
};
</script>

<template>
  <div class="register-container">
    <header class="form-header">
      <div class="title-group">
        <h1>Registrar RNC</h1>
        <p class="subtitle">Genere una alerta inmediata para el equipo de diseño</p>
      </div>
      <Button icon="pi pi-times" severity="secondary" text @click="router.back()" />
    </header>

    <div class="form-grid">
      <section class="main-form">
        <div class="field">
          <label>Proyecto</label>
          <Select v-model="form.project" :options="allProjects" optionLabel="name" placeholder="Seleccione proyecto" fluid />
        </div>

        <div class="field">
          <label>Título de la incidencia</label>
          <InputText v-model="form.title" placeholder="Ej. Error de plomada en muro" fluid />
        </div>

        <div class="field-row">
          <div class="field">
            <label>Especialidad afectada</label>
            <InputText
                v-model="form.specialty"
                placeholder="Ej. Estructuras, Arquitectura, MEP..."
                fluid
            />
          </div>
          <div class="field">
            <label>Nivel de severidad</label>
            <Select v-model="form.severity" :options="['Bajo', 'Moderado', 'Alto', 'Crítico']" fluid />
          </div>
        </div>

        <div class="field">
          <label>Descripción detallada</label>
          <Textarea v-model="form.description" rows="8" placeholder="Explique detalladamente la falla técnica detectada..." fluid />
        </div>
      </section>

      <aside class="photo-sidebar">
        <label class="photo-label">Evidencia Fotográfica (Obligatorio)</label>
        <FileUpload
            mode="advanced"
            accept="image/*"
            @select="(e) => { form.photo = e.files[0]; photoError = false }"
            :showUploadButton="false"
            chooseLabel="Subir evidencia"
        >
          <template #empty>
            <div class="upload-box" :class="{'error-box': photoError}">
              <i class="pi pi-camera" />
              <p>Haga clic para cargar la foto de respaldo</p>
            </div>
          </template>
        </FileUpload>
        <Message v-if="photoError" severity="error" size="small" variant="simple">
          Debe adjuntar la evidencia visual para registrar el RNC.
        </Message>
      </aside>
    </div>

    <footer class="form-footer">
      <Button label="Cancelar" severity="secondary" text @click="router.back()" />
      <Button label="Registrar y Notificar" icon="pi pi-bell" class="btn-submit" @click="handleSave" />
    </footer>
  </div>
</template>

<style scoped>
.register-container { max-width: 1000px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; }
.form-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f1f1; padding-bottom: 1rem; margin-bottom: 2rem; }
.title-group h1 { margin: 0; font-size: 1.5rem; color: #2c3e50; }
.subtitle { color: #95a5a6; font-size: 0.9rem; }

.form-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2.5rem; }
.field { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.field label, .photo-label { font-weight: 600; color: #34495e; font-size: 0.9rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.upload-box { display: flex; flex-direction: column; align-items: center; padding: 3rem 1rem; border: 2px dashed #dee2e6; border-radius: 8px; color: #95a5a6; text-align: center; }
.error-box { border-color: #e74c3c; background: #fff5f5; }

.form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f1f1; }
.btn-submit { background: #e74c3c; border: none; padding: 0.75rem 1.5rem; }
</style>