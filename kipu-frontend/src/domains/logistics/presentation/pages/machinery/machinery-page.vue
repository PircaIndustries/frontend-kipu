<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import useMachineryStore from '@/domains/logistics/application/machinery.store.js'
import { useTeamWorkerStore } from '@/domains/team/application/team-worker.store.js'
import MachineryList from '@/domains/logistics/presentation/components/machinery/machinery-list.vue'
import FilterSummaryBar from '@/shared/presentation/components/FilterSummaryBar.vue'
import MachineryCreateForm from '@/domains/logistics/presentation/components/machinery/form/machinery-create-form.vue'
import MachineryAssignDialog from '@/domains/logistics/presentation/components/machinery/form/machinery-assign-dialog.vue'
import MachineryMaintenanceDialog from '@/domains/logistics/presentation/components/machinery/form/machinery-maintenance-dialog.vue'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const machineryStore = useMachineryStore()
const workerStore = useTeamWorkerStore()

const { machineryView, assignmentsLoaded, catalogLoaded } = storeToRefs(machineryStore)

const enrichedView = computed(() =>
  machineryView.value.map(a => {
    const worker = workerStore.allWorkers.find(w => w.id === a.assignedTo)
    return {
      ...a,
      workerDni: worker ? worker.dni : null,
      workerName: worker ? worker.fullName : null,
    }
  })
)

const dateRange = ref(null)
const searchText = ref('')
const activeSummaryFilter = ref('all')

const filteredMachinery = computed(() => {
  let list = [...enrichedView.value]
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const [start, end] = dateRange.value
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)
    list = list.filter(item => {
      const date = item.registrationDate?.slice(0, 10)
      return date >= startStr && date <= endStr
    })
  }
  if (activeSummaryFilter.value === 'in-use') {
    list = list.filter(item => item.status === 'IN_USE')
  }
  if (activeSummaryFilter.value === 'available') {
    list = list.filter(item => item.status === 'AVAILABLE')
  }
  if (activeSummaryFilter.value === 'maintenance') {
    list = list.filter(item => item.status === 'MAINTENANCE' || item.status === 'URGENT_MAINTENANCE')
  }
  if (searchText.value.trim()) {
    const term = searchText.value.trim().toLowerCase()
    list = list.filter(item =>
      (item.machineryName && item.machineryName.toLowerCase().includes(term)) ||
      (item.workerName && item.workerName.toLowerCase().includes(term))
    )
  }
  return list
})

const totalTools = computed(() => enrichedView.value.length)
const availableCount = computed(() => enrichedView.value.filter(item => item.status === 'AVAILABLE').length)
const inUseCount = computed(() => enrichedView.value.filter(item => item.status === 'IN_USE').length)
const maintenanceCount = computed(() =>
  enrichedView.value.filter(item => item.status === 'MAINTENANCE' || item.status === 'URGENT_MAINTENANCE').length
)

const summaryFilters = computed(() => [
  {
    label: t('machinery.summary.total-tools'),
    value: totalTools.value,
    icon: 'pi-wrench',
    variant: 'neutral',
    active: activeSummaryFilter.value === 'all',
    onClick: () => { activeSummaryFilter.value = 'all'; dateRange.value = null; searchText.value = '' }
  },
  {
    label: t('machinery.summary.available'),
    value: availableCount.value,
    icon: 'pi-check-circle',
    variant: 'success',
    active: activeSummaryFilter.value === 'available',
    onClick: () => { activeSummaryFilter.value = 'available' }
  },
  {
    label: t('machinery.summary.in-use'),
    value: inUseCount.value,
    icon: 'pi-user',
    variant: 'warning',
    active: activeSummaryFilter.value === 'in-use',
    onClick: () => { activeSummaryFilter.value = 'in-use' }
  },
  {
    label: t('machinery.summary.maintenance'),
    value: maintenanceCount.value,
    icon: 'pi-cog',
    variant: 'danger',
    active: activeSummaryFilter.value === 'maintenance',
    onClick: () => { activeSummaryFilter.value = 'maintenance' }
  }
])

const showCreateDialog = ref(false)
const showAssignDialog = ref(false)
const showMaintenanceDialog = ref(false)
const selectedMachinery = ref(null)

function handleAssign(machinery) {
  selectedMachinery.value = machinery
  showAssignDialog.value = true
}

function handleReturn(machinery) {
  const updates = {
    ...machinery,
    assignedTo: null,
    assignmentDetail: null,
    status: 'AVAILABLE'
  }
  machineryStore.updateAssignment(machinery.id, updates,
    () => {
      toast.add({
        severity: 'success',
        summary: t('machinery.return.success.summary'),
        detail: t('machinery.return.success.detail'),
        life: 3000
      })
    },
    () => {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('machinery.return.errors.save-failed'),
        life: 4000
      })
    }
  )
}

function handleEnable(machinery) {
  const updates = {
    ...machinery,
    status: 'AVAILABLE'
  }
  machineryStore.updateAssignment(machinery.id, updates,
    () => {
      toast.add({
        severity: 'success',
        summary: t('machinery.enable.success.summary'),
        detail: t('machinery.enable.success.detail'),
        life: 3000
      })
    },
    () => {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('machinery.enable.errors.save-failed'),
        life: 4000
      })
    }
  )
}

function handleMaintenance(machinery) {
  selectedMachinery.value = machinery
  showMaintenanceDialog.value = true
}

function handleDelete(machinery) {
  confirm.require({
    message: `${t('machinery.delete.message')} ${machinery.id}?`,
    header: t('machinery.delete.title'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('machinery.delete.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('machinery.delete.confirm'), severity: 'danger' },
    accept: () => {
      machineryStore.deleteAssignment(machinery.id, () => {
        toast.add({
          severity: 'success',
          summary: t('machinery.delete.success.summary'),
          detail: t('machinery.delete.success.detail'),
          life: 3000
        })
      })
    }
  })
}

function refresh() {
  machineryStore.fetchMachinery()
}

onMounted(() => {
  machineryStore.fetchMachinery()
  workerStore.fetchWorkers()
})
</script>

<template>
  <section class="flex flex-col gap-6 p-6 h-full">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary tracking-tight m-0">
          {{ t('machinery.title') }}
        </h1>
        <p v-if="assignmentsLoaded && catalogLoaded" class="text-sm text-neutral-border mt-1">
          {{ t('machinery.subtitle', { count: enrichedView.length }) }}
        </p>
      </div>
      <button
        @click="showCreateDialog = true"
        class="bg-accent text-white py-2.5 px-6 rounded-lg font-bold text-base shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
      >
        <i class="pi pi-plus-circle text-lg"></i>
        <span>{{ t('machinery.button-register') }}</span>
      </button>
    </header>

    <div class="flex gap-6 flex-1 min-h-0">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-border text-sm"></i>
          <input
            v-model="searchText"
            type="text"
            :placeholder="t('machinery.search.placeholder')"
            class="w-full pl-9 pr-4 py-2 border border-neutral-border/30 rounded-lg text-sm placeholder:text-neutral-border/70 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <MachineryList
          :machinery-list="filteredMachinery"
          @assign="handleAssign"
          @return="handleReturn"
          @maintenance="handleMaintenance"
          @enable="handleEnable"
          @delete="handleDelete"
        />

        <div v-if="filteredMachinery.length === 0 && assignmentsLoaded" class="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div class="w-14 h-14 rounded-full bg-neutral-bg flex items-center justify-center">
            <i class="pi pi-inbox text-2xl text-neutral-border"></i>
          </div>
          <p class="text-sm font-medium text-primary m-0">{{ t('machinery.empty.title') }}</p>
          <p class="text-xs text-neutral-border m-0">{{ t('machinery.empty.description') }}</p>
        </div>
      </div>

      <aside class="w-64 flex flex-col gap-6 shrink-0">
        <FilterSummaryBar :title="t('machinery.summary.title')" :filters="summaryFilters" />

        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
            {{ t('machinery.filters.date') }}
          </h3>
          <pv-datepicker
            v-model="dateRange"
            selectionMode="range"
            :placeholder="t('machinery.filters.date-placeholder')"
            class="w-full"
            dateFormat="mm/dd/yy"
            showButtonBar
            :manualInput="false"
          />
        </div>
      </aside>
    </div>
  </section>

  <MachineryCreateForm
    v-if="showCreateDialog"
    @saved="refresh; showCreateDialog = false"
    @close="showCreateDialog = false"
  />

  <MachineryAssignDialog
    v-if="showAssignDialog && selectedMachinery"
    :machinery="selectedMachinery"
    @saved="refresh; showAssignDialog = false; selectedMachinery = null"
    @close="showAssignDialog = false; selectedMachinery = null"
  />

  <MachineryMaintenanceDialog
    v-if="showMaintenanceDialog && selectedMachinery"
    :machinery="selectedMachinery"
    @saved="refresh; showMaintenanceDialog = false; selectedMachinery = null"
    @close="showMaintenanceDialog = false; selectedMachinery = null"
  />

  <pv-confirmdialog />
</template>
