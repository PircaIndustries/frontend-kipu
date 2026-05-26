<script setup>
import WasteItem from './waste-item.vue';

defineProps({
  /** @type {Array} waste items */
  wasteRecords: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <WasteItem
        v-for="record in wasteRecords"
        :key="record.id"
        :waste="record"
    />
  </div>
</template>