<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import useMachineryStore from '@/domains/logistics/application/machinery.store.js'
import { useTeamWorkerStore } from '@/domains/team/application/team-worker.store.js'
import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue'

const { t } = useI18n()
const toast = useToast()
const machineryStore = useMachineryStore()
const workerStore = useTeamWorkerStore()

const { catalog } = storeToRefs(machineryStore)

const emit = defineEmits(['saved', 'close'])

const visible = ref(true)
const selectedMachine = ref(null)
const selectedWorker = ref(null)
const assignmentDetail = ref('')
const saving = ref(false)

const fieldErrors = ref({
  machine: '',
  worker: '',
  detail: ''
})

const catalogOptions = computed(() => {
  const seen = new Set()
  return catalog.value
    .map(c => ({
      id: c.id,
      name: `${c.name} - ${c.brand} ${c.model} (${c.serialNumber})`
    }))
    .filter(c => {
      if (seen.has(c.name)) return false
      seen.add(c.name)
      return true
    })
})

const workerOptions = computed(() =>
  workerStore.activeWorkers.map(w => ({
    id: w.id,
    name: `${w.dni} - ${w.fullName} - ${w.role}`
  }))
)

function validate() {
  fieldErrors.value = { machine: '', worker: '', detail: '' }
  let valid = true
  if (!selectedMachine.value) {
    fieldErrors.value.machine = t('machinery.create.errors.machine-required')
    valid = false
  }
  if (!assignmentDetail.value.trim()) {
    fieldErrors.value.detail = t('machinery.create.errors.detail-required')
    valid = false
  }
  return valid
}

function close() {
  visible.value = false
  emit('close')
}

function save() {
  if (!validate()) return

  saving.value = true

  const assignment = {
    projectId: localStorage.getItem('currentProjectId') || 'proj-01',
    machineryId: selectedMachine.value.id,
    name: selectedMachine.value.name,
    status: selectedWorker.value ? 'IN_USE' : 'AVAILABLE',
    assignedTo: selectedWorker.value?.id || null,
    registrationDate: new Date().toISOString(),
    maintenanceHours: '0',
    assignmentDetail: assignmentDetail.value.trim()
  }

  machineryStore.addAssignment(assignment, () => {
    toast.add({
      severity: 'success',
      summary: t('machinery.create.success.summary'),
      detail: t('machinery.create.success.detail'),
      life: 3000
    })
    emit('saved')
    close()
  }, () => {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('machinery.create.errors.save-failed'),
      life: 4000
    })
    saving.value = false
  })
}

onMounted(() => {
  if (workerStore.allWorkers.length === 0) workerStore.fetchWorkers()
})
</script>

<template>
  <pv-dialog
    v-model:visible="visible"
    modal
    :style="{ width: '600px' }"
    :header="t('machinery.create.title')"
    @hide="close"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('machinery.create.fields.machine') }} *
        </span>
        <AutocompleteComponent
          v-model="selectedMachine"
          :options="catalogOptions"
          :placeholder="t('machinery.create.placeholders.machine')"
          :invalid="!!fieldErrors.machine"
          return-object
        />
        <small v-if="fieldErrors.machine" class="text-red-500 text-xs">{{ fieldErrors.machine }}</small>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('machinery.create.fields.registration-date') }}
          </span>
          <pv-inputtext
            :model-value="new Date().toLocaleDateString()"
            disabled
            fluid
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('machinery.create.fields.assigned-to') }}
        </span>
        <AutocompleteComponent
          v-model="selectedWorker"
          :options="workerOptions"
          :placeholder="t('machinery.create.placeholders.assigned-to')"
          :invalid="!!fieldErrors.worker"
          return-object
        />
        <small v-if="fieldErrors.worker" class="text-red-500 text-xs">{{ fieldErrors.worker }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('machinery.create.fields.detail') }} *
        </span>
        <pv-textarea
          v-model="assignmentDetail"
          :placeholder="t('machinery.create.placeholders.detail')"
          :invalid="!!fieldErrors.detail"
          rows="2"
          fluid
        />
        <small v-if="fieldErrors.detail" class="text-red-500 text-xs">{{ fieldErrors.detail }}</small>
      </div>
    </div>

    <template #footer>
      <pv-button
        :label="t('machinery.create.actions.cancel')"
        severity="secondary"
        variant="outlined"
        :disabled="saving"
        @click="close"
      />
      <pv-button
        :label="t('machinery.create.actions.submit')"
        icon="pi pi-save"
        severity="info"
        :disabled="saving"
        @click="save"
      />
    </template>
  </pv-dialog>
</template>
