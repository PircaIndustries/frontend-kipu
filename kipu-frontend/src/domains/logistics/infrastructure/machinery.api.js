import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";
import {BaseApi} from "../../../shared/infrastructure/base-api.js";

const machineryEndpointPath              = import.meta.env.VITE_MACHINERY_ENDPOINT_PATH || '/machinery';
const machineryAssignmentsEndpointPath   = import.meta.env.VITE_MACHINERY_ASSIGNMENTS_ENDPOINT_PATH || '/machinery/assignments';

/**
 * Infrastructure gateway for Logistics bounded-context endpoints.
 *
 * @class MachineryApi
 * @extends BaseApi
 */

export class MachineryApi extends BaseApi {

    /** @type {BaseEndpoint} @private */
    #machineryEndpoint;
    /** @type {BaseEndpoint} @private */
    #machineryAssignmentsEndpoint;

    /** Creates endpoint clients for all logistics resources. */
    constructor() {
        super();
        this.#machineryEndpoint            = new BaseEndpoint(this, machineryEndpointPath);
        this.#machineryAssignmentsEndpoint = new BaseEndpoint(this, machineryAssignmentsEndpointPath);
    }

    // ==========================================
    // MACHINERY
    // ==========================================

    /**
     * Fetches all machinery.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMachinery() { return this.#machineryEndpoint.getAll(); }

    /**
     * Fetches machinery by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMachineryById(id) { return this.#machineryEndpoint.getById(id); }

    /**
     * Creates a machinery resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createMachinery(resource) { return this.#machineryEndpoint.create(resource); }

    /**
     * Updates a machinery resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateMachinery(resource) { return this.#machineryEndpoint.update(resource.id, resource); }

    /**
     * Deletes a machinery resource by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteMachinery(id) { return this.#machineryEndpoint.delete(id); }


    // ==========================================
    // MACHINERY ASSIGNMENTS
    // ==========================================

    /**
     * Fetches all machinery assignments.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMachineryAssignments() { return this.#machineryAssignmentsEndpoint.getAll(); }

    /**
     * Fetches a machinery assignment by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMachineryAssignmentById(id) { return this.#machineryAssignmentsEndpoint.getById(id); }

    /**
     * Creates a machinery assignment resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createMachineryAssignment(resource) { return this.#machineryAssignmentsEndpoint.create(resource); }

    /**
     * Updates a machinery assignment resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateMachineryAssignment(resource) { return this.#machineryAssignmentsEndpoint.update(resource.id, resource); }

    /**
     * Deletes a machinery assignment by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteMachineryAssignment(id) { return this.#machineryAssignmentsEndpoint.delete(id); }
}