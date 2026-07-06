import axios from 'axios'
import { DocumentAssembler } from './document.assembler.js'

const API_BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:5230/api/v1'
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

    async getSignedDocuments(projectId, teamUserId) {
        try {
            const url = `${DOCUMENTS_ENDPOINT}/signed?projectId=${projectId}&teamUserId=${teamUserId}`
            const response = await apiClient.get(url)
            return DocumentAssembler.toEntitiesFromResponse(response.data)
        } catch (error) {
            console.error('Error fetching signed documents:', error)
            throw error
        }
    },

    async getDocumentById(id) {
        try {
            const response = await apiClient.get(`${DOCUMENTS_ENDPOINT}/${id}`)
            return DocumentAssembler.toEntityFromResource(response.data)
        } catch (error) {
            console.error(`Error fetching document ${id}:`, error)
            throw error
        }
    },

    async postDocument(createResource) {
        try {
            const response = await apiClient.post(DOCUMENTS_ENDPOINT, createResource)
            return DocumentAssembler.toEntityFromResource(response.data)
        } catch (error) {
            console.error('Error creating document:', error)
            throw error
        }
    },

    async sendSignCode(documentId, email) {
        try {
            const response = await apiClient.post(`${DOCUMENTS_ENDPOINT}/${documentId}/send-code`, { email })
            return response.data
        } catch (error) {
            console.error('Error sending sign code:', error)
            throw error
        }
    },

    async signDocument(documentId, signRequest) {
        try {
            const response = await apiClient.post(`${DOCUMENTS_ENDPOINT}/${documentId}/sign`, signRequest)
            return DocumentAssembler.toEntityFromResource(response.data)
        } catch (error) {
            console.error(`Error executing sign command for document ${documentId}:`, error)
            throw error
        }
    }
}
