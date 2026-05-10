// infrastructure/document-api.js

import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";
import {BaseApi} from "../../../shared/infrastructure/base-api.js";

const documentsEndpointPath = import.meta.env.DOCUMENTS_ENDPOINT;

/**
 * Infrastructure gateway for Document bounded-context endpoints.
 *
 * @class DocumentApi
 * @extends BaseApi
 */
export class DocumentApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #documentsEndpoint;

    /** Creates endpoint client for documents. */
    constructor() {
        super();
        this.#documentsEndpoint = new BaseEndpoint(this, documentsEndpointPath);
    }

    /**
     * Fetches all documents.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the documents' response.
     */
    getDocuments() {
        return this.#documentsEndpoint.getAll();
    }

    /**
     * Fetches a document by its ID.
     * @param {number|string} id - The ID of the document.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the document response.
     */
    getDocumentById(id) {
        return this.#documentsEndpoint.getById(id);
    }

    /**
     * Creates a document resource.
     * @param {Object} resource - Document resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created document response.
     */
    createDocument(resource) {
        return this.#documentsEndpoint.create(resource);
    }

    /**
     * Updates a document resource.
     * @param {Object} resource - Document resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated document response.
     */
    updateDocument(resource) {
        return this.#documentsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a document by its ID.
     * @param {number|string} id - The ID of the document to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteDocument(id) {
        return this.#documentsEndpoint.delete(id);
    }
}
