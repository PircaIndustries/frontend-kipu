<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue'
import useRequestStore from '@/domains/logistics/application/requests.store.js'
import useSupplierStore from '@/domains/logistics/application/supplier.store.js'

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
const selectedPriority = ref('LOW')
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
const selectedUnit = computed(() => materialSelected.value?.measureUnit ?? '')

const filteredSuppliers = computed(() => {
  if (!materialSelected.value) return []
  return supplierStore.getSuppliersByMaterialId(materialSelected.value.id)
})
const supplierOptions = computed(() => filteredSuppliers.value.map(s => ({ name: s.socialReason })))

const selectedSupplierOffer = computed(() => {
  if (!materialSelected.value || !selectedSupplier.value) return null
  return supplierStore.getSupplierOffer(materialSelected.value.id, selectedSupplier.value)
})
const selectedPrice = computed(() => selectedSupplierOffer.value?.unitPrice ?? 0)
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
  selectedPriority.value = props.request.priority ?? 'LOW'
  requiredDate.value = props.request.deadline ? new Date(props.request.deadline) : null
  deliveryLocation.value = props.request.deliveryLocation ?? ''
  purpose.value = props.request.purpose ?? ''
  additionalNotes.value = props.request.additionalNotes ?? ''

  const offerId = firstItem.supplierOfferId
  if (offerId) {
    const offer = supplierStore.supplierOffers.find(o => o.id === offerId)
    if (offer) {
      const supplier = supplierStore.suppliers.find(s => s.id === offer.supplierId)
      selectedSupplier.value = supplier?.socialReason ?? ''
    }
  }
  if (!selectedSupplier.value) {
    const sid = props.request.suggestedSupplierId
    if (sid) {
      const s = supplierStore.suppliers.find(s => s.id === sid)
      selectedSupplier.value = s?.socialReason ?? ''
    }
  }
}
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
  const updates = {
    items: [{
      supplierOfferId: selectedSupplierOffer.value?.id ?? '',
      quantity: quantity.value
    }],
    suggestedSupplierId: filteredSuppliers.value.find(s => s.socialReason === selectedSupplier.value)?.id ?? '',
    priority: selectedPriority.value,
    deliveryLocation: deliveryLocation.value,
    purpose: purpose.value,
    additionalNotes: additionalNotes.value,
    deadline: requiredDate.value ? new Date(requiredDate.value).toISOString().split('T')[0] : '',
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
  requestStore.fetchSupplierOffers()
  supplierStore.fetchSupplierOffers()
  supplierStore.fetchSuppliers()
})
</script>

<template>
  <pv-dialog
      :visible="visible"
      @update:visible="(val) => emit('update:visible', val)"
      @show="initForm"
      modal
      :style="{ width: '750px' }"
      :pt="{ content: { class: 'p-0' } }"
  >
    <form @submit.prevent="onFormSubmit" class="flex flex-col border border-neutral-border/30 rounded-xl overflow-hidden">
      <header
          class="px-8 py-6 flex items-center justify-between"
          :class="{
          'bg-success-soft border-b border-success': request.status === 'APPROVED',
          'bg-warning-soft border-b border-warning': request.status === 'PENDING',
          'bg-danger-soft border-b border-danger': request.status === 'REFUSED'
        }"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl font-black text-primary tracking-tighter">#{{ request.id }}</span>
          <span
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
              :class="{
              'bg-success-soft text-success border-success': request.status === 'APPROVED',
              'bg-warning-soft text-warning border-warning': request.status === 'PENDING',
              'bg-danger-soft text-danger border-danger': request.status === 'REFUSED'
            }"
          >
            {{ t(`request.card.status.${request.status?.toLowerCase()}`) }}
          </span>
        </div>
        <div class="text-sm text-primary opacity-70">
          {{ t('request.modify.title') }}
        </div>
      </header>

      <div class="p-8 bg-white flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.category') }}</span>
            <autocomplete-component
                v-model="selectedCategory"
                :options="categoryOptions"
                :placeholder="t('request.create.placeholders.select')"
                :return-object="false"
                :invalid="submitted && !selectedCategory"
                @update:model-value="onCategoryChange"
            />
            <span v-if="submitted && !selectedCategory" class="text-xs text-danger">
              {{ t('request.create.validation.category-required') }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.specific-material') }}</span>
            <autocomplete-component
                v-model="selectedMaterial"
                :options="materialOptions"
                :placeholder="selectedCategory ? t('request.create.placeholders.select') : t('request.create.placeholders.select-category-first')"
                :disabled="!selectedCategory"
                :return-object="false"
                :invalid="submitted && selectedCategory && !selectedMaterial"
                @update:model-value="onMaterialChange"
            />
            <span v-if="submitted && !selectedMaterial && selectedCategory" class="text-xs text-danger">
              {{ t('request.create.validation.material-required') }}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.suggested-supplier') }}</span>
          <autocomplete-component
              v-model="selectedSupplier"
              :options="supplierOptions"
              :placeholder="selectedMaterial ? t('request.create.placeholders.select') : t('request.create.placeholders.select-material-first')"
              :disabled="!selectedMaterial"
              :return-object="false"
              :invalid="submitted && selectedMaterial && !selectedSupplier"
          />
          <span v-if="submitted && !selectedSupplier && selectedMaterial" class="text-xs text-danger">
            {{ t('request.create.validation.supplier-required') }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.quantity') }}</span>
            <pv-inputnumber
                v-model="quantity"
                :min="1"
                showButtons
                buttonLayout="horizontal"
                :placeholder="t('request.create.placeholders.quantity')"
                :invalid="submitted && (quantity < 1)"
                fluid
            >
              <template #incrementbuttonicon><span class="pi pi-plus" /></template>
              <template #decrementbuttonicon><span class="pi pi-minus" /></template>
            </pv-inputnumber>
            <span v-if="submitted && quantity < 1" class="text-xs text-danger">{{ t('request.create.validation.quantity-required') }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.unit') }}</span>
            <div class="w-full min-h-[2.5rem] flex items-center gap-2 px-4 rounded-m border border-neutral-border/20 bg-white text-sm">
              <span v-if="selectedUnit" class="text-primary font-medium">{{ selectedUnit }}</span>
              <span v-else class="text-neutral-border">{{ t('request.create.placeholders.unit-empty') }}</span>
              <span v-if="selectedPrice" class="ml-auto text-accent font-bold">S/ {{ selectedPrice.toFixed(2) }} / {{ selectedUnit }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.priority') }}</span>
            <pv-select v-model="selectedPriority" :options="['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']" fluid>
              <template #value="slotProps">
                <span>{{ t(`request.create.priority.${slotProps.value.toLowerCase()}`) }}</span>
              </template>
              <template #option="slotProps">
                <span>{{ t(`request.create.priority.${slotProps.option.toLowerCase()}`) }}</span>
              </template>
            </pv-select>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.required-date') }}</span>
            <pv-datepicker
                v-model="requiredDate"
                :placeholder="t('request.create.placeholders.date')"
                :invalid="submitted && !requiredDate"
                fluid
            />
            <span v-if="submitted && !requiredDate" class="text-xs text-danger">{{ t('request.create.validation.date-required') }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.delivery-location') }}</span>
          <pv-inputtext
              v-model="deliveryLocation"
              :placeholder="t('request.create.placeholders.location')"
              :invalid="submitted && !deliveryLocation"
              fluid
          />
          <span v-if="submitted && !deliveryLocation" class="text-xs text-danger">{{ t('request.create.validation.location-required') }}</span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.purpose') }}</span>
          <pv-textarea
              v-model="purpose"
              rows="3"
              :placeholder="t('request.create.placeholders.purpose')"
              :invalid="submitted && !purpose"
          />
          <span v-if="submitted && !purpose" class="text-xs text-danger">{{ t('request.create.validation.purpose-required') }}</span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.additional-notes') }}</span>
          <pv-textarea v-model="additionalNotes" rows="2" :placeholder="t('request.create.placeholders.additional-notes')" />
        </div>
        <div class="bg-primary rounded-xl p-6 flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] text-neutral-border uppercase font-black tracking-widest">{{ t('request.detail.total-investment') }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-xs text-success font-bold">S/</span>
              <span class="text-3xl font-black text-white tracking-tighter">{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 py-4 bg-neutral-bg border-t border-neutral-border/30 flex justify-end gap-4">
        <pv-button
            type="button"
            :label="t('request.modify.actions.cancel')"
            severity="secondary"
            variant="outlined"
            @click="close"
        />
        <pv-button
            :label="t('request.modify.actions.submit')"
            icon="pi pi-save"
            @click="onFormSubmit"
        />
      </div>
    </form>
  </pv-dialog>
</template>