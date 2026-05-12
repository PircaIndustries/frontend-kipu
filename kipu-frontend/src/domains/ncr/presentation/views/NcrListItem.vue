<script setup>
import { ref } from 'vue';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const props = defineProps({
  ncr: Object,
  projectName: String
});

const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const getSeverityBadge = (level) => {
  const map = { 'Crítico': 'danger', 'Alto': 'warning', 'Moderado': 'info', 'Bajo': 'success' };
  return map[level] || 'secondary';
};
</script>

<template>
  <div class="ncr-item-container" :class="{ 'is-active': isExpanded }">
    <div class="ncr-main-row">
      <div class="ncr-section date-box">
        <div class="icon-circle calendar"><i class="pi pi-calendar"></i></div>
        <div class="data-group">
          <span class="label">FECHA</span>
          <span class="value">{{ new Date(ncr.date).toLocaleDateString() }}</span>
        </div>
      </div>

      <div class="ncr-section info-box">
        <div class="data-group">
          <span class="label">INCIDENCIA / ESPECIALIDAD</span>
          <span class="main-val">{{ ncr.ncrTitle }}</span>
          <span class="sub-val">{{ ncr.specialty }}</span>
        </div>
      </div>

      <div class="ncr-section project-box">
        <div class="icon-circle building"><i class="pi pi-building"></i></div>
        <div class="data-group">
          <span class="label">PROYECTO</span>
          <span class="value">{{ projectName }}</span>
        </div>
      </div>

      <div class="ncr-section status-box">
        <div class="tag-column">
          <span class="label">SEVERIDAD</span>
          <Tag :value="ncr.severityLevel" :severity="getSeverityBadge(ncr.severityLevel)" />
        </div>
        <div class="tag-column">
          <span class="label">ESTADO</span>
          <Tag value="PENDIENTE" severity="warn" />
        </div>
      </div>

      <div class="action-box">
        <Button
            :icon="isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
            text
            rounded
            @click="toggleExpand"
            :class="{ 'rotate-icon': isExpanded }"
        />
      </div>
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="ncr-details-panel">
        <div class="details-content">
          <div class="description-text">
            <span class="label">DESCRIPCIÓN DETALLADA</span>
            <p>{{ ncr.ncrDescription }}</p>
          </div>

          <div class="evidence-section" v-if="ncr.photoUrl">
            <span class="label">EVIDENCIA FOTOGRÁFICA</span>
            <div class="image-grid">
              <img :src="ncr.photoUrl" alt="Evidencia RNC" class="evidence-img" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.ncr-item-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.is-active {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.ncr-main-row {
  display: flex;
  align-items: stretch;
}

.ncr-section {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-right: 1px solid #e2e8f0;
}

/* Anchos Flex */
.date-box { flex: 1; }
.info-box { flex: 2; }
.project-box { flex: 1.5; }
.status-box { flex: 1.5; gap: 2rem; border-right: none; }

.data-group { display: flex; flex-direction: column; }
.label { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 4px; }
.value { font-weight: 700; color: #334155; }
.main-val { font-weight: 800; color: #1e293b; font-size: 1rem; }
.sub-val { font-size: 0.85rem; color: #64748b; font-weight: 500; }

.icon-circle { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.calendar { background: #eff6ff; color: #3b82f6; }
.building { background: #f8fafc; color: #64748b; }

.tag-column { display: flex; flex-direction: column; gap: 6px; }

/* Panel de Detalles */
.ncr-details-panel {
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.details-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.description-text p {
  margin: 0.5rem 0 0;
  color: #475569;
  line-height: 1.6;
  font-size: 0.95rem;
}

.evidence-img {
  max-width: 300px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 0.5rem;
}

/* Animación de expansión */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease-out;
  max-height: 500px;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.action-box { display: flex; align-items: center; padding: 0 1rem; }
.rotate-icon { color: #3b82f6 !important; }
</style>