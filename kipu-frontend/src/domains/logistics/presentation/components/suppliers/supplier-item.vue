<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CardComponent from '@/shared/presentation/components/cardComponent.vue'

const { t } = useI18n()
const props = defineProps({ supplier: { type: Object, required: true } })
const emit = defineEmits(['edit', 'delete'])

const supplierFields = computed(() => [
  { label: t('suppliers.card.social-reason'), value: props.supplier.socialReason },
  { label: t('suppliers.card.contact'), value: props.supplier.contact ?? '---' },
  { label: t('suppliers.card.phone'), value: props.supplier.phone ?? '---' },
  { label: t('suppliers.card.email'), value: props.supplier.email ?? '---' }
])

const statusSeverity = computed(() =>
    props.supplier.status === 'ACTIVE' ? 'success' : 'danger'
)
</script>

<template>
  <CardComponent
      :id="supplier.ruc"
      :badge-text="supplier.status"
      :badge-severity="statusSeverity"
      :fields="supplierFields"
      :show-footer="true"
  >
    <template #footer>
      <div class="flex gap-3">
        <pv-button
            type="button"
            :label="t('suppliers.card.actions.button-edit')"
            severity="info"
            class="flex-1"
            @click.stop="emit('edit', supplier)"
        />
        <pv-button
            type="button"
            :label="t('suppliers.card.actions.button-delete')"
            severity="danger"
            class="flex-1"
            @click.stop="emit('delete', supplier)"
        />
      </div>
    </template>
  </CardComponent>
</template>