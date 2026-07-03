<template>
  <Dialog
      :visible="visible"
      @update:visible="emit('update:visible', $event)"
      :header="$t('signatures.dialog.title')"
      :modal="true"
      :closable="false"
      class="w-96"
  >
    <div class="flex flex-col gap-4">
      <p class="text-text-main">{{ $t('signatures.dialog.description') }}</p>
      <div class="bg-info-soft p-3 rounded-lg">
        <p class="text-sm text-info">{{ $t('signatures.dialog.token-sent') }}</p>
      </div>
      <InputText
          v-model="token"
          type="text"
          maxlength="6"
          placeholder="000000"
          class="border-neutral-border! focus:border-accent!"
      />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="close" :label="$t('signatures.dialog.btn-cancel')" text class="text-text-main! hover:text-primary!" />
        <Button
            @click="confirmSign"
            :label="$t('signatures.dialog.btn-confirm')"
            :disabled="token.length !== 6"
            class="bg-accent! text-white border-none! hover:bg-primary!"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDocumentStore } from '../../application/document.store.js'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toast = useToast()
const props = defineProps({
  visible: Boolean,
  document: Object
})

const emit = defineEmits(['update:visible', 'signed'])

const documentStore = useDocumentStore()
const token = ref('')

const sending = ref(false)

const close = () => {
  token.value = ''
  sending.value = false
  emit('update:visible', false)
}

const confirmSign = async () => {
  if (!props.document) return

  const result = await documentStore.verifyAndSign(token.value)
  if (result.success) {
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('signatures.dialog.signed'), life: 3000 })
    emit('signed')
    close()
  } else {
    toast.add({ severity: 'error', summary: t('common.error'), detail: result.message, life: 4000 })
  }
}

watch(() => props.visible, async (newVal) => {
  if (newVal && props.document) {
    token.value = ''
    sending.value = true
    const ok = await documentStore.sendSignCode(props.document.id)
    if (!ok) {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('signatures.dialog.send-error'), life: 4000 })
      close()
      return
    }
    sending.value = false
  } else {
    token.value = ''
    sending.value = false
  }
})
</script>