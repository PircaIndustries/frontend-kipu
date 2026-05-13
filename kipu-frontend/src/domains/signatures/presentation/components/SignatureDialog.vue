<!-- src/domains/signatures/presentation/components/SignatureDialog.vue -->
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
import { useDocumentStore } from '../../application/document.store.js'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const props = defineProps({
  visible: Boolean,
  document: Object
})

const emit = defineEmits(['update:visible', 'signed'])

const documentStore = useDocumentStore()
const token = ref('')

const close = () => {
  token.value = ''
  emit('update:visible', false)
}

const confirmSign = async () => {
  if (!props.document) return

  const result = await documentStore.verifyAndSign(token.value)
  if (result.success) {
    emit('signed')
    close()
  } else {
    alert(result.message || 'Token incorrecto o documento no válido')
  }
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    token.value = ''
  }
})
</script>