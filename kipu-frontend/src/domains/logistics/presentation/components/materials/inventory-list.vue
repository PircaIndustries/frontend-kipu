<script setup>
import InventoryItem from './inventory-item.vue'

/**
 * @type {Array}
 */
defineProps({
  inventoryMaterials: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <InventoryItem
        v-for="item in inventoryMaterials"
        :key="item.id"
        :inventory-material="item"
    />
  </div>
</template>

<style scoped>
</style>