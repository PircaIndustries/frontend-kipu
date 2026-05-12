<script setup>
import {Card as PvCard} from "primevue";
import {computed} from "vue";

const props = defineProps({
  id: { type: String, required: true },
  badgeText: { type: String, default: '' },
  badgeSeverity: {
    type: String,
    default: 'info',
    validator: (v) => ['danger', 'success', 'warning', 'info'].includes(v)
  },
  showFooter: { type: Boolean, default: true },
  fields: {
    type: Array,
    default: () => []
  }
})
const gridCols = computed(() => {
  const len = props.fields.length
  if (len <= 2) return 'grid-cols-2'
  if (len === 3) return 'grid-cols-3'
  return 'grid-cols-4'
})
</script>

<template>
  <pv-card
      class="w-full overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      :pt="{
      root:    { class: 'bg-neutral-bg border border-neutral-border/30 rounded-xl flex flex-col shadow-none' },
      header:  { class: 'p-0' },
      body:    { class: 'p-0 flex flex-col flex-1' },
      content: { class: 'px-6 py-5 flex-1' },
      footer:  { class: 'px-6 py-2.5 border-t border-neutral-border/20' },
    }"
  >
    <template #header>
      <div class="px-6 py-3 flex items-center justify-between bg-primary text-neutral-bg">
        <span class="font-bold text-lg tracking-wide">{{ id }}</span>
        <div class="flex items-center gap-1.5 text-sm opacity-80">
          <i class="pi pi-tag text-sm"></i>
          <span
              v-if="badgeText"
              class="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
              :class="{
              'bg-success-soft text-success': badgeSeverity === 'success',
              'bg-danger-soft text-danger': badgeSeverity === 'danger',
              'bg-warning-soft text-warning': badgeSeverity === 'warning',
              'bg-info-soft text-info': badgeSeverity === 'info',
            }"
          >
            {{ badgeText }}
          </span>
        </div>
      </div>
    </template>
    <template #content>
      <div v-if="fields.length > 0" :class="`grid ${gridCols} gap-4`">
        <div
            v-for="(field, index) in fields"
            :key="index"
            class="flex flex-col gap-1"
        >
          <p class="text-xs text-neutral-border font-medium uppercase tracking-wide m-0">
            {{ field.label }}
          </p>
          <div class="flex items-baseline gap-1.5">
            <p
                class="font-semibold text-base leading-tight m-0"
                :class="{
                'text-danger': field.highlight === 'danger',
                'text-success': field.highlight === 'success',
                'text-primary': !field.highlight || field.highlight === 'normal'
              }"
            >
              {{ field.value }}
            </p>
            <span
                v-if="field.unit"
                class="text-sm font-normal text-neutral-border"
            >
              {{ field.unit }}
            </span>
          </div>
        </div>
      </div>
      <slot v-else name="content" />
    </template>
    <template v-if="showFooter" #footer>
      <slot name="footer" />
    </template>
  </pv-card>
</template>

<style scoped>

</style>