<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import useSupplierStore from '@/domains/logistics/application/supplier.store.js'

const { t } = useI18n()
const toast = useToast()
const supplierStore = useSupplierStore()

const emit = defineEmits(['saved', 'close'])

const ruc = ref('')
const socialReason = ref('')
const contact = ref('')
const phone = ref('')
const email = ref('')
const saving = ref(false)

const save = () => {
  saving.value = true
  supplierStore.addSupplier({
    ruc: ruc.value.trim(),
    socialReason: socialReason.value.trim(),
    contact: contact.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    status: 'ACTIVE',
    onboarded: new Date().toISOString().split('T')[0]
  }, () => {
    toast.add({ severity: 'success', summary: t('suppliers.create.success.summary'), detail: t('suppliers.create.success.message'), life: 3000 })
    emit('saved')
    emit('close')
  }, () => {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('suppliers.create.error.message'), life: 4000 })
    saving.value = false
  })
}
</script>

<template>
  <pv-dialog visible modal :style="{ width: '600px' }" :header="t('suppliers.create.title')" @hide="emit('close')">
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
    </div>

    <template #footer>
      <pv-button :label="t('suppliers.create.actions.cancel')" severity="secondary" variant="outlined" :disabled="saving" @click="emit('close')" />
      <pv-button :label="t('suppliers.create.actions.submit')" icon="pi pi-save" severity="info" :disabled="saving" @click="save" />
    </template>
  </pv-dialog>
</template>
