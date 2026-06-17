<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { NcrRepository } from '../../infrastructure/NcrRepository.js';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Message from 'primevue/message';

const router = useRouter();
const repository = new NcrRepository();

const projectOptions = ref([]);

const form = ref({
  project: null,
  title: '',
  description: '',
  specialty: '',
  severity: 'Moderado'
});

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/projects');
    projectOptions.value = response.data;
    console.log("Proyectos cargados:", response.data);
  } catch (error) {
    console.error("Error al cargar proyectos:", error);
  }
});

const handleSave = async () => {
  if (!form.value.title || !form.value.project) {
    alert("Por favor, complete los campos obligatorios.");
    return;
  }

  const newNcrEntry = {
    ncrTitle: form.value.title,
    specialty: form.value.specialty || 'General',
    date: new Date().toISOString(),
    severityLevel: form.value.severity,
    ncrDescription: form.value.description,
    projectId: form.value.project.id,
    photoUrl: "" // Se envía vacío para evitar que colapse por el tamaño del Base64
  };

  try {
    await repository.save(newNcrEntry);
    router.push({ name: 'NcrRegistry' });
  } catch (error) {
    alert("Error al persistir el reporte en el db.json");
  }
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
          <Select
              v-model="form.project"
              :options="projectOptions"
              optionLabel="name"
              placeholder="Seleccione proyecto real"
              fluid
          />
        </div>

        <div class="field">
          <label>Título de la incidencia</label>
          <InputText v-model="form.title" placeholder="Ej. Error de plomada en muro" fluid />
        </div>

        <div class="field-row">
          <div class="field">
            <label>Especialidad afectada</label>
            <InputText v-model="form.specialty" placeholder="Ej. Estructuras..." fluid />
          </div>
          <div class="field">
            <label>Nivel de severidad</label>
            <Select v-model="form.severity" :options="['Bajo', 'Moderado', 'Alto', 'Crítico']" fluid />
          </div>
        </div>

        <div class="field">
          <label>Descripción detallada</label>
          <Textarea v-model="form.description" rows="8" placeholder="Explique la falla técnica..." fluid />
        </div>
      </section>
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
.form-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
.field { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.field label { font-weight: 600; color: #34495e; font-size: 0.9rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f1f1; }
.btn-submit { background: #e74c3c; border: none; padding: 0.75rem 1.5rem; color: white; font-weight: 600; border-radius: 8px; }
</style>