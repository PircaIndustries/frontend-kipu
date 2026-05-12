<script setup>
import RequestItem from './request-item.vue'

defineProps({
  requests: {
    type: Array,
    required: true
  },

  /*
  * availableBudget: {
    type: Number,
    default: 0
  },
  totalBudget: {
    type: Number,
    default: 0
  }
  * */

})

const emit = defineEmits(['modify', 'detail'])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    <RequestItem
        v-for="request in requests"
        :key="request.id"
        :request="request"
        :available-budget="availableBudget"
        :total-budget="totalBudget"
        @modify="emit('modify', request)"
        @detail="emit('detail', request)"
    />
  </div>
</template>