<script setup>
import CardComponent from '@/shared/presentation/components/cardComponent.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
const { t } = useI18n();
const props = defineProps({
  waste: { type: Object, required: true }
});
const wasteFields = computed(() => [
  {
    label: t('waste.card.report-id'),
    value: props.waste.id,
  },
  {
    label: t('waste.card.date'),
    value: props.waste.date,
  },
  {
    label: t('waste.card.affected-material'),
    value: props.waste.materialName,
  },
  {
    label: t('waste.card.discounted-quantity'),
    value: props.waste.quantity,
    unit: props.waste.materialUnit,
  },
]);

const classificationSeverity = computed(() => {
  const map = {
    'ROTURA': 'warning',
    'VENCIMIENTO': 'danger',
    'HURTO': 'danger',
    'OTRO': 'info'
  };
  return map[props.waste.classificationType] || 'info';
});
</script>

<template>
  <CardComponent
    :id="waste.id"
    :badge-text="waste.classificationType"
    :badge-severity="classificationSeverity"
    :fields="wasteFields"
    :show-footer="true"
  >
    <template #footer>
      <div class="flex flex-col gap-1">
        <span class="text-xs font-semibold text-neutral-border uppercase tracking-wide">
          {{ t('waste.card.reason') }}
        </span>
        <p class="text-sm text-primary m-0 leading-relaxed">
          {{ waste.description || t('waste.card.no-reason') }}
        </p>
      </div>
    </template>
  </CardComponent>
</template>
