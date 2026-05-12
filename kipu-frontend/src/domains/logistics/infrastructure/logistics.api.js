import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";
import {BaseApi} from "../../../shared/infrastructure/base-api.js";

const categoriesEndpointPath             = import.meta.env.VITE_CATEGORIES_ENDPOINT_PATH || '/materials/categories';
const materialsEndpointPath              = import.meta.env.VITE_MATERIALS_ENDPOINT_PATH || '/materials';
const inventoryEndpointPath              = import.meta.env.VITE_INVENTORY_ENDPOINT_PATH || '/materials/inventory';
const supplierOffersEndpointPath         = import.meta.env.VITE_SUPPLIER_OFFERS_ENDPOINT_PATH || '/materials/supplierOffer';
const suppliersEndpointPath              = import.meta.env.VITE_SUPPLIERS_ENDPOINT_PATH || '/materials/suppliers';
const materialRequestsEndpointPath       = import.meta.env.VITE_MATERIAL_REQUESTS_ENDPOINT_PATH || '/materials/requests';
const materialWasteEndpointPath          = import.meta.env.VITE_MATERIAL_WASTE_ENDPOINT_PATH || '/materials/waste';
const machineryEndpointPath              = import.meta.env.VITE_MACHINERY_ENDPOINT_PATH || '/machinery';
const machineryAssignmentsEndpointPath   = import.meta.env.VITE_MACHINERY_ASSIGNMENTS_ENDPOINT_PATH || '/machinery/assignments';

/**
 * Infrastructure gateway for Logistics bounded-context endpoints.
 *
 * @class LogisticsApi
 * @extends BaseApi
 */

export class LogisticsApi extends BaseApi {
    /** @type {BaseEndpoint} @private */
    #categoriesEndpoint;
    /** @type {BaseEndpoint} @private */
    #materialsEndpoint;
    /** @type {BaseEndpoint} @private */
    #inventoryEndpoint;
    /** @type {BaseEndpoint} @private */
    #supplierOffersEndpoint;
    /** @type {BaseEndpoint} @private */
    #suppliersEndpoint;
    /** @type {BaseEndpoint} @private */
    #materialRequestsEndpoint;
    /** @type {BaseEndpoint} @private */
    #materialWasteEndpoint;
    /** @type {BaseEndpoint} @private */
    #machineryEndpoint;
    /** @type {BaseEndpoint} @private */
    #machineryAssignmentsEndpoint;

    /** Creates endpoint clients for all logistics resources. */
    constructor() {
        super();
        this.#categoriesEndpoint           = new BaseEndpoint(this, categoriesEndpointPath);
        this.#materialsEndpoint            = new BaseEndpoint(this, materialsEndpointPath);
        this.#inventoryEndpoint            = new BaseEndpoint(this, inventoryEndpointPath);
        this.#supplierOffersEndpoint       = new BaseEndpoint(this, supplierOffersEndpointPath);
        this.#suppliersEndpoint            = new BaseEndpoint(this, suppliersEndpointPath);
        this.#materialRequestsEndpoint     = new BaseEndpoint(this, materialRequestsEndpointPath);
        this.#materialWasteEndpoint        = new BaseEndpoint(this, materialWasteEndpointPath);
        this.#machineryEndpoint            = new BaseEndpoint(this, machineryEndpointPath);
        this.#machineryAssignmentsEndpoint = new BaseEndpoint(this, machineryAssignmentsEndpointPath);
    }

    // ==========================================
    // CATEGORIES
    // ==========================================

    /**
     * Fetches all categories.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getCategories() { return this.#categoriesEndpoint.getAll(); }

    /**
     * Fetches a category by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getCategoryById(id) { return this.#categoriesEndpoint.getById(id); }

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


    // ==========================================
    // MATERIALS
    // ==========================================

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


    // ==========================================
    // MATERIAL INVENTORY
    // ==========================================

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


    // ==========================================
    // SUPPLIER OFFERS
    // ==========================================

    /**
     * Fetches all supplier offers.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getSupplierOffers() { return this.#supplierOffersEndpoint.getAll(); }

    /**
     * Fetches a supplier offer by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getSupplierOfferById(id) { return this.#supplierOffersEndpoint.getById(id); }

    /**
     * Creates a supplier offer resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createSupplierOffer(resource) { return this.#supplierOffersEndpoint.create(resource); }

    /**
     * Updates a supplier offer resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateSupplierOffer(resource) { return this.#supplierOffersEndpoint.update(resource.id, resource); }

    /**
     * Deletes a supplier offer by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteSupplierOffer(id) { return this.#supplierOffersEndpoint.delete(id); }


    // ==========================================
    // SUPPLIERS
    // ==========================================

    /**
     * Fetches all suppliers.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getSuppliers() { return this.#suppliersEndpoint.getAll(); }

    /**
     * Fetches a supplier by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getSupplierById(id) { return this.#suppliersEndpoint.getById(id); }

    /**
     * Creates a supplier resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createSupplier(resource) { return this.#suppliersEndpoint.create(resource); }

    /**
     * Updates a supplier resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateSupplier(resource) { return this.#suppliersEndpoint.update(resource.id, resource); }

    /**
     * Deletes a supplier by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteSupplier(id) { return this.#suppliersEndpoint.delete(id); }


    // ==========================================
    // MATERIAL REQUESTS
    // ==========================================

    /**
     * Fetches all material requests.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMaterialRequests() { return this.#materialRequestsEndpoint.getAll(); }

    /**
     * Fetches a material request by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getMaterialRequestById(id) { return this.#materialRequestsEndpoint.getById(id); }

    /**
     * Creates a material request resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createMaterialRequest(resource) { return this.#materialRequestsEndpoint.create(resource); }

    /**
     * Updates a material request resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateMaterialRequest(resource) { return this.#materialRequestsEndpoint.update(resource.id, resource); }

    /**
     * Deletes a material request by its ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteMaterialRequest(id) { return this.#materialRequestsEndpoint.delete(id); }


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