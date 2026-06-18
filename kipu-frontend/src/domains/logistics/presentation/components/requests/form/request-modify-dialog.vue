<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue'
import useRequestStore from '@/domains/logistics/application/requests.store.js'
import useSupplierStore from '@/domains/logistics/application/supplier.store.js'
import { getMeasureUnitLabel } from '@/domains/logistics/domain/model/materials/measureUnit.map.js'

const { t } = useI18n()
const toast = useToast()
const requestStore = useRequestStore()
const supplierStore = useSupplierStore()

const props = defineProps({
  request: { type: Object, required: true },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'modified'])

const selectedCategory = ref('')
const selectedMaterial = ref('')
const selectedSupplier = ref('')
const quantity = ref(1)
const selectedPriority = ref('Low')
const requiredDate = ref(null)
const deliveryLocation = ref('')
const purpose = ref('')
const additionalNotes = ref('')

const categoryOptions = computed(() =>
    requestStore.categories.map(c => ({ name: c.name }))
)

const filteredMaterials = computed(() => {
  if (!selectedCategory.value) return []
  const category = requestStore.categories.find(c => c.name === selectedCategory.value)
  if (!category) return []
  return requestStore.materials.filter(m => m.categoryId === category.id)
})
const materialOptions = computed(() => filteredMaterials.value.map(m => ({ name: m.name })))

const materialSelected = computed(() =>
    requestStore.materials.find(m => m.name === selectedMaterial.value)
)
const filteredSuppliers = computed(() => {
  if (!materialSelected.value) return []
  return supplierStore.getSuppliersByMaterialId(materialSelected.value.id)
})
const selectedOffer = computed(() =>
    supplierStore.getSupplierOffer(materialSelected.value?.id, selectedSupplier.value)
)
const selectedPrice = computed(() => selectedOffer.value?.unitPrice ?? 0)
const supplierOptions = computed(() =>
    filteredSuppliers.value.map(s => ({ name: s.socialReason }))
)
const selectedUnit = computed(() => materialSelected.value ? getMeasureUnitLabel(materialSelected.value.measureUnit) : '')
const totalPrice = computed(() => quantity.value * selectedPrice.value)

function onCategoryChange() {
  selectedMaterial.value = ''
  selectedSupplier.value = ''
}
function onMaterialChange() {
  selectedSupplier.value = ''
}

function initForm() {
  if (!props.request) return
  const firstItem = props.request.items?.[0] || {}
  selectedCategory.value = firstItem.categoryName ?? ''
  selectedMaterial.value = firstItem.materialName ?? ''
  quantity.value = firstItem.quantity ?? 1
  selectedPriority.value = props.request.requestPriority ?? 'Low'
  requiredDate.value = props.request.deadline ? new Date(props.request.deadline) : null
  deliveryLocation.value = props.request.deliveryLocation ?? ''
  purpose.value = props.request.purpose ?? ''
  additionalNotes.value = props.request.additionalNotes ?? ''
  setSupplierFromRequest()
}

function setSupplierFromRequest() {
  const firstItem = props.request?.items?.[0]
  if (!firstItem?.supplierId) return
  const supplier = supplierStore.suppliers.find(s => String(s.id) === String(firstItem.supplierId))
  if (supplier) selectedSupplier.value = supplier.socialReason
}

watch(() => supplierStore.suppliersLoaded, (loaded) => {
  if (loaded && props.visible) setSupplierFromRequest()
})

const submitted = ref(false)
const allFieldsValid = computed(() =>
    selectedCategory.value && selectedMaterial.value && selectedSupplier.value &&
    quantity.value >= 1 && deliveryLocation.value && purpose.value && requiredDate.value
)
const submitting = ref(false)

const onFormSubmit = () => {
  if (submitting.value) return
  submitted.value = true
  if (!allFieldsValid.value) return
  submitting.value = true

  const selectedSupplierObj = supplierStore.suppliers.find(s => s.socialReason === selectedSupplier.value)
  const materialSelected = requestStore.materials.find(m => m.name === selectedMaterial.value)

  const firstItem = props.request.items?.[0] || {}
  const updates = {
    deliveryLocation: deliveryLocation.value,
    purpose: purpose.value,
    additionalNotes: additionalNotes.value || null,
    deadline: requiredDate.value ? new Date(requiredDate.value).toISOString() : new Date().toISOString(),
    requestPriority: selectedPriority.value,
    items: [{
      id: firstItem.id,
      materialCatalogId: Number(materialSelected?.id),
      supplierId: Number(selectedSupplierObj?.id),
      quantity: quantity.value,
      unitPrice: selectedPrice.value
    }]
  }

  requestStore.updateRequest(props.request.id, updates, () => {
    toast.add({ severity: 'success', summary: t('request.modify.success.summary'), detail: t('request.modify.success.message'), life: 3000 })
    emit('modified')
    emit('update:visible', false)
  })
  setTimeout(() => { submitting.value = false }, 8000)
}

const close = () => emit('update:visible', false)

onMounted(() => {
  requestStore.fetchCategories()
  requestStore.fetchMaterials()
  supplierStore.fetchSuppliers()
  supplierStore.fetchSupplierOffers()
})
</script>

<template>
  <pv-dialog :visible="visible" @update:visible="(val) => emit('update:visible', val)" @show="initForm" modal :header="t('request.modify.title')" :style="{ width: '750px' }">
    <form id="modify-form" @submit.prevent="onFormSubmit">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl font-black text-primary tracking-tighter">#{{ request.id }}</span>
        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" :class="{
          'bg-success-soft text-success border-success': request.requestStatus === 'Accepted',
          'bg-warning-soft text-warning border-warning': request.requestStatus === 'Pending',
          'bg-danger-soft text-danger border-danger': request.requestStatus === 'Refused'
        }">
          {{ t(`request.card.status.${request.requestStatus?.toLowerCase()}`) }}
        </span>
      </div>

      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.category') }}</span>
            <autocomplete-component v-model="selectedCategory" :options="categoryOptions" :placeholder="t('request.create.placeholders.select')" :return-object="false" disabled />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.specific-material') }}</span>
            <autocomplete-component v-model="selectedMaterial" :options="materialOptions" placeholder="" :return-object="false" disabled />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.suggested-supplier') }}</span>
            <autocomplete-component v-model="selectedSupplier" :options="supplierOptions" :placeholder="t('request.create.placeholders.select')" :return-object="false" :invalid="submitted && !selectedSupplier" :disabled="!selectedMaterial" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.quantity') }}</span>
            <pv-inputnumber v-model="quantity" :min="1" showButtons buttonLayout="horizontal" :placeholder="t('request.create.placeholders.quantity')" :invalid="submitted && (quantity < 1)" fluid />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.unit') }}</span>
            <div class="w-full min-h-[2.5rem] flex items-center gap-2 px-4 rounded-m border border-neutral-border/20 bg-white text-sm">
              <span v-if="selectedUnit" class="text-primary font-medium">{{ selectedUnit }}</span>
              <span v-else class="text-neutral-border">{{ t('request.create.placeholders.unit-empty') }}</span>
              <span v-if="selectedPrice" class="ml-auto text-accent font-bold">S/ {{ selectedPrice }} / {{ selectedUnit }}</span>
            </div>
          </div>
        </div>

        <div v-if="totalPrice > 0" class="border-t pt-4 flex items-center justify-between px-2">
          <span class="text-sm font-bold text-primary/80 uppercase tracking-wider">Total Estimado</span>
          <span class="text-lg font-bold text-accent">S/ {{ totalPrice.toFixed(2) }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.priority') }}</span>
            <pv-select v-model="selectedPriority" :options="['Low', 'Medium', 'High', 'Critical']" fluid>
              <template #value="slotProps">
                <span>{{ t(`request.create.priority.${slotProps.value.toLowerCase()}`) }}</span>
              </template>
              <template #option="slotProps">
                <span>{{ t(`request.create.priority.${slotProps.option.toLowerCase()}`) }}</span>
              </template>
            </pv-select>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.required-date') }}</span>
            <pv-datepicker v-model="requiredDate" :min-date="new Date()" :placeholder="t('request.create.placeholders.date')" :invalid="submitted && !requiredDate" fluid />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.delivery-location') }}</span>
            <pv-inputtext v-model="deliveryLocation" :placeholder="t('request.create.placeholders.location')" :invalid="submitted && !deliveryLocation" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.purpose') }}</span>
          <pv-textarea v-model="purpose" rows="3" :placeholder="t('request.create.placeholders.purpose')" :invalid="submitted && !purpose" />
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.additional-notes') }}</span>
          <pv-textarea v-model="additionalNotes" rows="2" :placeholder="t('request.create.placeholders.additional-notes')" />
        </div>
      </div>
    </form>

    <template #footer>
      <pv-button type="button" :label="t('request.modify.actions.cancel')" severity="secondary" variant="outlined" @click="close" />
      <pv-button type="submit" form="modify-form" :label="t('request.modify.actions.submit')" icon="pi pi-save" :disabled="submitting" />
    </template>
  </pv-dialog>
</template>
