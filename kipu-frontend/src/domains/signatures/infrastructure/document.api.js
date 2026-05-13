// src/domains/signatures/infrastructure/document.api.js
import axios from 'axios'
import { DocumentAssembler } from './document.assembler.js'

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:3000/api/v1'
const DOCUMENTS_ENDPOINT = import.meta.env.VITE_API_KIPU_DOCUMENTS_ENDPOINT || '/documents'

const documentsUrl = `${API_BASE_URL}${DOCUMENTS_ENDPOINT}`

/**
 * Infrastructure gateway for Document bounded-context endpoints.
 */
export const documentApi = {
    /**
     * @returns {Promise<DocumentEntity[]>} Promise resolving to document entities
     */
    async getAllDocuments() {
        try {
            const response = await axios.get(documentsUrl)
            return DocumentAssembler.toEntitiesFromResponse(response.data)
        } catch (error) {
            console.error('Error fetching documents:', error)
            throw error
        }
    },

    /**
     * @param {string} projectId - Project identifier
     * @returns {Promise<DocumentEntity[]>} Promise resolving to document entities
     */
    async getDocumentsByProject(projectId) {
        try {
            const url = `${documentsUrl}?projectId=${projectId}`
            const response = await axios.get(url)
            return DocumentAssembler.toEntitiesFromResponse(response.data)
        } catch (error) {
            console.error('Error fetching documents by project:', error)
            throw error
        }
    },

    /**
     * @param {string} id - Document identifier
     * @returns {Promise<DocumentEntity>} Promise resolving to document entity
     */
    async getDocumentById(id) {
        try {
            const response = await axios.get(`${documentsUrl}/${id}`)
            return DocumentAssembler.toEntityFromResource(response.data)
        } catch (error) {
            console.error(`Error fetching document ${id}:`, error)
            throw error
        }
    },

    /**
     * @param {DocumentEntity} document - Document entity to create
     * @returns {Promise<DocumentEntity>} Promise resolving to created document
     */
    async postDocument(document) {
        try {
            const resource = DocumentAssembler.toResourceFromEntity(document)
            const response = await axios.post(documentsUrl, resource)
            return DocumentAssembler.toEntityFromResource(response.data)
        } catch (error) {
            console.error('Error creating document:', error)
            throw error
        }
    },

    /**
     * @param {DocumentEntity} document - Document entity to update
     * @returns {Promise<DocumentEntity>} Promise resolving to updated document
     */
    async updateDocument(document) {
        try {
            const response = await axios.put(`${documentsUrl}/${document.id}`, document)
            console.log('Document updated in API:', response.data)
            return DocumentAssembler.toEntityFromResource(response.data)
        } catch (error) {
            console.error('Error updating document:', error)
            throw error
        }
    },

    /**
     * @param {string} id - Document identifier
     * @returns {Promise<void>} Promise resolving when deleted
     */
    async deleteDocument(id) {
        try {
            await axios.delete(`${documentsUrl}/${id}`)
        } catch (error) {
            console.error(`Error deleting document ${id}:`, error)
            throw error
        }
    }
}