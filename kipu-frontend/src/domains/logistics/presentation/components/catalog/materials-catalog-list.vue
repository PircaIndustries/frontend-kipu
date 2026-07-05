<script setup>
import MaterialsCatalogItem from './materials-catalog-item.vue';

defineProps({
  materials: { type: Array, required: true },
  loaded: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: true }
});
const emit = defineEmits(['edit', 'delete']);
</script>

<template>
  <div v-if="!loaded" class="flex items-center justify-center py-12">
    <i class="pi pi-spin pi-spinner text-2xl text-neutral-border"></i>
  </div>
  <div v-else-if="materials.length === 0" class="flex flex-col items-center justify-center py-12 text-neutral-border">
    <i class="pi pi-inbox text-4xl mb-3"></i>
    <p class="text-sm font-medium">{{ $t('catalog.materials.empty') }}</p>
  </div>
  <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    <MaterialsCatalogItem
        v-for="item in materials"
        :key="item.id"
        :material="item"
        :can-edit="canEdit"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
    />
  </div>
</template>
