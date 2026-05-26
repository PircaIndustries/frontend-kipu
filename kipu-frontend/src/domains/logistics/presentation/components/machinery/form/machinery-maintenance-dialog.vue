<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import useMachineryStore from '@/domains/logistics/application/machinery.store.js'

const { t } = useI18n()
const toast = useToast()
const machineryStore = useMachineryStore()

const props = defineProps({
  machinery: { type: Object, required: true }
})
const emit = defineEmits(['saved', 'close'])

const visible = ref(true)
const maintenanceHours = ref(props.machinery.maintenanceHours || '0')
const saving = ref(false)
const fieldErrors = ref({ hours: '' })

function close() {
  visible.value = false
  emit('close')
}

function validate() {
  fieldErrors.value = { hours: '' }
  if (!maintenanceHours.value || parseInt(maintenanceHours.value) < 0) {
    fieldErrors.value.hours = t('machinery.maintenance.errors.hours-invalid')
    return false
  }
  return true
}

function registerMaintenance() {
  if (!validate()) return

  saving.value = true

  const updates = {
    ...props.machinery,
    maintenanceHours: String(maintenanceHours.value),
    status: 'MAINTENANCE'
  }

  machineryStore.updateAssignment(props.machinery.id, updates,
    () => {
      toast.add({
        severity: 'success',
        summary: t('machinery.maintenance.success.summary'),
        detail: t('machinery.maintenance.success.detail'),
        life: 3000
      })
      emit('saved')
      close()
    },
    () => {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('machinery.maintenance.errors.save-failed'),
        life: 4000
      })
      saving.value = false
    }
  )
}
</script>

<template>
  <pv-dialog
    v-model:visible="visible"
    modal
    :style="{ width: '500px' }"
    :header="t('machinery.maintenance.title')"
    @hide="close"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('machinery.maintenance.fields.machine') }}
        </span>
        <pv-inputtext :model-value="machinery.machineryName" disabled fluid />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('machinery.maintenance.fields.hours') }} *
        </span>
        <pv-inputnumber
          v-model="maintenanceHours"
          :min="0"
          :invalid="!!fieldErrors.hours"
          fluid
        />
        <small v-if="fieldErrors.hours" class="text-red-500 text-xs">{{ fieldErrors.hours }}</small>
      </div>
    </div>

    <template #footer>
      <pv-button
        :label="t('machinery.maintenance.actions.cancel')"
        severity="secondary"
        variant="outlined"
        :disabled="saving"
        @click="close"
      />
      <pv-button
        :label="t('machinery.maintenance.actions.submit')"
        icon="pi pi-cog"
        severity="danger"
        :disabled="saving"
        @click="registerMaintenance"
      />
    </template>
  </pv-dialog>
</template>
