<script setup>
import { useI18n } from 'vue-i18n';
import CardComponent from "@/shared/presentation/components/cardComponent.vue";
import {computed} from "vue";
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
const isLowStock = computed(() => props.inventoryMaterial.currentStock <= props.inventoryMaterial.miniumStock);

const inventoryFields = computed(() => [
  {
    label: t('inventory.card.equipment'),
    value: props.inventoryMaterial.materialName,
  },
  {
    label: t('inventory.card.min-limit'),
    value: props.inventoryMaterial.miniumStock,
    unit: props.inventoryMaterial.materialUnit,
  },
  {
    label: t('inventory.card.current-stock'),
    value: props.inventoryMaterial.currentStock,
    unit: props.inventoryMaterial.materialUnit,
    highlight: isLowStock.value ? 'danger' : 'success'
  }
])
</script>

<template>
  <card-component
      :id="inventoryMaterial.id"
      :badge-text="inventoryMaterial.materialCategory"
      badge-severity="info"
      :fields="inventoryFields"
      :show-footer="true"
  >
    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-xs text-neutral-border italic">
          {{ inventoryMaterial.materialSubcategory || '---' }}
        </span>
        <span
            v-if="isLowStock"
            class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-danger-soft text-danger"
        >
          <i class="pi pi-exclamation-triangle text-[10px]"></i>
          {{ t('inventory.low-stock') }}
        </span>
      </div>
    </template>
  </card-component>
</template>

<style scoped>

</style>