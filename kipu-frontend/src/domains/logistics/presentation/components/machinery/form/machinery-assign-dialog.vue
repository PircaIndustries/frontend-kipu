<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import useMachineryStore from '@/domains/logistics/application/machinery.store.js'
import { useTeamWorkerStore } from '@/domains/team/application/team-worker.store.js'
import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue'

const { t } = useI18n()
const toast = useToast()
const machineryStore = useMachineryStore()
const workerStore = useTeamWorkerStore()

const props = defineProps({
  machinery: { type: Object, required: true }
})
const emit = defineEmits(['saved', 'close'])

const visible = ref(true)
const selectedWorker = ref(null)
const assignmentDetail = ref(props.machinery.assignmentDetail || '')
const saving = ref(false)
const fieldErrors = ref({ worker: '', detail: '' })

const workerOptions = computed(() =>
  workerStore.activeWorkers.map(w => ({
    id: w.id,
    name: `${w.dni} - ${w.fullName} - ${w.role}`,
    dni: w.dni,
    fullName: w.fullName
  }))
)

watch(() => props.machinery, (newVal) => {
  assignmentDetail.value = newVal.assignmentDetail || ''
  selectedWorker.value = null
}, { immediate: true })

function close() {
  visible.value = false
  emit('close')
}

function validate() {
  fieldErrors.value = { worker: '', detail: '' }
  let valid = true
  if (!selectedWorker.value?.id) {
    fieldErrors.value.worker = t('machinery.assign.errors.worker-required')
    valid = false
  }
  if (!assignmentDetail.value.trim()) {
    fieldErrors.value.detail = t('machinery.assign.errors.detail-required')
    valid = false
  }
  return valid
}

async function assign() {
  if (!validate()) return

  saving.value = true
  const worker = selectedWorker.value

  const updates = {
    id: props.machinery.id,
    machineryId: props.machinery.machineryId,
    projectId: props.machinery.projectId,
    assignedTo: worker ? `${worker.dni} - ${worker.fullName}` : props.machinery.assignedTo,
    assignedWorkerId: worker?.id || null,
    assignmentDetail: assignmentDetail.value.trim(),
    status: 'IN_USE'
  }

  try {
    await machineryStore.updateAssignment(props.machinery.id, updates)

    if (worker) {
      await workerStore.assignMachineryToWorker(worker.id, { machineryId: props.machinery.machineryId, fullName: props.machinery.machineryName })
    }

    toast.add({
      severity: 'success',
      summary: t('machinery.assign.success.summary'),
      detail: t('machinery.assign.success.detail'),
      life: 3000
    })
    emit('saved')
    close()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('machinery.assign.errors.save-failed'),
      life: 4000
    })
    saving.value = false
  }
}

onMounted(() => {
  if (workerStore.allWorkers.length === 0) workerStore.fetchWorkers()
})
</script>

<template>
  <pv-dialog
    v-model:visible="visible"
    modal
    :style="{ width: '500px' }"
    :header="t('machinery.assign.title')"
    @hide="close"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('machinery.assign.fields.machine') }}
        </span>
        <pv-inputtext :model-value="machinery.machineryName" disabled fluid />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('machinery.assign.fields.assigned-to') }}
        </span>
        <AutocompleteComponent
          v-model="selectedWorker"
          :options="workerOptions"
          :placeholder="t('machinery.assign.placeholders.assigned-to')"
          :invalid="!!fieldErrors.worker"
          return-object
        />
        <small v-if="fieldErrors.worker" class="text-red-500 text-xs">{{ fieldErrors.worker }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('machinery.assign.fields.detail') }} *
        </span>
        <pv-textarea
          v-model="assignmentDetail"
          :placeholder="t('machinery.assign.placeholders.detail')"
          :invalid="!!fieldErrors.detail"
          rows="2"
          fluid
        />
        <small v-if="fieldErrors.detail" class="text-red-500 text-xs">{{ fieldErrors.detail }}</small>
      </div>
    </div>

    <template #footer>
      <pv-button
        :label="t('machinery.assign.actions.cancel')"
        severity="secondary"
        variant="outlined"
        :disabled="saving"
        @click="close"
      />
      <pv-button
        :label="t('machinery.assign.actions.submit')"
        icon="pi pi-user-plus"
        severity="info"
        :disabled="saving"
        @click="assign"
      />
    </template>
  </pv-dialog>
</template>
