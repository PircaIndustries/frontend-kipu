import {MachineryEntity} from "@/domains/logistics/domain/model/machinery/machinery.entity.js";

/**
 * Maps machinery catalog resources into domain entities.
 *
 * @class MachineryAssembler
 */
export class MachineryAssembler {
    /**
     * @param {Object} resource - Machinery resource payload.
     * @returns {MachineryEntity} Machinery entity.
     */
    static toEntityFromResource(resource) {
        return new MachineryEntity({...resource});
    }

    /**
     * Parses machinery resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {MachineryEntity[]} Machinery entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['machineryCatalog'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}