<!-- src/domains/signatures/presentation/pages/DocumentsPage.vue -->
<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-text-main flex items-center gap-2">
        <i class="pi pi-file"></i>
        {{ $t('signatures.page.title') }}
      </h1>
      <div class="flex gap-3">
        <Button
            @click="openExportDialog"
            label="Exportar Dossier"
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

    <!-- Diálogo de exportar dossier de calidad -->
    <pv-dialog
        v-model:visible="exportDialogVisible"
        header="Exportar Dossier de Calidad"
        :modal="true"
        :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <p class="text-sm text-neutral-border">
          Seleccione el rango de documentos firmados que desea incluir en el dossier de calidad en formato PDF.
        </p>

        <div class="grid grid-cols-2 gap-3">
          <div
              @click="exportRange = 'all'"
              :class="['p-4 border rounded-xl cursor-pointer transition-all flex flex-col gap-2', exportRange === 'all' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-neutral-border hover:bg-neutral-bg']"
          >
            <span class="font-bold text-sm text-text-main">Todo el historial</span>
            <span class="text-xs text-neutral-border">Incluye todas las firmas registradas hasta la fecha.</span>
          </div>
          <div
              @click="exportRange = 'dates'"
              :class="['p-4 border rounded-xl cursor-pointer transition-all flex flex-col gap-2', exportRange === 'dates' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-neutral-border hover:bg-neutral-bg']"
          >
            <span class="font-bold text-sm text-text-main">Rango de fechas</span>
            <span class="text-xs text-neutral-border">Filtra las firmas correspondientes a un período específico.</span>
          </div>
        </div>

        <div v-if="exportRange === 'dates'" class="flex flex-col gap-2 mt-2">
          <label class="text-xs font-semibold text-neutral-border">Período</label>
          <pv-datepicker
              v-model="exportDateRange"
              selectionMode="range"
              placeholder="Seleccione rango de fechas"
              dateFormat="dd/mm/yy"
              showIcon
              fluid
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" text @click="exportDialogVisible = false" />
          <Button label="Generar PDF" icon="pi pi-file-pdf" class="bg-accent! text-white border-none! hover:bg-primary!" @click="generateDossierPDF" />
        </div>
      </template>
    </pv-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDocumentStore } from '../../application/document.store.js'
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import SignatureDialog from '../components/SignatureDialog.vue'
import DocumentCreateDialog from '../components/DocumentCreateDialog.vue'

const documentStore = useDocumentStore()
const projectsStore = useProjectsStore()

const dialogVisible = ref(false)
const createDialogVisible = ref(false)
const selectedDocument = ref(null)

const exportDialogVisible = ref(false)
const exportRange = ref('all')
const exportDateRange = ref(null)

const allDocuments = computed(() => documentStore.documents$)
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
  console.log('Documento creado:', newDocument)
}

const openSignatureDialog = (doc) => {
  selectedDocument.value = doc
  const token = documentStore.generateToken(doc.id)
  console.log(`Token generado para ${doc.type}: ${token}`)
  dialogVisible.value = true
}

const onDocumentSigned = () => {
  documentStore.loadAllDocuments()
}

const openExportDialog = () => {
  exportRange.value = 'all'
  exportDateRange.value = null
  exportDialogVisible.value = true
}

const generateDossierPDF = () => {
  exportDialogVisible.value = false

  const currentProject = projectsStore.currentProject
  if (!currentProject) {
    alert("No hay ningún proyecto activo seleccionado.")
    return
  }

  let docs = signedDocuments.value
  if (exportRange.value === 'dates' && exportDateRange.value && exportDateRange.value[0] && exportDateRange.value[1]) {
    const [start, end] = exportDateRange.value
    docs = docs.filter(doc => {
      const signDates = doc.assignedTo.map(s => s.signedAt).filter(Boolean)
      if (signDates.length === 0) return false
      const docDate = new Date(signDates[0])
      return docDate >= start && docDate <= end
    })
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert("Por favor, permita las ventanas emergentes para exportar el PDF.")
    return
  }

  const projectTitle = currentProject.name
  const projectLocation = currentProject.location
  const projectDates = `${currentProject.startDate} / ${currentProject.endDate}`
  const projectProgress = `${currentProject.progress}%`

  const docRows = docs.map(doc => {
    const signersHtml = doc.assignedTo.map(s => `
      <div class="signer-row">
        <strong>${s.fullName}</strong> - ${s.signedAt ? new Date(s.signedAt).toLocaleString() : 'Pendiente'}
      </div>
    `).join('')

    return `
      <tr>
        <td>
          <div class="doc-title">${doc.type}</div>
          <div class="doc-id">ID: ${doc.id}</div>
        </td>
        <td>${signersHtml}</td>
        <td>
          <span class="token-code">${doc.digitalSignatureToken || '—'}</span>
        </td>
      </tr>
    `
  }).join('')

  const today = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Dossier de Calidad - ${projectTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          line-height: 1.5;
          background-color: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: #ef4444;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 20px;
        }
        .logo-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #ef4444;
        }
        .cert-badge {
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .title-block {
          margin-bottom: 30px;
        }
        h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 10px 0;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }
        .project-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 35px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
        }
        .meta-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }
        .meta-value {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }
        .summary-stats {
          margin-bottom: 30px;
          display: flex;
          gap: 20px;
        }
        .stat-card {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        .stat-val {
          font-size: 24px;
          font-weight: 800;
          color: #ef4444;
        }
        .stat-lbl {
          font-size: 12px;
          color: #64748b;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        th {
          background-color: #f1f5f9;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          color: #475569;
          text-align: left;
          padding: 12px 16px;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          vertical-align: top;
        }
        .doc-title {
          font-weight: 600;
          color: #0f172a;
        }
        .doc-id {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
        }
        .signer-row {
          margin-bottom: 6px;
          font-size: 12px;
        }
        .token-code {
          font-family: monospace;
          background-color: #f1f5f9;
          color: #0f172a;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 700;
          border: 1px solid #cbd5e1;
        }
        .footer-sig {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          page-break-inside: avoid;
        }
        .signature-seal {
          display: flex;
          align-items: center;
          gap: 15px;
          border: 2px dashed #10b981;
          padding: 15px 25px;
          border-radius: 8px;
          background: #f0fdf4;
          max-width: 380px;
        }
        .seal-icon {
          font-size: 32px;
          color: #10b981;
        }
        .seal-text h4 {
          margin: 0;
          color: #065f46;
          font-size: 14px;
          font-weight: 700;
        }
        .seal-text p {
          margin: 4px 0 0 0;
          color: #047857;
          font-size: 11px;
        }
        .report-date {
          font-size: 12px;
          color: #94a3b8;
          text-align: right;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
          @page {
            margin: 1.5cm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-area">
          <div class="logo-icon">K</div>
          <div class="logo-text">KIPU</div>
        </div>
        <div class="cert-badge">Dossier Oficial de Calidad</div>
      </div>

      <div class="title-block">
        <h1>Compendio de Certificaciones y Firmas Electrónicas</h1>
        <p class="subtitle">Historial oficial de aprobaciones de etapas constructivas</p>
      </div>

      <div class="project-card">
        <div class="meta-item">
          <span class="meta-label">Proyecto</span>
          <span class="meta-value">${projectTitle}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Ubicación</span>
          <span class="meta-value">${projectLocation}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Período del Proyecto</span>
          <span class="meta-value">${projectDates}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Progreso del Proyecto</span>
          <span class="meta-value">${projectProgress}</span>
        </div>
      </div>

      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-val">${docs.length}</div>
          <div class="stat-lbl">Documentos Firmados Incluidos</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${pendingDocuments.value.length}</div>
          <div class="stat-lbl">Aprobaciones Pendientes en Etapa</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Documento / ID</th>
            <th>Firmantes y Fechas</th>
            <th>Token Digital</th>
          </tr>
        </thead>
        <tbody>
          ${docRows || '<tr><td colspan="3" style="text-align: center; color: #94a3b8;">No hay documentos firmados en el rango seleccionado.</td></tr>'}
        </tbody>
      </table>

      <div class="footer-sig">
        <div class="signature-seal">
          <div class="seal-icon">✓</div>
          <div class="seal-text">
            <h4>CERTIFICADO DE AUTENTICIDAD</h4>
            <p>Este dossier ha sido emitido y firmado digitalmente de forma inalterable a través de la plataforma Kipu.</p>
          </div>
        </div>
        <div class="report-date">
          Generado el: ${today}<br>
          Kipu Quality Management System
        </div>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.print()
}

onMounted(() => {
  documentStore.loadAllDocuments()
  projectsStore.loadProjects()
})
</script>