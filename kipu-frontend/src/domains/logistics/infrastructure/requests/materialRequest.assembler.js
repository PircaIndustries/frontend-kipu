import {MaterialRequestEntity} from "@/domains/logistics/domain/model/requests/materialRequest.entity.js";

/**
 * Maps material request resources into domain entities.
 *
 * @class MaterialRequestAssembler
 */
export class MaterialRequestAssembler {
    /**
     * @param {Object} resource - Material request resource payload.
     * @returns {MaterialRequestEntity} MaterialRequest entity.
     */
    static toEntityFromResource(resource) {
        return new MaterialRequestEntity({...resource});
    }

    /**
     * Parses material request resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {MaterialRequestEntity[]} MaterialRequest entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['materialsRequests'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}