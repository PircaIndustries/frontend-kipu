<script setup>
/**
 * PhotoLogView Component
 * Displays a gallery of work progress photos using shared store data.
 */
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { allAdvances } from '../../data/advancesStore';

// PrimeVue Components
import Card from 'primevue/card';
import Image from 'primevue/image';
import Tag from 'primevue/tag';
import Select from 'primevue/select';

const { t } = useI18n();

const selectedSpecialty = ref(null);
const specialties = ref([
  { name: t('execution.advances.specialties.structures'), value: 'Estructuras' },
  { name: t('execution.advances.specialties.installations'), value: 'Instalaciones' },
  { name: t('execution.advances.specialties.architecture'), value: 'Arquitectura' }
]);

/** * Integrated Logic: We read the advances from the Store.
 * If an advance has a 'photoUrl', we show it.
 * If not, we show a professional placeholder.
 */
const galleryItems = computed(() => {
  return allAdvances.value.map(advance => ({
    id: advance.id,
    // If the advance has no photo, we use a construction-themed placeholder
    url: advance.photoUrl || `https://images.unsplash.com/photo-1541913053-470260714300?q=80&w=500&sig=${advance.id}`,
    date: advance.date,
    specialty: advance.specialty,
    activity: advance.activity
  }));
});

const filteredPhotos = computed(() => {
  if (!selectedSpecialty.value) return galleryItems.value;
  return galleryItems.value.filter(p => p.specialty === selectedSpecialty.value.value);
});
</script>

<template>
  <div class="photo-log-container">
    <header class="gallery-header">
      <h2>{{ t('execution.advances.photoLog.title') }}</h2>
      <Select
          v-model="selectedSpecialty"
          :options="specialties"
          optionLabel="name"
          :placeholder="t('execution.advances.photoLog.filterBy')"
          showClear
          class="gallery-filter"
      />
    </header>

    <div v-if="filteredPhotos.length" class="photo-grid">
      <Card v-for="photo in filteredPhotos" :key="photo.id" class="photo-card">
        <template #header>
          <Image :src="photo.url" alt="Progress Photo" preview class="gallery-img" />
        </template>
        <template #title>
          <span class="photo-title">{{ photo.activity }}</span>
        </template>
        <template #subtitle>
          <div class="photo-meta">
            <span>{{ new Date(photo.date).toLocaleDateString() }}</span>
            <Tag :value="photo.specialty" severity="secondary" />
          </div>
        </template>
      </Card>
    </div>

    <div v-else class="empty-gallery">
      <i class="pi pi-images"></i>
      <p>{{ t('execution.advances.photoLog.noPhotos') }}</p>
    </div>
  </div>
</template>

<style scoped>
.photo-log-container {
  padding: 0.5rem 0;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.gallery-header h2 { margin: 0; color: #2c3e50; font-size: 1.25rem; }
.gallery-filter { width: 250px; }

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.photo-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.photo-card:hover { transform: translateY(-5px); }

/* FIXED: This makes the image fill the top part of the card perfectly */
:deep(.p-image), :deep(.p-image img) {
  width: 100%;
  height: 200px;
  display: block;
  object-fit: cover; /* Fill the card without distortion */
}

.photo-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2c3e50;
  display: block;
  margin-bottom: 0.5rem;
  padding: 0 1rem;
}

.photo-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: 0 1rem 1rem 1rem;
}

.empty-gallery {
  text-align: center;
  padding: 5rem;
  color: #95a5a6;
}

.empty-gallery i { font-size: 3rem; margin-bottom: 1rem; }
</style>