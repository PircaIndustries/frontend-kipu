import {BaseEndpointLocal} from "../../../shared/infrastructure/base-endpoint-local.js";
import {BaseApiLocal} from "../../../shared/infrastructure/base-api-local.js";

const categoriesEndpointPath             = import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH || '/materials/categories';

/**
 * Infrastructure gateway for Logistics bounded-context endpoints.
 *
 * @class CategoriesApi
 * @extends BaseApiLocal
 */

export class CategoriesApi extends BaseApiLocal {
    /** @type {BaseEndpointLocal} @private */
    #categoriesEndpoint;

    /** Creates endpoint clients for all logistics resources. */
    constructor() {
        super();
        this.#categoriesEndpoint           = new BaseEndpointLocal(this, categoriesEndpointPath);
    }

    /**
     * Fetches all categories.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getCategories() { return this.#categoriesEndpoint.getAll(); }

    /**
     * Creates a category resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createCategory(resource) { return this.#categoriesEndpoint.create(resource); }

    /**
     * Updates a category resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateCategory(resource) { return this.#categoriesEndpoint.update(resource.id, resource); }

    /**
     * Deletes a category by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteCategory(id) { return this.#categoriesEndpoint.delete(id); }
}