<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/shared/presentation/components/cardComponent.vue';
import { getMeasureUnitLabel } from '@/domains/logistics/domain/model/materials/measureUnit.map.js';

const { t } = useI18n();
const props = defineProps({
  material: { type: Object, required: true },
  canEdit: { type: Boolean, default: true }
});
const emit = defineEmits(['edit', 'delete']);

const fields = computed(() => [
  { label: t('catalog.materials.card.name'), value: props.material.name ?? '---' },
  { label: t('catalog.materials.card.category'), value: props.material.categoryId ?? '---' },
  { label: t('catalog.materials.card.measure-unit'), value: getMeasureUnitLabel(props.material.measureUnit) },
]);
</script>

<template>
  <CardComponent
      :id="`ID: ${material.id}`"
      :badge-text="getMeasureUnitLabel(material.measureUnit)"
      badge-severity="info"
      :fields="fields"
      :show-footer="canEdit"
  >
    <template v-if="canEdit" #footer>
      <div class="flex gap-3">
        <pv-button
            type="button"
            :label="t('catalog.materials.card.edit')"
            severity="info"
            class="flex-1"
            @click.stop="emit('edit', material)"
        />
        <pv-button
            type="button"
            :label="t('catalog.materials.card.delete')"
            severity="danger"
            class="flex-1"
            @click.stop="emit('delete', material)"
        />
      </div>
    </template>
  </CardComponent>
</template>
