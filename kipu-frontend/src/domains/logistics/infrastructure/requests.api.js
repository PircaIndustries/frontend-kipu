import {BaseEndpointLocal} from "../../../shared/infrastructure/base-endpoint-local.js";
import {BaseApiLocal} from "../../../shared/infrastructure/base-api-local.js";

const materialRequestsEndpointPath = import.meta.env.VITE_MATERIAL_REQUESTS_ENDPOINT_PATH || '/materials-request';

export class RequestsApi extends BaseApiLocal {
    #materialRequestsEndpoint;

    constructor() {
        super();
        this.#materialRequestsEndpoint = new BaseEndpointLocal(this, materialRequestsEndpointPath);
    }

    getMaterialRequests() { return this.#materialRequestsEndpoint.getAll(); }
    getMaterialRequestsByProject(projectId) {
        return projectId
            ? this.http.get(`${materialRequestsEndpointPath}/project/${projectId}`)
            : this.#materialRequestsEndpoint.getAll();
    }
    getMaterialRequestById(id) { return this.#materialRequestsEndpoint.getById(id); }
    createMaterialRequest(resource) { return this.#materialRequestsEndpoint.create(resource); }

    updateMaterialRequest(resource) {
        const { id, ...updates } = resource;
        return this.http.patch(`${materialRequestsEndpointPath}/${id}`, updates);
    }

    deleteMaterialRequest(id) { return this.#materialRequestsEndpoint.delete(id); }
}
