import {BaseEndpointLocal} from "../../../shared/infrastructure/base-endpoint-local.js";
import {BaseApiLocal} from "../../../shared/infrastructure/base-api-local.js";

const inventoryEndpointPath              = import.meta.env.VITE_INVENTORY_ENDPOINT_PATH;
/**
 * Infrastructure gateway for Logistics bounded-context endpoints.
 *
 * @class InventoryApi
 * @extends BaseApiLocal
 */

export class InventoryApi extends BaseApiLocal {
    /** @type {BaseEndpointLocal} @private */
    #inventoryEndpoint;

    /** Creates endpoint clients for all logistics resources. */
    constructor() {
        super();
        this.#inventoryEndpoint            = new BaseEndpointLocal(this, inventoryEndpointPath);
    }

    /**
     * Fetches all material inventories.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMaterialInventories() { return this.#inventoryEndpoint.getAll(); }

    /**
     * Fetches a material inventory by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMaterialInventoryById(id) { return this.#inventoryEndpoint.getById(id); }

    /**
     * Creates a material inventory resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createMaterialInventory(resource) { return this.#inventoryEndpoint.create(resource); }

    /**
     * Updates a material inventory resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateMaterialInventory(resource) { return this.#inventoryEndpoint.update(resource.id, resource); }

    /**
     * Deletes a material inventory by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteMaterialInventory(id) { return this.#inventoryEndpoint.delete(id); }
}