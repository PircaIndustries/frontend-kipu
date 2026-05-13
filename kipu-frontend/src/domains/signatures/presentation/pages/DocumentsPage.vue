<!-- src/domains/signatures/presentation/pages/DocumentsPage.vue -->
<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-text-main flex items-center gap-2">
        <i class="pi pi-file"></i>
        {{ $t('signatures.page.title') }}
      </h1>
      <Button
          @click="openCreateDialog"
          :label="$t('signatures.page.btn-create')"
          icon="pi pi-plus"
          class="bg-accent! text-white border-none! hover:bg-primary!"
      />
    </div>

    <div class="flex gap-6">
      <!-- Columna principal -->
      <div class="flex-1 flex flex-col gap-6">
        <!-- Documentos pendientes -->
        <Card>
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-clock text-warning"></i>
                <span class="text-text-main">{{ $t('signatures.page.pending-title') }}</span>
              </div>

            </div>
          </template>
          <template #content>
            <div class="max-h-80 overflow-y-auto">
              <div
                  v-for="doc in pendingDocuments"
                  :key="doc.id"
                  class="border-b border-neutral-border p-4 hover:bg-neutral-bg transition-colors"
              >
                <div class="flex justify-between items-center">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1">
                      <i class="pi pi-file text-neutral-border"></i>
                      <span class="font-medium text-text-main">{{ doc.type }}</span>
                      <span class="text-xs text-neutral-border">ID: {{ doc.id }}</span>
                    </div>
                    <div class="text-sm text-neutral-border flex items-center gap-2 mb-1">
                      <i class="pi pi-calendar"></i>
                      {{ $t('signatures.page.deadline') }}: {{ formatDate(doc.deadLine) }}
                    </div>
                    <div class="text-xs text-neutral-border flex items-center gap-1">
                      <i class="pi pi-users"></i>
                      {{ $t('signatures.page.signers') }}: {{ getSignersNames(doc) }}
                    </div>
                  </div>
                  <Button
                      @click="openSignatureDialog(doc)"
                      :label="$t('signatures.page.btn-sign')"
                      icon="pi pi-pen-to-square"
                      class="bg-accent! text-white border-none! hover:bg-primary!"
                  />
                </div>
              </div>
              <div v-if="pendingDocuments.length === 0" class="text-center py-8 text-neutral-border">
                <i class="pi pi-check-circle text-2xl mb-2 block"></i>
                {{ $t('signatures.page.empty-pending') }}
              </div>
            </div>
          </template>
        </Card>

        <!-- Documentos firmados -->
        <Card>
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="pi pi-check-circle text-success"></i>
                <span class="text-text-main">{{ $t('signatures.page.signed-title') }}</span>
              </div>

            </div>
          </template>
          <template #content>
            <div class="max-h-64 overflow-y-auto">
              <div
                  v-for="doc in signedDocuments"
                  :key="doc.id"
                  class="border-b border-neutral-border p-3 hover:bg-neutral-bg transition-colors"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <i class="pi pi-verified text-success"></i>
                      <span class="font-medium text-text-main">{{ doc.type }}</span>
                      <span class="text-xs text-neutral-border ml-2">ID: {{ doc.id }}</span>
                    </div>
                    <div class="text-xs text-neutral-border flex items-center gap-1">
                      <i class="pi pi-users"></i>
                      {{ getSignersNames(doc) }}
                    </div>
                  </div>
                  <span class="text-xs text-neutral-border flex items-center gap-1">
                    <i class="pi pi-key"></i>
                    {{ doc.digitalSignatureToken || '—' }}
                  </span>
                </div>
              </div>
              <div v-if="signedDocuments.length === 0" class="text-center py-8 text-neutral-border">
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
              <i class="pi pi-chart-line text-primary"></i>
              <span class="text-text-main">{{ $t('signatures.page.summary-title') }}</span>
            </div>
          </template>
          <template #content>
            <div class="space-y-2">
              <div class="flex justify-between items-center py-2 border-b border-neutral-border">
                <span class="flex items-center gap-1 text-neutral-border">
                  <i class="pi pi-clock text-warning"></i>
                  {{ $t('signatures.page.summary-pending') }}
                </span>
                <span class="text-2xl font-bold text-warning">{{ pendingDocuments.length }}</span>
              </div>
              <div class="flex justify-between items-center pt-2">
                <span class="flex items-center gap-1 text-neutral-border">
                  <i class="pi pi-check-circle text-success"></i>
                  {{ $t('signatures.page.summary-signed') }}
                </span>
                <span class="text-2xl font-bold text-success">{{ signedDocuments.length }}</span>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-shield text-accent"></i>
              <span class="text-text-main">{{ $t('signatures.page.security-title') }}</span>
            </div>
          </template>
          <template #content>
            <p class="text-sm text-neutral-border leading-relaxed">
              {{ $t('signatures.page.security-description') }}
            </p>
          </template>
        </Card>

        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-question-circle text-accent"></i>
              <span class="text-text-main">{{ $t('signatures.page.howto-title') }}</span>
            </div>
          </template>
          <template #content>
            <ol class="space-y-2 text-sm text-neutral-border list-decimal list-inside">
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
    <SignatureDialog
        v-model:visible="dialogVisible"
        :document="selectedDocument"
        @signed="onDocumentSigned"
    />

    <!-- Diálogo de creación -->
    <DocumentCreateDialog
        v-model:visible="createDialogVisible"
        @created="onDocumentCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDocumentStore } from '../../application/document.store.js'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import SignatureDialog from '../components/SignatureDialog.vue'
import DocumentCreateDialog from '../components/DocumentCreateDialog.vue'

const documentStore = useDocumentStore()

const dialogVisible = ref(false)
const createDialogVisible = ref(false)
const selectedDocument = ref(null)

const allDocuments = computed(() => documentStore.documents$())
const pendingDocuments = computed(() => documentStore.getPendingDocuments())
const signedDocuments = computed(() => documentStore.getSignedDocuments())

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

const onDocumentCreated = (newDocument) => {
  // ✅ No recargar, el documento ya está en el store
  console.log('Documento creado:', newDocument)
  // documentStore.loadAllDocuments()  // ❌ No llamar esto
}

const openSignatureDialog = (doc) => {
  selectedDocument.value = doc
  const token = documentStore.generateToken(doc.id)  // <-- Esto es lo que faltaba
  console.log(`Token generado para ${doc.type}: ${token}`)
  dialogVisible.value = true
}

const onDocumentSigned = () => {
  documentStore.loadAllDocuments()
}

onMounted(() => {
  documentStore.loadAllDocuments()
})
</script>