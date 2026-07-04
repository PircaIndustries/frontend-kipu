import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";
import {BaseApi} from "../../../shared/infrastructure/base-api.js";

const machineryEndpointPath              = import.meta.env.VITE_MACHINERY_ENDPOINT_PATH || '/machinery';
const machineryAssignmentsEndpointPath   = import.meta.env.VITE_MACHINERY_ASSIGNMENTS_ENDPOINT_PATH || '/machinery/assignments';

export class MachineryApi extends BaseApi {

    /** @type {BaseEndpoint} @private */
    #machineryEndpoint;
    /** @type {BaseEndpoint} @private */
    #machineryAssignmentsEndpoint;

    constructor() {
        super();
        this.#machineryEndpoint            = new BaseEndpoint(this, machineryEndpointPath);
        this.#machineryAssignmentsEndpoint = new BaseEndpoint(this, machineryAssignmentsEndpointPath);
    }

    // MACHINERY CATALOG
    getMachinery() { return this.#machineryEndpoint.getAll(); }
    getMachineryById(id) { return this.#machineryEndpoint.getById(id); }
    createMachinery(resource) { return this.#machineryEndpoint.create(resource); }
    updateMachinery(resource) { return this.#machineryEndpoint.update(resource.id, resource); }
    deleteMachinery(id) { return this.#machineryEndpoint.delete(id); }

    // MACHINERY ASSIGNMENTS
    getMachineryAssignments(projectId) {
        return projectId
            ? this.http.get(`${this.#machineryAssignmentsEndpoint.endpointPath}?projectId=${projectId}`)
            : this.#machineryAssignmentsEndpoint.getAll();
    }
    getMachineryAssignmentById(id) { return this.#machineryAssignmentsEndpoint.getById(id); }
    createMachineryAssignment(resource) { return this.#machineryAssignmentsEndpoint.create(resource); }
    updateMachineryAssignment(resource) { return this.#machineryAssignmentsEndpoint.patch(resource.id, resource); }
    deleteMachineryAssignment(id) { return this.#machineryAssignmentsEndpoint.delete(id); }
}
