import {BaseEndpointLocal} from "../../../shared/infrastructure/base-endpoint-local.js";
import {BaseApiLocal} from "../../../shared/infrastructure/base-api-local.js";

const suppliersEndpointPath = import.meta.env.VITE_SUPPLIERS_ENDPOINT_PATH || '/supplier';
const supplierOffersEndpointPath = import.meta.env.VITE_SUPPLIER_OFFERS_ENDPOINT_PATH || '/supplier-offers';

export class SupplierApi extends BaseApiLocal {
    #suppliersEndpoint;
    #supplierOffersEndpoint;

    constructor() {
        super();
        this.#suppliersEndpoint = new BaseEndpointLocal(this, suppliersEndpointPath);
        this.#supplierOffersEndpoint = new BaseEndpointLocal(this, supplierOffersEndpointPath);
    }

    getSuppliers() { return this.#suppliersEndpoint.getAll(); }
    getSupplierById(id) { return this.#suppliersEndpoint.getById(id); }
    createSupplier(resource) { return this.#suppliersEndpoint.create(resource); }
    updateSupplier(resource) { return this.#suppliersEndpoint.update(resource.id, resource); }
    deleteSupplier(id) { return this.#suppliersEndpoint.delete(id); }

    getSupplierOffers() { return this.#supplierOffersEndpoint.getAll(); }
    getSupplierOffersBySupplier(supplierId) { return this.http.get(`${supplierOffersEndpointPath}/by-supplier/${supplierId}`); }
    getSupplierOffersByMaterial(materialId) { return this.http.get(`${supplierOffersEndpointPath}/by-material/${materialId}`); }
    createSupplierOffer(resource) { return this.#supplierOffersEndpoint.create(resource); }
    deleteSupplierOffer(id) { return this.#supplierOffersEndpoint.delete(id); }
}
