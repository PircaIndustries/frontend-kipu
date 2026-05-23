// application/document.store.js

/**
 * Application service store for the Document bounded context.
 * It coordinates document use cases and keeps UI-facing state.
 *
 * @module useDocumentStore
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {DocumentApi} from "../infrastructure/document-api.js";
import { DocumentAssembler } from "../infrastructure/document.assembler.js";
import { DocumentEntity } from "../domain/model/document.entity.js";

const documentApi = new DocumentApi();

/**
 * Reactive store that exposes Document commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useDocumentStore = defineStore('document', () => {
    /**
     * List of document entities.
     * @type {import('vue').Ref<DocumentEntity[]>}
     */
    const documents = ref([]);

    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /**
     * Whether documents have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const documentsLoaded = ref(false);

    /**
     * Number of loaded documents.
     * @type {import('vue').ComputedRef<number>}
     */
    const documentsCount = computed(() => {
        return documentsLoaded.value ? documents.value.length : 0;
    });

    /**
     * Number of signed documents.
     * @type {import('vue').ComputedRef<number>}
     */
    const signedDocumentsCount = computed(() => {
        return documents.value.filter(doc => doc.isSigned).length;
    });

    /**
     * Number of pending documents (not signed and not expired).
     * @type {import('vue').ComputedRef<number>}
     */
    const pendingDocumentsCount = computed(() => {
        return documents.value.filter(doc => doc.canBeSigned()).length;
    });

    /**
     * Loads documents from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchDocuments() {
        documentApi.getDocuments()
            .then(response => {
                documents.value = DocumentAssembler.toEntitiesFromResponse(response);
                documentsLoaded.value = true;
                console.log(`Loaded ${documents.value.length} documents`);
            })
            .catch(error => {
                console.error('Error fetching documents:', error);
                errors.value.push(error);
            });
    }

    /**
     * Finds a document entity by identifier.
     * @param {number|string} id - Document identifier.
     * @returns {Document|undefined} Matching document, if available.
     */
    function getDocumentById(id) {
        let idNum = parseInt(id);
        return documents.value.find(document => document.id === idNum);
    }

    /**
     * Creates a document through infrastructure and appends it to local state.
     * @param {DocumentEntity} document - Document entity to persist.
     * @returns {void}
     */
    function addDocument(document) {
        const resource = DocumentAssembler.toResourceFromEntity(document);

        documentApi.createDocument(resource)
            .then(response => {
                const newDocument = DocumentAssembler.toEntityFromResource(response.data);
                documents.value.push(newDocument);
                console.log(`Document created: ${newDocument.type} (ID: ${newDocument.id})`);
            })
            .catch(error => {
                console.error('Error creating document:', error);
                errors.value.push(error);
            });
    }

    /**
     * Updates an existing document and synchronizes local state.
     * @param {DocumentEntity} document - Document entity with updated application.
     * @returns {void}
     */
    function updateDocument(document) {
        const resource = DocumentAssembler.toResourceFromEntity(document);

        documentApi.updateDocument(resource)
            .then(response => {
                const updatedDocument = DocumentAssembler.toEntityFromResource(response.data);
                const index = documents.value.findIndex(d => d.id === updatedDocument.id);
                if (index !== -1) {
                    documents.value[index] = updatedDocument;
                    console.log(`Document updated: ${updatedDocument.type} (ID: ${updatedDocument.id})`);
                }
            })
            .catch(error => {
                console.error('Error updating document:', error);
                errors.value.push(error);
            });
    }

    /**
     * Deletes a document and removes it from local state.
     * @param {Document} document - Document entity to remove.
     * @returns {void}
     */
    function deleteDocument(document) {
        documentApi.deleteDocument(document.id)
            .then(() => {
                const index = documents.value.findIndex(d => d.id === document.id);
                if (index !== -1) {
                    documents.value.splice(index, 1);
                    console.log(`Document deleted: ${document.type} (ID: ${document.id})`);
                }
            })
            .catch(error => {
                console.error('Error deleting document:', error);
                errors.value.push(error);
            });
    }

    /**
     * Generates a random digital signature token for a document.
     * @param {number|string} documentId - Document ID to sign.
     * @returns {string|null} Generated token or null if document not found.
     */
    function generateDigitalSignatureToken(documentId) {
        const document = getDocumentById(documentId);

        if (!document) {
            console.error(`Document with ID ${documentId} not found`);
            errors.value.push(new Error(`Document with ID ${documentId} not found`));
            return null;
        }

        if (document.isSigned) {
            console.warn(`⚠Document ${documentId} is already signed`);
            errors.value.push(new Error('Document is already signed'));
            return null;
        }

        if (document.isExpired()) {
            console.warn(`⚠Document ${documentId} has expired`);
            errors.value.push(new Error('Document deadline has expired'));
            return null;
        }

        // Generate random token (32 characters alphanumeric)
        const token = generateRandomToken();

        // Update document with new token
        document.digitalSignatureToken = token;

        // Persist changes
        updateDocument(document);

        console.log(`Digital signature token generated for document ${documentId}: ${token}`);
        return token;
    }

    /**
     * Generates a random alphanumeric token.
     * @param {number} length - Token length (default: 32).
     * @returns {string} Random token.
     */
    function generateRandomToken(length = 32) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            token += characters[randomIndex];
        }

        return token;
    }

    /**
     * Signs a document using the digital signature token.
     * @param {number|string} documentId - Document ID to sign.
     * @param {string} token - Digital signature token for verification.
     * @returns {boolean} True if signed successfully, false otherwise.
     */
    function signDocument(documentId, token) {
        const document = getDocumentById(documentId);

        if (!document) {
            console.error(`Document with ID ${documentId} not found`);
            errors.value.push(new Error(`Document with ID ${documentId} not found`));
            return false;
        }

        if (!document.canBeSigned()) {
            console.warn(`⚠Document ${documentId} cannot be signed (signed or expired)`);
            errors.value.push(new Error('Document cannot be signed'));
            return false;
        }

        if (document.digitalSignatureToken !== token) {
            console.error(`Invalid signature token for document ${documentId}`);
            errors.value.push(new Error('Invalid digital signature token'));
            return false;
        }

        // Sign the document
        document.isSigned = true;
        document.digitalSignatureToken = null; // Clear token after signing

        // Persist changes
        updateDocument(document);

        console.log(`Document ${documentId} signed successfully!`);
        return true;
    }

    /**
     * Gets all documents that are pending signature (not signed and not expired).
     * @returns {DocumentEntity[]} Pending documents.
     */
    function getPendingDocuments() {
        return documents.value.filter(doc => doc.canBeSigned());
    }

    /**
     * Gets all expired documents.
     * @returns {DocumentEntity[]} Expired documents.
     */
    function getExpiredDocuments() {
        return documents.value.filter(doc => doc.isExpired() && !doc.isSigned);
    }

    return {
        // State
        documents,
        errors,
        documentsLoaded,

        // Computed
        documentsCount,
        signedDocumentsCount,
        pendingDocumentsCount,

        // CRUD Operations
        fetchDocuments,
        getDocumentById,
        addDocument,
        updateDocument,
        deleteDocument,

        // Signature Operations
        generateDigitalSignatureToken,
        signDocument,
        getPendingDocuments,
        getExpiredDocuments
    };
});

export default useDocumentStore;