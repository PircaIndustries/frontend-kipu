<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Mock data for the photo log gallery
const mockPhotos = [
  { title: 'Excavaciones', url: 'https://loremflickr.com/600/400/excavator,construction?lock=1' },
  { title: 'Cimentación', url: 'https://loremflickr.com/600/400/foundation,construction?lock=2' },
  { title: 'Armado de Columnas', url: 'https://loremflickr.com/600/400/rebar,construction?lock=3' }
];
</script>

<template>
  <div class="bg-white p-6 rounded-b-xl shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <button class="px-4 py-2 border border-[#3498DB] text-[#3498DB] rounded-md font-medium text-sm hover:bg-blue-50 transition-colors">Excavaciones</button>
        <button class="px-4 py-2 border border-[#3498DB] text-[#3498DB] rounded-md font-medium text-sm hover:bg-blue-50 transition-colors">Cimentación</button>
      </div>
      <div class="flex gap-2">
        <button class="text-gray-500 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md font-bold text-sm transition-colors">
          <i class="pi pi-download"></i> Exportar
        </button>
        <button class="bg-gray-800 text-white flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-900 transition-colors">
          <i class="pi pi-plus"></i> Subir Fotos
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div v-for="photo in mockPhotos" :key="photo.url"
           class="h-48 bg-gray-200 rounded-xl relative overflow-hidden bg-cover bg-center shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
           :style="{ backgroundImage: `url(${photo.url})` }">
        <div class="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors"></div>
      </div>
      <div class="h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-[#3498DB] hover:text-[#3498DB] transition-all">
        <i class="pi pi-plus text-4xl"></i>
      </div>
    </div>
  </div>
</template>