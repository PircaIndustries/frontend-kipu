<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/shared/presentation/components/cardComponent.vue';

const { t } = useI18n();
const props = defineProps({
  machinery: { type: Object, required: true },
  canEdit: { type: Boolean, default: true }
});
const emit = defineEmits(['edit', 'delete']);

const fields = computed(() => [
  { label: t('catalog.machinery.card.name'), value: props.machinery.name ?? '---' },
  { label: t('catalog.machinery.card.brand'), value: props.machinery.brand ?? '---' },
  { label: t('catalog.machinery.card.model'), value: props.machinery.model ?? '---' },
  { label: t('catalog.machinery.card.serial-number'), value: props.machinery.serialNumber ?? '---' },
]);
</script>

<template>
  <CardComponent
      :id="machinery.model || machinery.name"
      :badge-text="machinery.brand || ''"
      badge-severity="info"
      :fields="fields"
      :show-footer="canEdit"
  >
    <template v-if="canEdit" #footer>
      <div class="flex gap-3">
        <pv-button
            type="button"
            :label="t('catalog.machinery.card.edit')"
            severity="info"
            class="flex-1"
            @click.stop="emit('edit', machinery)"
        />
        <pv-button
            type="button"
            :label="t('catalog.machinery.card.delete')"
            severity="danger"
            class="flex-1"
            @click.stop="emit('delete', machinery)"
        />
      </div>
    </template>
  </CardComponent>
</template>
