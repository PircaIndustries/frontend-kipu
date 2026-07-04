// src/domains/signatures/application/document.store.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentApi } from '../infrastructure/document.api.js'
import { useTeamUserStore } from '../../team/application/team-user.store.js'
import i18n from '../../../locales/i18n.js'

export const useDocumentStore = defineStore('document', () => {

    // ========== STATE ==========
    const pendingDocs = ref([])
    const signedDocs = ref([])
    const currentToken = ref(null)
    const currentDocumentId = ref(null)

    // ========== GETTERS ==========
    const documents$ = computed(() => [...pendingDocs.value, ...signedDocs.value])
    const currentToken$ = computed(() => currentToken.value)

    // ========== ACTIONS ==========
    const loadAllDocuments = async () => {
        const currentProjectId = localStorage.getItem('currentProjectId')
        const storedUser = localStorage.getItem('currentUser')

        if (!currentProjectId || !storedUser) return

        const teamUserStore = useTeamUserStore()
        const currentUserData = JSON.parse(storedUser)

        // ¡LA CLAVE! Buscamos tu ID real de TeamUser usando tu correo
        const actualTeamUser = teamUserStore.allUsers.find(u => u.email === currentUserData.email)

        if (!actualTeamUser) {
            console.warn("Aún no se ha cargado el TeamUser actual. Ignorando fetch de documentos por ahora.")
            return;
        }

        const teamUserId = actualTeamUser.id

        try {
            const [pendingResponse, signedResponse] = await Promise.all([
                documentApi.getPendingDocuments(currentProjectId, teamUserId),
                documentApi.getSignedDocuments(currentProjectId, teamUserId)
            ])

            pendingDocs.value = pendingResponse
            signedDocs.value = signedResponse
        } catch (error) {
            console.error('Error loading documents segments:', error)
        }
    }

    const sendSignCode = async (documentId) => {
        const storedUser = localStorage.getItem('currentUser')
        if (!storedUser) return false

        const user = JSON.parse(storedUser)
        try {
            await documentApi.sendSignCode(documentId, user.email)
            currentDocumentId.value = documentId
            return true
        } catch (error) {
            console.error('Error sending sign code:', error)
            return false
        }
    }

    const verifyAndSign = async (code) => {
        const activeDocumentId = currentDocumentId.value
        if (!activeDocumentId) return { success: false, message: 'No active signature process' }

        const storedUser = localStorage.getItem('currentUser')
        if (!storedUser) return { success: false, message: 'Current user session not found' }

        const teamUserStore = useTeamUserStore()
        const currentUserData = JSON.parse(storedUser)

        const actualTeamUser = teamUserStore.allUsers.find(u => u.email === currentUserData.email)

        if (!actualTeamUser) {
            return { success: false, message: 'No estás registrado como usuario en este equipo.' }
        }

        const signRequest = {
            teamUserId: actualTeamUser.id,
            fullName: actualTeamUser.fullName,
            code,
            email: currentUserData.email
        }

        try {
            await documentApi.signDocument(activeDocumentId, signRequest)

            currentDocumentId.value = null

            await loadAllDocuments()
            return { success: true, message: 'Document signed successfully' }
        } catch (error) {
            console.error('Error signing document:', error)
            const errMsg = error.response?.data?.message || error.response?.data || 'Código incorrecto o expirado'
            return { success: false, message: errMsg }
        }
    }

    const cancelSignature = () => {
        currentDocumentId.value = null
    }

    const hasActiveSignature = () => currentDocumentId.value !== null
    const getPendingDocuments = () => pendingDocs.value
    const getSignedDocuments = () => signedDocs.value
    const getDocumentsByType = (type) => documents$.value.filter(doc => doc.type === type)

    const createDocument = async (data) => {
        const currentProjectId = localStorage.getItem('currentProjectId')

        const createResource = {
            type: data.type,
            deadline: data.deadLine.toISOString(),
            projectId: currentProjectId,
            participants: data.assignedTo.map(p => ({
                teamUserId: p.id,
                fullName: p.fullName
            }))
        }

        try {
            const savedDocument = await documentApi.postDocument(createResource)
            await loadAllDocuments()
            return savedDocument
        } catch (error) {
            console.error('Error creating document:', error)
            throw error
        }
    }

    return {
        pendingDocs, signedDocs, currentDocumentId, documents$,
        loadAllDocuments, sendSignCode, verifyAndSign, cancelSignature,
        hasActiveSignature, getPendingDocuments, getSignedDocuments, getDocumentsByType, createDocument
    }
})