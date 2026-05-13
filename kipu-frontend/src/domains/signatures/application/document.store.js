// src/domains/signatures/application/document.store.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentApi } from '../infrastructure/document.api.js'
import { DocumentEntity } from '../domain/model/document.entity.js'

export const useDocumentStore = defineStore('document', () => {
    // ========== STATE ==========
    const documents = ref([])
    const currentToken = ref(null)
    const currentDocumentId = ref(null)

    // ========== GETTERS ==========
    const documents$ = computed(() => documents.value)
    const currentToken$ = computed(() => currentToken.value)

    // ========== ACTIONS ==========
    const loadAllDocuments = async () => {
        try {
            const response = await documentApi.getAllDocuments()
            documents.value = response
            console.log(`Loaded ${documents.value.length} documents`)
        } catch (error) {
            console.error('Error loading documents:', error)
        }
    }

    const addLocalDocument = (document) => {
        documents.value.push(document)
        console.log('Document added locally:', document)
    }

    const updateLocalDocument = (updatedDocument) => {
        const index = documents.value.findIndex(d => d.id === updatedDocument.id)
        if (index !== -1) {
            documents.value[index] = updatedDocument
            console.log('Document updated locally:', updatedDocument)
        }
    }

    const generateToken = (documentId) => {
        const token = "123456"
        console.log('[STORE] generateToken called with documentId:', documentId)
        console.log('[STORE] Before setting - currentToken:', currentToken.value)
        currentToken.value = token
        currentDocumentId.value = documentId
        console.log('[STORE] After setting - currentToken:', currentToken.value)
        console.log('[STORE] After setting - currentDocumentId:', currentDocumentId.value)
        return token
    }

    const verifyAndSign = async (token) => {
        const activeToken = currentToken.value
        const activeDocumentId = currentDocumentId.value

        console.log('Verifying token:', token)
        console.log('Active token:', currentToken.value)
        console.log('Active document ID:', currentDocumentId.value)

        if (!activeToken || !activeDocumentId) {
            return { success: false, message: 'No active signature process' }
        }

        if (token !== activeToken) {
            return { success: false, message: 'Incorrect token' }
        }

        const documentToUpdate = documents.value.find(d => d.id === activeDocumentId)

        if (!documentToUpdate) {
            return { success: false, message: 'Document not found' }
        }

        if (documentToUpdate.isSigned) {
            return { success: false, message: 'Document already signed' }
        }

        const updatedDocument = {
            ...documentToUpdate,
            isSigned: true,
            digitalSignatureToken: token
        }

        currentToken.value = null
        currentDocumentId.value = null

        try {
            const response = await documentApi.updateDocument(updatedDocument)
            const index = documents.value.findIndex(d => d.id === response.id)
            if (index !== -1) {
                documents.value[index] = response
            }
            return { success: true, message: 'Document signed successfully' }
        } catch (error) {
            console.error('Error signing document:', error)
            return { success: false, message: error.message || 'Error saving signature' }
        }
    }

    const cancelSignature = () => {
        currentToken.value = null
        currentDocumentId.value = null
        console.log('Signature process cancelled')
    }

    const hasActiveSignature = () => {
        return currentToken.value !== null && currentDocumentId.value !== null
    }

    const getPendingDocuments = () => {
        return documents.value.filter(doc => !doc.isSigned)
    }

    const getSignedDocuments = () => {
        return documents.value.filter(doc => doc.isSigned)
    }

    const getDocumentsByType = (type) => {
        return documents.value.filter(doc => doc.type === type)
    }

    const createDocument = async (data) => {
        const newDocument = new DocumentEntity()
        newDocument.id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        newDocument.type = data.type
        newDocument.deadLine = data.deadLine
        newDocument.isSigned = false
        newDocument.digitalSignatureToken = null
        newDocument.assignedTo = data.assignedTo

        documents.value.push(newDocument)

        try {
            const savedDocument = await documentApi.postDocument(newDocument)
            const index = documents.value.findIndex(d => d.id === newDocument.id)
            if (index !== -1) {
                documents.value[index] = savedDocument
            }
            console.log('Document created and saved:', savedDocument)
            return savedDocument
        } catch (error) {
            const index = documents.value.findIndex(d => d.id === newDocument.id)
            if (index !== -1) {
                documents.value.splice(index, 1)
            }
            console.error('Error creating document:', error)
            throw error
        }
    }

    return {
        // State
        documents,
        currentToken,
        currentDocumentId,
        // Getters
        documents$,
        currentToken$,
        // Actions
        loadAllDocuments,
        addLocalDocument,
        updateLocalDocument,
        generateToken,
        verifyAndSign,
        cancelSignature,
        hasActiveSignature,
        getPendingDocuments,
        getSignedDocuments,
        getDocumentsByType,
        createDocument
    }
})