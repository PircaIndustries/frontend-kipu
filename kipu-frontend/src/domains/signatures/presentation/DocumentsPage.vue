<!-- presentation/pages/DocumentsPage.vue -->
<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <i class="pi pi-file"></i>
        {{ $t('signatures.page.title') }}
      </h1>
      <Button
          @click="openCreateDialog"
          label="Crear Documento"
          icon="pi pi-plus"
          class="bg-pink-500 text-white border-none hover:bg-pink-600"
      />
    </div>

    <div class="flex gap-6">
      <!-- Columna principal -->
      <div class="flex-1 flex flex-col gap-6">
        <!-- Documentos pendientes -->
        <Card class="w-full">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-clock text-yellow-500"></i>
                <span>{{ $t('signatures.page.pending-title') }}</span>
              </div>
              <Badge :value="pendingDocuments.length" severity="warning" />
            </div>
          </template>
          <template #content>
            <div class="max-h-80 overflow-y-auto">
              <div
                  v-for="doc in pendingDocuments"
                  :key="doc.id"
                  class="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-center">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1">
                      <i class="pi pi-file text-gray-500"></i>
                      <span class="font-medium">{{ doc.type }}</span>
                      <span class="text-xs text-gray-500">ID: {{ doc.id }}</span>
                    </div>
                    <div class="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <i class="pi pi-calendar"></i>
                      {{ $t('signatures.page.deadline') }}: {{ formatDate(doc.deadLine) }}
                    </div>
                    <div class="text-xs text-gray-400 flex items-center gap-1">
                      <i class="pi pi-users"></i>
                      {{ $t('signatures.page.signers') }}: {{ getSignersNames(doc) }}
                    </div>
                  </div>
                  <Button
                      @click="openSignatureDialog(doc)"
                      :label="$t('signatures.page.btn-sign')"
                      icon="pi pi-pen-to-square"
                      class="bg-pink-500 text-white border-none hover:bg-pink-600"
                  />
                </div>
              </div>
              <div v-if="pendingDocuments.length === 0" class="text-center py-8 text-gray-500">
                <i class="pi pi-check-circle text-2xl mb-2 block"></i>
                {{ $t('signatures.page.empty-pending') }}
              </div>
            </div>
          </template>
        </Card>

        <!-- Documentos firmados -->
        <Card class="w-full">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-check-circle text-green-500"></i>
                <span>{{ $t('signatures.page.signed-title') }}</span>
              </div>
              <Badge :value="signedDocuments.length" severity="success" />
            </div>
          </template>
          <template #content>
            <div class="max-h-64 overflow-y-auto">
              <div
                  v-for="doc in signedDocuments"
                  :key="doc.id"
                  class="border-b border-gray-100 p-3 hover:bg-gray-50 transition-colors"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <i class="pi pi-verified text-green-600"></i>
                      <span class="font-medium">{{ doc.type }}</span>
                      <span class="text-xs text-gray-500 ml-2">ID: {{ doc.id }}</span>
                    </div>
                    <div class="text-xs text-gray-400 flex items-center gap-1">
                      <i class="pi pi-users"></i>
                      {{ getSignersNames(doc) }}
                    </div>
                  </div>
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <i class="pi pi-key"></i>
                    {{ doc.digitalSignatureToken || '—' }}
                  </span>
                </div>
              </div>
              <div v-if="signedDocuments.length === 0" class="text-center py-8 text-gray-500">
                <i class="pi pi-folder-open text-2xl mb-2 block"></i>
                {{ $t('signatures.page.empty-signed') }}
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="w-80 flex flex-col gap-4">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-chart-line"></i>
              <span>{{ $t('signatures.page.summary-title') }}</span>
            </div>
          </template>
          <template #content>
            <div class="space-y-2">
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="flex items-center gap-1">
                  <i class="pi pi-clock text-yellow-500"></i>
                  {{ $t('signatures.page.summary-pending') }}
                </span>
                <span class="text-2xl font-bold text-yellow-600">{{ pendingDocuments.length }}</span>
              </div>
              <div class="flex justify-between items-center pt-2">
                <span class="flex items-center gap-1">
                  <i class="pi pi-check-circle text-green-500"></i>
                  {{ $t('signatures.page.summary-signed') }}
                </span>
                <span class="text-2xl font-bold text-green-600">{{ signedDocuments.length }}</span>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-shield text-blue-600"></i>
              <span>{{ $t('signatures.page.security-title') }}</span>
            </div>
          </template>
          <template #content>
            <p class="text-sm text-gray-600 leading-relaxed">
              {{ $t('signatures.page.security-description') }}
            </p>
          </template>
        </Card>

        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-question-circle text-blue-600"></i>
              <span>{{ $t('signatures.page.howto-title') }}</span>
            </div>
          </template>
          <template #content>
            <ol class="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>{{ $t('signatures.page.howto-step1') }}</li>
              <li>{{ $t('signatures.page.howto-step2') }}</li>
              <li>{{ $t('signatures.page.howto-step3') }}</li>
              <li>{{ $t('signatures.page.howto-step4') }}</li>
            </ol>
          </template>
        </Card>
      </div>
    </div>

    <!-- Diálogo de firma -->
    <Dialog
        v-model:visible="dialogVisible"
        :header="$t('signatures.dialog.title')"
        :modal="true"
        :closable="false"
        class="w-96"
    >
      <div class="flex flex-col gap-4">
        <p>{{ $t('signatures.dialog.description') }}</p>
        <div class="bg-blue-50 p-3 rounded-lg">
          <p class="text-sm text-blue-800">{{ $t('signatures.dialog.token-sent') }}</p>
        </div>
        <InputText
            v-model="token"
            type="text"
            maxlength="6"
            placeholder="000000"
            class="w-full"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeDialog" :label="$t('signatures.dialog.btn-cancel')" text />
          <Button
              @click="confirmSign"
              :label="$t('signatures.dialog.btn-confirm')"
              :disabled="token.length !== 6"
              class="bg-pink-500 text-white border-none"
          />
        </div>
      </template>
    </Dialog>

    <DocumentCreateDialog
        v-model:visible="createDialogVisible"
        @created="onDocumentCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DocumentCreateDialog from './DocumentCreateDialog.vue'

const documentStore = useDocumentStore()

const dialogVisible = ref(false)
const createDialogVisible = ref(false)
const selectedDocument = ref(null)
const token = ref('')

const allDocuments = computed(() => documentStore.documents)
const pendingDocuments = computed(() => documentStore.getPendingDocuments())
const signedDocuments = computed(() => allDocuments.value.filter(doc => doc.isSigned))

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}

const getSignersNames = (doc) => {
  if (!doc.assignedTo || doc.assignedTo.length === 0) return 'Sin firmantes asignados'
  return doc.assignedTo.map(signer => signer.fullName).join(', ')
}

const openCreateDialog = () => {
  createDialogVisible.value = true
}

const onDocumentCreated = () => {
  documentStore.fetchDocuments()
}

const openSignatureDialog = (doc) => {
  selectedDocument.value = doc
  const generatedToken = documentStore.generateToken(doc.id)
  console.log(`Token generado para ${doc.type}: ${generatedToken}`)
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  token.value = ''
  selectedDocument.value = null
  documentStore.cancelSignature()
}

const confirmSign = async () => {
  if (!selectedDocument.value) return

  const success = await documentStore.signDocument(selectedDocument.value.id, token.value)
  if (success) {
    await documentStore.fetchDocuments()
    closeDialog()
  } else {
    alert('Token incorrecto o documento no válido')
  }
}

onMounted(() => {
  documentStore.fetchDocuments()
})
</script>