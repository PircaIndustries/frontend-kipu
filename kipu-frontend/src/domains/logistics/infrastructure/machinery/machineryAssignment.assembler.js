import {MachineryAssignmentEntity} from "@/domains/logistics/domain/model/machinery/machineryAssignment.entity.js";

/**
 * Maps machinery assignment resources into domain entities.
 *
 * @class MachineryAssignmentAssembler
 */
export class MachineryAssignmentAssembler {
    /**
     * @param {Object} resource - Machinery assignment resource payload.
     * @returns {MachineryAssignmentEntity} MachineryAssignment entity.
     */
    static toEntityFromResource(resource) {
        return new MachineryAssignmentEntity({...resource});
    }

    /**
     * Parses machinery assignment resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {MachineryAssignmentEntity[]} MachineryAssignment entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['machineryAssignments'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}