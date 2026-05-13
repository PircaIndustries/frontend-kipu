<script setup>
import SupplierItem from './supplier-item.vue'
defineProps({ suppliers: { type: Array, required: true } })
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    <SupplierItem
        v-for="supplier in suppliers"
        :key="supplier.id"
        :supplier="supplier"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
    />
  </div>
</template>