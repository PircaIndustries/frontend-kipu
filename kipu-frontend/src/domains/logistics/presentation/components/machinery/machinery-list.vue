<script setup>
import MachineryItem from './machinery-item.vue'

defineProps({
  machineryList: { type: Array, required: true }
})

const emit = defineEmits(['assign', 'return', 'maintenance', 'enable', 'delete'])
</script>

<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <MachineryItem
      v-for="item in machineryList"
      :key="item.id"
      :machinery="item"
      @assign="(m) => emit('assign', m)"
      @return="(m) => emit('return', m)"
      @maintenance="(m) => emit('maintenance', m)"
      @enable="(m) => emit('enable', m)"
      @delete="(m) => emit('delete', m)"
    />
  </div>
</template>
