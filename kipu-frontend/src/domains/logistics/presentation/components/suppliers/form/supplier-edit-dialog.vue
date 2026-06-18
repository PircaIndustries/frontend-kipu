<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import useSupplierStore from '@/domains/logistics/application/supplier.store.js'
import {MaterialsApi} from "@/domains/logistics/infrastructure/materials.api.js"
import {SupplierApi} from "@/domains/logistics/infrastructure/supplier.api.js"
import {SupplierOfferAssembler} from "@/domains/logistics/infrastructure/suppliers/supplierOffer.assembler.js"
import MultiSelect from 'primevue/multiselect'
import SelectButton from 'primevue/selectbutton'

const { t } = useI18n()
const toast = useToast()
const supplierStore = useSupplierStore()
const materialsApi = new MaterialsApi()
const supplierApi = new SupplierApi()

const props = defineProps({ visible: Boolean, supplier: { type: Object, default: null } })
const emit = defineEmits(['saved', 'update:visible'])
const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const ruc = ref('')
const socialReason = ref('')
const contact = ref('')
const phone = ref('')
const email = ref('')
const saving = ref(false)
const isActive = ref(true)

const materials = ref([])
const materialsLoaded = ref(false)
const selectedMaterials = ref([])
const prices = ref({})
const existingOfferIds = ref([])

materialsApi.getMaterials().then(res => {
  materials.value = res.data || []
  materialsLoaded.value = true
})

const materialOptions = computed(() =>
    materials.value.map(m => ({ name: m.name, id: m.id }))
)

function onMaterialsChange(selected) {
  selectedMaterials.value = selected
  selected.forEach(m => {
    if (prices.value[m.id] === undefined) prices.value[m.id] = 0
  })
}

async function initForm() {
  if (!props.supplier) return
  ruc.value = props.supplier.ruc ?? ''
  socialReason.value = props.supplier.socialReason ?? ''
  contact.value = props.supplier.contact ?? ''
  phone.value = props.supplier.phone ?? ''
  email.value = props.supplier.email ?? ''
  isActive.value = props.supplier.isActive ?? true

  try {
    const [matRes, offRes] = await Promise.all([
      materialsApi.getMaterials(),
      supplierApi.getSupplierOffersBySupplier(props.supplier.id)
    ])
    materials.value = matRes.data || []
    const offers = offRes.data || []
    selectedMaterials.value = offers.map(o => {
      const mat = materials.value.find(m => String(m.id) === String(o.materialId))
      return mat ? { name: mat.name, id: mat.id } : null
    }).filter(Boolean)
    offers.forEach(o => { prices.value[o.materialId] = o.unitPrice })
    existingOfferIds.value = offers.map(o => o.id)
    console.log('Offers loaded:', offers, 'Selected:', selectedMaterials.value, 'Prices:', prices.value)
  } catch(e) {
    console.error('Error loading supplier data', e)
  }
}

const isValid = computed(() =>
    ruc.value.trim().length === 11 &&
    socialReason.value.trim() &&
    contact.value.trim() &&
    phone.value.trim() &&
    email.value.trim()
)

const save = () => {
  if (!isValid.value) return
  saving.value = true

  supplierStore.updateSupplier(props.supplier.id, {
    ruc: ruc.value.trim(),
    socialReason: socialReason.value.trim(),
    contact: contact.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    isActive: isActive.value,
    paymentTerms: props.supplier?.paymentTerms || 'NET 30'
  }, () => {
    const selectedMaterialIds = selectedMaterials.value.map(m => String(m.id))
    const toRemove = existingOfferIds.value.filter((_, idx) => {
      const offer = supplierStore.supplierOffers.find(o => String(o.id) === String(existingOfferIds.value[idx]))
      return offer && !selectedMaterialIds.includes(String(offer.materialId))
    })
    toRemove.forEach(id => supplierStore.removeSupplierOffer(id))

    const existingMaterialIds = supplierStore.supplierOffers
      .filter(o => String(o.supplierId) === String(props.supplier.id))
      .map(o => String(o.materialId))

    selectedMaterials.value.forEach(m => {
      if (!existingMaterialIds.includes(String(m.id))) {
        const price = Number(prices.value[m.id]) || 0
        if (price > 0) {
          supplierStore.addSupplierOffer({
            supplierId: props.supplier.id,
            materialId: m.id,
            unitPrice: price
          })
        }
      }
    })

    saving.value = false
    toast.add({ severity: 'success', summary: t('suppliers.edit.success.summary'), detail: t('suppliers.edit.success.message'), life: 3000 })
    emit('saved')
    emit('update:visible', false)
  }, () => {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('suppliers.edit.error.message'), life: 4000 })
    saving.value = false
  })
}

watch(() => props.visible, (val) => {
  if (val) initForm()
})
</script>

<template>
  <pv-dialog v-model:visible="visibleModel" modal :style="{ width: '600px' }" :header="t('suppliers.edit.title')" @show="initForm">
    <div class="flex flex-col gap-6">
      <div class="text-xs text-neutral-border uppercase font-bold tracking-wider">RUC: {{ supplier?.ruc }}</div>
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('suppliers.create.ruc-label') }}</span>
        <pv-inputtext v-model="ruc" :placeholder="t('suppliers.create.ruc-placeholder')" maxlength="11" fluid />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('suppliers.create.social-reason-label') }}</span>
        <pv-inputtext v-model="socialReason" :placeholder="t('suppliers.create.social-reason-placeholder')" fluid />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('suppliers.create.contact-label') }}</span>
          <pv-inputtext v-model="contact" :placeholder="t('suppliers.create.contact-placeholder')" fluid />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('suppliers.create.phone-label') }}</span>
          <pv-inputtext v-model="phone" :placeholder="t('suppliers.create.phone-placeholder')" fluid />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('suppliers.create.email-label') }}</span>
        <pv-inputtext v-model="email" type="email" placeholder="ejemplo@correo.com" fluid />
      </div>

      <div class="flex items-center gap-3 border-t pt-4">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">Estado</span>
        <SelectButton v-model="isActive" :options="[{ label: 'Activo', value: true }, { label: 'Inactivo', value: false }]" optionLabel="label" optionValue="value" />
      </div>

      <div class="border-t pt-4">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider block mb-2">Materiales y Precios</span>
        <MultiSelect v-model="selectedMaterials" :options="materialOptions" optionLabel="name" filter placeholder="Seleccionar materiales" :maxSelectedLabels="3" class="w-full" @update:model-value="onMaterialsChange" />
        <div v-for="m in selectedMaterials" :key="m.id" class="flex items-center gap-3 mt-2">
          <span class="text-sm font-medium w-1/2">{{ m.name }}</span>
          <pv-inputnumber v-model="prices[m.id]" :min="0" :minFractionDigits="2" :maxFractionDigits="2" placeholder="Precio unitario S/" class="w-1/2" fluid>
            <template #prefix><span class="text-xs">S/ </span></template>
          </pv-inputnumber>
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button :label="t('suppliers.create.actions.cancel')" severity="secondary" variant="outlined" :disabled="saving" @click="emit('update:visible', false)" />
      <pv-button :label="t('suppliers.edit.actions.submit')" icon="pi pi-save" severity="info" :disabled="saving || !isValid" @click="save" />
    </template>
  </pv-dialog>
</template>
