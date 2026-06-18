import {BaseEndpointLocal} from "../../../shared/infrastructure/base-endpoint-local.js";
import {BaseApiLocal} from "../../../shared/infrastructure/base-api-local.js";

const materialsEndpointPath              = import.meta.env.VITE_MATERIALS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for Logistics bounded-context endpoints.
 *
 * @class MaterialsApi
 * @extends BaseApiLocal
 */

export class MaterialsApi extends BaseApiLocal {
    /** @type {BaseEndpointLocal} @private */
    #materialsEndpoint;

    /** Creates endpoint clients for all logistics resources. */
    constructor() {
        super();
        this.#materialsEndpoint            = new BaseEndpointLocal(this, materialsEndpointPath);
    }
    /**
     * Fetches all materials.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMaterials() { return this.#materialsEndpoint.getAll(); }

    /**
     * Fetches a material by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMaterialById(id) { return this.#materialsEndpoint.getById(id); }

    /**
     * Creates a material resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createMaterial(resource) { return this.#materialsEndpoint.create(resource); }

    /**
     * Updates a material resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateMaterial(resource) { return this.#materialsEndpoint.update(resource.id, resource); }

    /**
     * Deletes a material by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteMaterial(id) { return this.#materialsEndpoint.delete(id); }
}