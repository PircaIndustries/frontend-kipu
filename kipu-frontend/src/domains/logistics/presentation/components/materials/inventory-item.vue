<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
/**
 * @type {Object}
 * @property {string} id
 * @property {string} projectId
 * @property {string} materialId
 * @property {number} currentStock
 * @property {number} miniumStock
 * @property {string} location
 * @property {string} materialName
 * @property {string} materialCategory
 * @property {string} materialSubcategory
 * @property {string} materialUnit
 */
const props = defineProps({
  inventoryMaterial: {
    type: Object,
    required: true
  }
});
const isLowStock = () => props.inventoryMaterial.currentStock <= props.inventoryMaterial.miniumStock;
</script>

<template>
  <pv-card
      class="w-full mb-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
      :pt="{
      root:    { class: 'bg-neutral-bg border border-neutral-border/30 rounded-xl flex flex-col overflow-hidden shadow-none' },
      header:  { class: 'p-0' },
      body:    { class: 'p-0 flex flex-col flex-1' },
      content: { class: 'px-6 py-5 flex-1' },
      footer:  { class: 'px-6 py-2.5 border-t border-neutral-border/20' },
    }"
  >
    <template #header>
      <div class="px-6 py-3 flex items-center justify-between bg-primary text-neutral-bg">
        <span class="font-bold text-lg tracking-wide">{{ inventoryMaterial.id }}</span>
        <div class="flex items-center gap-1.5 text-sm opacity-80">
          <i class="pi pi-tag text-sm"></i>
          <span>{{ inventoryMaterial.materialCategory }}</span>
        </div>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-xs text-neutral-border font-medium uppercase tracking-wide m-0">
            {{ t('inventory.card.equipment') }}
          </p>
          <p class="font-semibold text-base text-primary leading-tight line-clamp-2 m-0">
            {{ inventoryMaterial.materialName }}
          </p>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-xs text-neutral-border font-medium uppercase tracking-wide m-0">
            {{ t('inventory.card.min-limit') }}
          </p>
          <p class="font-semibold text-base text-primary leading-tight m-0">
            {{ inventoryMaterial.miniumStock }}
            <span class="text-sm font-normal text-neutral-border">{{ inventoryMaterial.materialUnit }}</span>
          </p>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-xs text-neutral-border font-medium uppercase tracking-wide m-0">
            {{ t('inventory.card.current-stock') }}
          </p>
          <div class="flex items-baseline gap-1.5">
            <p
                class="font-semibold text-base leading-tight m-0"
                :class="isLowStock() ? 'text-danger' : 'text-success'"
            >
              {{ inventoryMaterial.currentStock }}
            </p>
            <span class="text-sm font-normal text-neutral-border">{{ inventoryMaterial.materialUnit }}</span>
          </div>
        </div>

      </div>
    </template>
    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-xs text-neutral-border italic">
          {{ inventoryMaterial.materialSubcategory || '---' }}
        </span>
        <span
            v-if="isLowStock()"
            class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-danger-soft text-danger"
        >
          <i class="pi pi-exclamation-triangle text-[10px]"></i>
          Stock bajo
        </span>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>

</style>