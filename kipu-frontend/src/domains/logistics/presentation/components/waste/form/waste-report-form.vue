<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import useWasteStore from '@/domains/logistics/application/waste.store.js'
import useInventoryStore from '@/domains/logistics/application/inventory.store.js'
import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue'
import SelectWithAddComponent from '@/shared/presentation/components/selectWithAddComponent.vue'

const { t } = useI18n()
const toast = useToast()
const wasteStore = useWasteStore()
const inventoryStore = useInventoryStore()

const { inventoryView } = storeToRefs(inventoryStore)
const { classifications } = storeToRefs(wasteStore)

const emit = defineEmits(['saved', 'close'])

const visible = ref(true)
const selectedInventory = ref(null)
const quantity = ref(null)
const selectedClassification = ref(null)
const reason = ref('')
const saving = ref(false)

const fieldErrors = ref({
  material: '',
  quantity: '',
  classification: '',
  reason: ''
})

const classificationOptions = computed(() =>
  classifications.value.map(c => ({ name: c.name }))
)

const materialOptions = computed(() =>
  inventoryView.value
    .filter(inv => inv.currentStock > 0)
    .map(inv => ({
      id: inv.materialId,
      invId: inv.id,
      name: inv.materialName,
      unit: inv.materialUnit,
      stock: inv.currentStock
    }))
)

const selectedUnit = computed(() => selectedInventory.value?.unit || '')

function close() {
  visible.value = false
  emit('close')
}

function validate() {
  fieldErrors.value = { material: '', quantity: '', classification: '', reason: '' }
  let valid = true
  if (!selectedInventory.value) {
    fieldErrors.value.material = t('waste.create.errors.material-required')
    valid = false
  }
  if (!quantity.value || quantity.value <= 0) {
    fieldErrors.value.quantity = t('waste.create.errors.quantity-required')
    valid = false
  } else if (selectedInventory.value && quantity.value > selectedInventory.value.stock) {
    fieldErrors.value.quantity = t('waste.create.errors.quantity-exceeds-stock', { stock: selectedInventory.value.stock })
    valid = false
  }
  if (!selectedClassification.value) {
    fieldErrors.value.classification = t('waste.create.errors.classification-required')
    valid = false
  }
  if (!reason.value.trim()) {
    fieldErrors.value.reason = t('waste.create.errors.reason-required')
    valid = false
  }
  return valid
}

function save() {
  if (!validate()) return

  saving.value = true

  let currentUser = null
  try {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      const parsed = JSON.parse(stored)
      currentUser = parsed.id || null
    }
  } catch (e) {}

  const currentProjectId = localStorage.getItem('currentProjectId') || 'proj-01'

  const newWaste = {
    id: `rmt-${Date.now()}`,
    projectId: currentProjectId,
    materialId: selectedInventory.value.id,
    quantity: quantity.value,
    classificationType: selectedClassification.value.name.toUpperCase(),
    date: new Date().toISOString().slice(0, 10),
    description: reason.value.trim(),
    reportedBy: currentUser,
    photoUrl: ''
  }

  wasteStore.addWaste(newWaste, () => {
    inventoryStore.deductStock(selectedInventory.value.invId, quantity.value);
    toast.add({
      severity: 'success',
      summary: t('waste.create.success.summary'),
      detail: t('waste.create.success.detail'),
      life: 3000
    })
    emit('saved')
    close()
  })
}

function onAddClassification(name) {
  wasteStore.addClassification(name, () => {
    selectedClassification.value = { name }
    toast.add({
      severity: 'success',
      summary: t('waste.classification.added.summary'),
      detail: t('waste.classification.added.detail', { name }),
      life: 2000
    })
  })
}

onMounted(() => {
  if (!inventoryStore.inventoryLoaded) inventoryStore.fetchInventory()
  if (!inventoryStore.materialsLoaded) inventoryStore.fetchMaterials()
  wasteStore.fetchClassifications()
})
</script>

<template>
  <pv-dialog
    v-model:visible="visible"
    modal
    :style="{ width: '600px' }"
    :header="t('waste.create.title')"
    @hide="close"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('waste.create.fields.material') }} *
        </span>
        <AutocompleteComponent
          v-model="selectedInventory"
          :options="materialOptions"
          :placeholder="t('waste.create.placeholders.material')"
          :invalid="!!fieldErrors.material"
          return-object
        />
        <small v-if="fieldErrors.material" class="text-red-500 text-xs">{{ fieldErrors.material }}</small>
        <small v-else-if="selectedInventory" class="text-neutral-border text-xs">
          {{ t('waste.create.fields.stock') }}: {{ selectedInventory.stock }}
        </small>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('waste.create.fields.quantity') }} *
          </span>
          <pv-inputnumber
            v-model="quantity"
            :min="1"
            :invalid="!!fieldErrors.quantity"
            :placeholder="t('waste.create.placeholders.quantity')"
            fluid
          />
          <small v-if="fieldErrors.quantity" class="text-red-500 text-xs">{{ fieldErrors.quantity }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('waste.create.fields.unit') }}
          </span>
          <pv-inputtext
            :model-value="selectedUnit || t('waste.create.placeholders.select-material')"
            disabled
            fluid
            class="placeholder:text-neutral-border/70"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('waste.create.fields.classification') }} *
        </span>
        <SelectWithAddComponent
          v-model="selectedClassification"
          :options="classificationOptions"
          :placeholder="t('waste.create.placeholders.classification')"
          :invalid="!!fieldErrors.classification"
          :add-label="t('waste.classification.add-label')"
          :add-placeholder="t('waste.classification.add-placeholder')"
          @add="onAddClassification"
        />
        <small v-if="fieldErrors.classification" class="text-red-500 text-xs">{{ fieldErrors.classification }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('waste.create.fields.date') }}
        </span>
        <pv-inputtext
          :model-value="new Date().toLocaleDateString()"
          disabled
          fluid
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('waste.create.fields.reason') }} *
        </span>
        <pv-textarea
          v-model="reason"
          :placeholder="t('waste.create.placeholders.reason')"
          :invalid="!!fieldErrors.reason"
          rows="3"
          fluid
        />
        <small v-if="fieldErrors.reason" class="text-red-500 text-xs">{{ fieldErrors.reason }}</small>
      </div>
    </div>

    <template #footer>
      <pv-button
        :label="t('waste.create.actions.cancel')"
        severity="secondary"
        variant="outlined"
        :disabled="saving"
        @click="close"
      />
      <pv-button
        :label="t('waste.create.actions.submit')"
        icon="pi pi-save"
        severity="info"
        :disabled="saving"
        @click="save"
      />
    </template>
  </pv-dialog>
</template>
