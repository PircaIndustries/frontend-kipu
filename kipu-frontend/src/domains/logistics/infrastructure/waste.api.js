import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";
import {BaseApi} from "../../../shared/infrastructure/base-api.js";

const materialWasteEndpointPath          = import.meta.env.VITE_MATERIAL_WASTE_ENDPOINT_PATH || '/materials/waste';
/**
 * Infrastructure gateway for Logistics bounded-context endpoints.
 *
 * @class WasteApi
 * @extends BaseApi
 */

export class WasteApi extends BaseApi {
    /** @type {BaseEndpoint} @private */
    #materialWasteEndpoint;

    /** Creates endpoint clients for all logistics resources. */
    constructor() {
        super();
        this.#materialWasteEndpoint        = new BaseEndpoint(this, materialWasteEndpointPath);
    }
    // ==========================================
    // MATERIAL WASTE
    // ==========================================

    /**
     * Fetches all material waste records.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMaterialWastes() { return this.#materialWasteEndpoint.getAll(); }

    /**
     * Fetches a material waste record by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMaterialWasteById(id) { return this.#materialWasteEndpoint.getById(id); }

    /**
     * Creates a material waste resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createMaterialWaste(resource) { return this.#materialWasteEndpoint.create(resource); }

    /**
     * Updates a material waste resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateMaterialWaste(resource) { return this.#materialWasteEndpoint.update(resource.id, resource); }

    /**
     * Deletes a material waste record by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteMaterialWaste(id) { return this.#materialWasteEndpoint.delete(id); }

    // ==========================================
    // WASTE CLASSIFICATIONS
    // ==========================================

    /**
     * Fetches all waste classifications.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getWasteClassifications() { return this.http.get('/wasteClassifications'); }

    /**
     * Creates a waste classification.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createWasteClassification(resource) { return this.http.post('/wasteClassifications', resource); }
}