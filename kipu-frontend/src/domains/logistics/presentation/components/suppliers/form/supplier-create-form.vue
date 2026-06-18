<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import useSupplierStore from '@/domains/logistics/application/supplier.store.js'
import {MaterialsApi} from "@/domains/logistics/infrastructure/materials.api.js"
import MultiSelect from 'primevue/multiselect'

const { t } = useI18n()
const toast = useToast()
const supplierStore = useSupplierStore()
const materialsApi = new MaterialsApi()

const props = defineProps({ visible: Boolean })
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
const selectedMaterials = ref([])
const prices = ref({})
const materials = ref([])
const materialsLoaded = ref(false)

function resetForm() {
  ruc.value = ''
  socialReason.value = ''
  contact.value = ''
  phone.value = ''
  email.value = ''
  selectedMaterials.value = []
  prices.value = {}
  saving.value = false
}

materialsApi.getMaterials().then(res => {
  materials.value = res.data || []
  materialsLoaded.value = true
}).catch(() => {})

const materialOptions = computed(() =>
    materials.value.map(m => ({ name: m.name, id: m.id }))
)

function onMaterialsChange(selected) {
  selectedMaterials.value = selected
  selected.forEach(m => {
    if (!prices.value[m.id]) prices.value[m.id] = 0
  })
}

const isValid = computed(() =>
    ruc.value.trim().length === 11 &&
    socialReason.value.trim() &&
    contact.value.trim() &&
    phone.value.trim() &&
    email.value.trim()
)

async function save() {
  if (!isValid.value) return
  saving.value = true

  supplierStore.addSupplier({
    ruc: ruc.value.trim(),
    socialReason: socialReason.value.trim(),
    contact: contact.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    isActive: true,
    paymentTerms: ''
  }, async () => {
    const createdSupplier = supplierStore.suppliers.find(s => s.ruc === ruc.value.trim())
    if (createdSupplier && selectedMaterials.value.length > 0) {
      const offerPromises = selectedMaterials.value
        .filter(m => Number(prices.value[m.id]) > 0)
        .map(m => supplierStore.addSupplierOffer({
          supplierId: createdSupplier.id,
          materialId: m.id,
          unitPrice: Number(prices.value[m.id])
        }))
      await Promise.all(offerPromises)
    }
    toast.add({ severity: 'success', summary: t('suppliers.create.success.summary'), detail: t('suppliers.create.success.message'), life: 3000 })
    emit('saved')
    emit('update:visible', false)
  }, () => {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('suppliers.create.error.message'), life: 4000 })
    saving.value = false
  })
}
</script>

<template>
  <pv-dialog v-model:visible="visibleModel" modal :style="{ width: '600px' }" :header="t('suppliers.create.title')" @show="resetForm">
    <div class="flex flex-col gap-6">
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
      <pv-button :label="t('suppliers.create.actions.submit')" icon="pi pi-save" severity="info" :disabled="saving || !isValid" @click="save" />
    </template>
  </pv-dialog>
</template>
