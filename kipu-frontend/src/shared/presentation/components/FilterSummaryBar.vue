<script setup>
import SummaryComponent from '@/shared/presentation/components/summaryComponent.vue'

defineProps({
  title: { type: String, default: '' },
  filters: { type: Array, required: true }
})
</script>

<template>
  <div v-if="filters.length > 0" class="flex flex-col gap-2">
    <h3 v-if="title" class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
      {{ title }}
    </h3>
    <div class="flex flex-col gap-1">
      <SummaryComponent
          v-for="(filter, index) in filters"
          :key="index"
          :label="filter.label"
          :value="filter.value"
          :icon="filter.icon"
          :variant="filter.variant"
          :active="filter.active"
          clickable
          @click="filter.onClick"
      />
    </div>
  </div>
</template>