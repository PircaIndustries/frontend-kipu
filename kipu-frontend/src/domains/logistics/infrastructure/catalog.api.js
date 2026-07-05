import {BaseEndpointLocal} from "../../../shared/infrastructure/base-endpoint-local.js";
import {BaseApiLocal} from "../../../shared/infrastructure/base-api-local.js";

const materialsCatalogPath = import.meta.env.VITE_MATERIALS_ENDPOINT_PATH || '/materials-catalog';
const machineryCatalogPath = import.meta.env.VITE_MACHINERY_ENDPOINT_PATH || '/machinery-catalog';

export class CatalogApi extends BaseApiLocal {
    #materialsEndpoint;
    #machineryEndpoint;

    constructor() {
        super();
        this.#materialsEndpoint = new BaseEndpointLocal(this, materialsCatalogPath);
        this.#machineryEndpoint = new BaseEndpointLocal(this, machineryCatalogPath);
    }

    getMaterialsCatalog() { return this.#materialsEndpoint.getAll(); }
    getMaterialsCatalogById(id) { return this.#materialsEndpoint.getById(id); }
    createMaterialCatalog(resource) { return this.#materialsEndpoint.create(resource); }
    patchMaterialCatalog(id, resource) { return this.#materialsEndpoint.patch(id, resource); }
    deleteMaterialCatalog(id) { return this.#materialsEndpoint.delete(id); }

    getMachineryCatalog() { return this.#machineryEndpoint.getAll(); }
    getMachineryCatalogById(id) { return this.#machineryEndpoint.getById(id); }
    createMachineryCatalog(resource) { return this.#machineryEndpoint.create(resource); }
    patchMachineryCatalog(id, resource) { return this.#machineryEndpoint.patch(id, resource); }
    deleteMachineryCatalog(id) { return this.#machineryEndpoint.delete(id); }
}
