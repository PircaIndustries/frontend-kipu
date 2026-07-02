import axios from 'axios'
import { DocumentAssembler } from './document.assembler.js'

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL_LOCAL || 'http://localhost:5230/api/v1'
const DOCUMENTS_ENDPOINT = '/documents'

const apiClient = axios.create({
    baseURL: API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch (e) {
            console.error('Error parsing currentUser from localStorage', e);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const documentApi = {
    /**
     * Consume el endpoint: GET /api/v1/documents/pending?projectId=...&teamUserId=...
     */
    async getPendingDocuments(projectId, teamUserId) {
        try {
            const url = `${DOCUMENTS_ENDPOINT}/pending?projectId=${projectId}&teamUserId=${teamUserId}`
            const response = await apiClient.get(url)
            return DocumentAssembler.toEntitiesFromResponse(response.data)
        } catch (error) {
            console.error('Error fetching pending documents:', error)
            throw error
        }
    },

    /**
     * Consume el endpoint: GET /api/v1/documents/signed?projectId=...&teamUserId=...
     */
    async getSignedDocuments(projectId, teamUserId) {
        try {
            const url = `${documentsUrl}/signed?projectId=${projectId}&teamUserId=${teamUserId}`
            const response = await axios.get(url)
            return DocumentAssembler.toEntitiesFromResponse(response.data)
        } catch (error) {
            console.error('Error fetching signed documents:', error)
            throw error
        }
    },

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
     * Manda el CreateDocumentResource DTO al backend
     */
    async postDocument(createResource) {
        try {
            const response = await axios.post(documentsUrl, createResource)
            return DocumentAssembler.toEntityFromResource(response.data)
        } catch (error) {
            console.error('Error creating document:', error)
            throw error
        }
    },

    /**
     * Command: Envía el SignDocumentRequest DTO al sub-endpoint /sign de tu C#
     */
    async signDocument(documentId, signRequest) {
        try {
            const response = await axios.post(`${documentsUrl}/${documentId}/sign`, signRequest)
            return DocumentAssembler.toEntityFromResource(response.data)
        } catch (error) {
            console.error(`Error executing sign command for document ${documentId}:`, error)
            throw error
        }
    },

    async deleteDocument(id) {
        try {
            await axios.delete(`${documentsUrl}/${id}`)
        } catch (error) {
            console.error(`Error deleting document ${id}:`, error)
            throw error
        }
    }
}