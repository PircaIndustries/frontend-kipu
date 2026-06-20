<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-text-main flex items-center gap-2">
        <i class="pi pi-file"></i>
        {{ $t('signatures.page.title') }}
      </h1>
      <div class="flex gap-3">
        <Button
            @click="exportDialogVisible = true"
            :label="$t('signatures.page.export_btn')"
            icon="pi pi-download"
            class="bg-primary! text-white border-none! hover:bg-primary-hover!"
        />
        <Button
            @click="openCreateDialog"
            :label="$t('signatures.page.btn-create')"
            icon="pi pi-plus"
            class="bg-accent! text-white border-none! hover:bg-primary!"
        />
      </div>
    </div>

    <div class="flex gap-6">
      <div class="flex-1 flex flex-col gap-6">
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
      </div>
    </div>

    <SignatureDialog v-model:visible="dialogVisible" :document="selectedDocument" @signed="onDocumentSigned" />
    <DocumentCreateDialog v-model:visible="createDialogVisible" @created="onDocumentCreated" />

    <!-- Export Quality Dossier Dialog -->
    <pv-dialog v-model:visible="exportDialogVisible" :header="$t('signatures.page.export_modal_title')" :modal="true" :style="{ width: '450px' }">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-neutral-border">Seleccione el rango de documentos firmados que desea incluir.</p>
        <div class="grid grid-cols-2 gap-3">
          <div @click="exportRange = 'all'" :class="['p-4 border rounded-xl cursor-pointer', exportRange === 'all' ? 'border-accent bg-accent/5' : 'border-neutral-border']">
            <span class="font-bold text-sm block">Todo el historial</span>
          </div>
          <div @click="exportRange = 'dates'" :class="['p-4 border rounded-xl cursor-pointer', exportRange === 'dates' ? 'border-accent bg-accent/5' : 'border-neutral-border']">
            <span class="font-bold text-sm block">Rango de fechas</span>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="exportDialogVisible = false" />
        <Button label="Generar PDF" icon="pi pi-file-pdf" class="bg-accent! text-white" @click="generateDossierPDF" />
      </template>
    </pv-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDocumentStore } from '../../application/document.store.js'
import { useTeamUserStore } from '../../../team/application/team-user.store.js'
import Button from 'primevue/button'
import Card from 'primevue/card'
import SignatureDialog from '../components/SignatureDialog.vue'
import DocumentCreateDialog from '../components/DocumentCreateDialog.vue'

const documentStore = useDocumentStore()
const teamUserStore = useTeamUserStore()

const dialogVisible = ref(false)
const createDialogVisible = ref(false)
const selectedDocument = ref(null)
const exportDialogVisible = ref(false)
const exportRange = ref('all')

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

const onDocumentCreated = async () => {
  await documentStore.loadAllDocuments()
}

const openSignatureDialog = (doc) => {
  selectedDocument.value = doc
  documentStore.generateToken(doc.id)
  dialogVisible.value = true
}

const onDocumentSigned = async () => {
  await documentStore.loadAllDocuments()
}

const openExportDialog = () => {
  exportRange.value = 'all'
  exportDialogVisible.value = true
}

const generateDossierPDF = () => {
  exportDialogVisible.value = false
  console.log("Generando PDF Dossier...")
}

onMounted(async () => {
  teamUserStore.loadCurrentUser()
  const currentProjectId = localStorage.getItem('currentProjectId')

  // 1. OBLIGATORIO: Esperar a que el equipo se cargue por completo primero
  await teamUserStore.fetchUsers()

  if (teamUserStore.currentUser) {
    const userExists = teamUserStore.teamUsers.some(
        u => u.email === teamUserStore.currentUser.email && String(u.projectId) === String(currentProjectId)
    )

    if (!userExists) {
      console.log("[DOCUMENTS ON MOUNTED] Auto-registering Pepe in TeamUsers...")
      const parts = teamUserStore.currentUser.fullName.split(' ')
      await teamUserStore.inviteUser({
        firstName: parts[0] || 'Pepe',
        lastName: parts.slice(1).join(' ') || 'Kipu',
        email: teamUserStore.currentUser.email,
        role: teamUserStore.currentUser.role || 'Gestor Operativo'
      })
      // Volvemos a traer el equipo para obtener tu nuevo ID
      await teamUserStore.fetchUsers()
    }
  }

  // 2. AHORA SÍ cargamos los documentos, porque ya sabemos con exactitud cuál es tu TeamUser ID
  await documentStore.loadAllDocuments()
})
</script>