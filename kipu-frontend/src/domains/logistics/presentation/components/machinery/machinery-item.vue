<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CardComponent from '@/shared/presentation/components/cardComponent.vue'

const { t } = useI18n()

const props = defineProps({ machinery: { type: Object, required: true } })
const emit = defineEmits(['assign', 'return', 'maintenance', 'enable', 'delete'])

const equipmentDisplay = computed(() => {
  const name = props.machinery.machineryName
  const model = props.machinery.machineryModel
  return model ? `${name} (${model})` : name
})

const workerDisplay = computed(() => {
  if (!props.machinery.assignedTo) return t('machinery.card.unassigned')
  const dni = props.machinery.workerDni || ''
  const name = props.machinery.workerName || ''
  return dni ? `${dni} - ${name}` : name
})

const isUnderMaintenance = computed(() =>
  props.machinery.status === 'MAINTENANCE' || props.machinery.status === 'URGENT_MAINTENANCE'
)

const machineryFields = computed(() => [
  { label: t('machinery.card.registration'), value: props.machinery.registrationDate?.slice(0, 10) },
  { label: t('machinery.card.equipment'), value: equipmentDisplay.value },
  { label: t('machinery.card.assigned-to'), value: workerDisplay.value },
  { label: t('machinery.card.maintenance-hours'), value: props.machinery.maintenanceHours, unit: 'h' }
])

const statusSeverity = computed(() => {
  const map = {
    'AVAILABLE': 'success',
    'IN_USE': 'warning',
    'MAINTENANCE': 'danger',
    'URGENT_MAINTENANCE': 'danger'
  }
  return map[props.machinery.status] || 'info'
})

const badgeText = computed(() => {
  const map = {
    'AVAILABLE': t('machinery.status.available'),
    'IN_USE': t('machinery.status.in-use'),
    'MAINTENANCE': t('machinery.status.maintenance'),
    'URGENT_MAINTENANCE': t('machinery.status.urgent-maintenance')
  }
  return map[props.machinery.status] || props.machinery.status
})
</script>

<template>
  <CardComponent
    :id="machinery.id"
    :badge-text="badgeText"
    :badge-severity="statusSeverity"
    :fields="machineryFields"
    :show-footer="true"
  >
    <template #footer>
      <div v-if="machinery.assignmentDetail" class="mb-3 text-sm text-primary border-b border-neutral-border/20 pb-2">
        <span class="text-xs font-semibold text-neutral-border uppercase tracking-wide">
          {{ t('machinery.card.assignment-detail') }}:
        </span>
        <p class="m-0 mt-1 leading-relaxed">{{ machinery.assignmentDetail }}</p>
      </div>
      <div v-else class="mb-3 text-sm text-neutral-border italic border-b border-neutral-border/20 pb-2">
        {{ t('machinery.card.no-detail') }}
      </div>
      <div class="flex gap-3">
        <pv-button
          v-if="!machinery.assignedTo"
          type="button"
          :label="t('machinery.card.btn-assign')"
          severity="secondary"
          class="flex-1"
          @click.stop="emit('assign', machinery)"
        />
        <pv-button
          v-else
          type="button"
          :label="t('machinery.card.btn-return')"
          severity="info"
          class="flex-1"
          @click.stop="emit('return', machinery)"
        />
        <pv-button
          v-if="isUnderMaintenance"
          type="button"
          :label="t('machinery.card.btn-enable')"
          severity="success"
          class="flex-1"
          @click.stop="emit('enable', machinery)"
        />
        <pv-button
          v-else
          type="button"
          :label="t('machinery.card.btn-maintenance')"
          severity="danger"
          class="flex-1"
          @click.stop="emit('maintenance', machinery)"
        />
      </div>
    </template>
  </CardComponent>
</template>
