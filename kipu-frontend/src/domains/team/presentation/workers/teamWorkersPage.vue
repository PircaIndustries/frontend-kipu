<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-text-main">{{ $t('team.workers.title') }}</h1>
      <div class="flex gap-4">
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-border text-sm"></i>
          <InputText
              v-model="searchValue"
              :placeholder="$t('team.workers.search-placeholder')"
              class="pl-10! w-64!"
          />
          <i
              v-if="searchValue"
              @click="clearSearch"
              class="pi pi-times absolute right-3 top-1/2 -translate-y-1/2 text-neutral-border cursor-pointer hover:text-text-main"
          ></i>
        </div>
        <Button
            @click="openAddWorkerDialog"
            :label="$t('team.workers.register.btn-add-worker')"
            icon="pi pi-user-plus"
            class="bg-accent! text-white border-none! hover:bg-primary!"
        />
      </div>
    </div>

    <p class="text-base text-neutral-border mb-4">{{ $t('team.workers.register.description') }}</p>

    <Card>
      <template #content>
        <DataTable :value="filteredWorkers" class="w-full">
          <Column field="dni" :header="$t('team.workers.register.tab-dni')">
            <template #body="{ data }"><span class="text-text-main">{{ data.dni }}</span></template>
          </Column>

          <Column field="fullName" :header="$t('team.workers.register.tab-name')">
            <template #body="{ data }"><span class="text-text-main">{{ data.fullName }}</span></template>
          </Column>

          <Column field="role" :header="$t('team.workers.register.tab-role')">
            <template #body="{ data }"><span class="text-text-main">{{ data.role }}</span></template>
          </Column>

          <Column field="status" :header="$t('team.workers.register.tab-status')">
            <template #body="{ data }">
              <Badge
                  :value="data.isActive ? $t('team.workers.register.tab-status-active') : $t('team.workers.register.tab-status-inactive')"
                  :severity="data.isActive ? 'success' : 'secondary'"
              />
            </template>
          </Column>

          <Column field="tools" :header="$t('team.workers.register.tab-tools')">
            <template #body="{ data }">
              <div class="relative">
                <button
                    @click="toggleToolsDropdown(data.id)"
                    class="text-accent hover:text-primary underline cursor-pointer"
                >
                  {{ getToolsCountLabel(data.assignedTools?.length || 0) }}
                </button>
                <div
                    v-if="openToolsDropdown === data.id"
                    class="absolute z-50 mt-1 bg-white border border-neutral-border rounded-lg shadow-lg min-w-48"
                >
                  <div class="p-2 border-b border-neutral-border bg-neutral-bg rounded-t-lg">
                    <span class="text-xs font-bold text-text-main">Herramientas asignadas</span>
                  </div>
                  <div class="p-2">
                    <ul v-if="data.assignedTools?.length > 0" class="list-disc list-inside">
                      <li v-for="tool in data.assignedTools" :key="tool" class="text-sm text-text-main">
                        {{ tool }}
                      </li>
                    </ul>
                    <p v-else class="text-sm text-neutral-border">Sin herramientas asignadas</p>
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column :header="$t('team.workers.register.tab-action')">
            <template #body="{ data }">
              <Button
                  @click="toggleStatus(data)"
                  label="Eliminar"
                  severity="danger"
                  text
                  size="small"
                  :loading="togglingId === data.id"
              />
            </template>
          </Column>
        </DataTable>

        <div class="text-right text-sm text-neutral-border mt-4">
          {{ filteredWorkers.length }} / {{ store.allWorkers.length }} {{ $t('team.workers.register.worker-count') }}
        </div>
      </template>
    </Card>

    <div class="mt-6 p-4 bg-neutral-bg rounded-md border border-neutral-border flex gap-0.5 flex-col">
      <h3 class="text-xl font-bold text-primary mb-2">{{ $t('team.workers.register.flow-title') }}</h3>
      <p class="text-base text-text-main">{{ $t('team.workers.register.flow-description') }}</p>
      <router-link to="/logistics/machinery" class="text-base text-accent mt-2 cursor-pointer hover:underline">
        {{ $t('team.workers.register.go-to-materials') }}
      </router-link>
    </div>

    <Dialog
        v-model:visible="dialogVisible"
        :header="$t('team.workers.add-modal.title')"
        :modal="true"
        class="w-[550px]"
        :style="{ borderRadius: 'var(--radius-m)' }"
    >
      <form @submit.prevent="createWorker" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-text-main">{{ $t('team.workers.add-modal.dni-label') }}</label>
          <InputText v-model="newWorker.dni" :placeholder="$t('team.workers.add-modal.dni-placeholder')" required class="border-neutral-border focus:border-accent" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-text-main">{{ $t('team.workers.add-modal.name-label') }}</label>
          <InputText v-model="newWorker.fullName" :placeholder="$t('team.workers.add-modal.name-placeholder')" required class="border-neutral-border focus:border-accent" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-text-main">{{ $t('team.workers.add-modal.role-label') }}</label>
          <InputText v-model="newWorker.role" :placeholder="$t('team.workers.add-modal.role-placeholder')" required class="border-neutral-border focus:border-accent" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-text-main">{{ $t('team.workers.add-modal.tools-title') }}</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
                v-for="(tool, index) in newWorker.assignedTools"
                :key="index"
                class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent! rounded-full"
            >
              {{ tool.machineryName || tool.name }}
              <button type="button" @click="removeTool(index)" class="hover:text-primary"><i class="pi pi-times text-xs"></i></button>
            </span>
          </div>
          <div class="flex gap-2">
            <Dropdown
                v-model="selectedMachineryItem"
                :options="availableMachineryList"
                optionLabel="machineryName"
                :placeholder="$t('team.workers.add-modal.tools-add')"
                @change="addTool"
                class="w-full text-sm text-text-main!"
            />
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeDialog" :label="$t('team.workers.add-modal.btn-cancel')" text class="text-text-main! hover:bg-primary!" />
          <Button @click="createWorker" :disabled="!isFormValid" :loading="creating" :label="$t('team.workers.add-modal.btn-save')" class="bg-accent! text-white border-none! hover:bg-primary" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTeamWorkerStore } from '../../application/team-worker.store.js'
import useMachineryStore from '@/domains/logistics/application/machinery.store.js'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'

const store = useTeamWorkerStore()
const machineryStore = useMachineryStore()

const searchValue = ref('')
const openToolsDropdown = ref(null)
const togglingId = ref(null)
const dialogVisible = ref(false)
const creating = ref(false)
const selectedMachineryItem = ref(null)

const newWorker = ref({
  dni: '',
  fullName: '',
  role: '',
  assignedTools: []
})

const isFormValid = computed(() => newWorker.value.dni && newWorker.value.fullName && newWorker.value.role)
const currentProjectId = computed(() => localStorage.getItem('currentProjectId') || 'proj-01')

const availableMachineryList = computed(() => {
  return (machineryStore.machineryView || []).filter(
      item => item.status === 'AVAILABLE' && String(item.projectId) === String(currentProjectId.value)
  )
})

const filteredWorkers = computed(() => store.filteredWorkers)

const getToolsCountLabel = (count) => {
  if (count === 0) return '0 equipos'
  if (count === 1) return '1 equipo'
  return `${count} equipos`
}

const toggleToolsDropdown = (workerId) => {
  openToolsDropdown.value = openToolsDropdown.value === workerId ? null : workerId
}

const toggleStatus = async (worker) => {
  togglingId.value = worker.id
  try {
    await store.toggleWorkerStatus(worker)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    togglingId.value = null
  }
}

const clearSearch = () => {
  searchValue.value = ''
  store.updateSearchTerm('')
}

const handleClickOutside = (event) => {
  if (openToolsDropdown.value !== null && !event.target.closest('.relative')) {
    openToolsDropdown.value = null
  }
}

const openAddWorkerDialog = () => {
  newWorker.value = { dni: '', fullName: '', role: '', assignedTools: [] }
  selectedMachineryItem.value = null
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const addTool = () => {
  if (selectedMachineryItem.value && !newWorker.value.assignedTools.some(t => t.id === selectedMachineryItem.value.id)) {
    newWorker.value.assignedTools.push(selectedMachineryItem.value)
    selectedMachineryItem.value = null
  }
}

const removeTool = (index) => {
  newWorker.value.assignedTools.splice(index, 1)
}

const createWorker = async () => {
  if (!isFormValid.value) return
  creating.value = true

  try {
    // Almacenamos el array entero de objetos de máquinas
    const toolsToSync = [...newWorker.value.assignedTools]

    const workerPayload = {
      dni: newWorker.value.dni,
      fullName: newWorker.value.fullName,
      role: newWorker.value.role
    }

    // Le pasamos el worker y el arreglo de herramientas por separado al Store
    const createdWorker = await store.createWorker(workerPayload, toolsToSync)
    await store.fetchWorkers()

    if (createdWorker && toolsToSync.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10)

      setTimeout(async () => {
        try {
          for (const machine of toolsToSync) {
            const updatedAssignmentPayload = {
              ...machine,
              status: 'IN_USE',
              assignedTo: createdWorker.id,
              registrationDate: todayStr,
              assignmentDetail: `Asignado a ${createdWorker.fullName}`
            }
            await machineryStore.updateAssignment(machine.id, updatedAssignmentPayload)
          }
          await machineryStore.fetchMachinery()
        } catch (err) {
          console.error("Error sincronizando logística:", err)
        }
      }, 100)
    }

    closeDialog()
  } catch (error) {
    console.error("Error al crear:", error)
  } finally {
    creating.value = false
  }
}

watch(searchValue, (newVal) => {
  store.updateSearchTerm(newVal)
})

onMounted(() => {
  store.fetchWorkers()
  machineryStore.fetchMachinery()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>