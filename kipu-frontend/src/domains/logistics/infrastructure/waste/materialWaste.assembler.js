import {MaterialWasteEntity} from "@/domains/logistics/domain/model/waste/materialWaste.entity.js";

/**
 * Maps material waste resources into domain entities.
 *
 * @class MaterialWasteAssembler
 */
export class MaterialWasteAssembler {
    /**
     * @param {Object} resource - Material waste resource payload.
     * @returns {MaterialWasteEntity} MaterialWaste entity.
     */
    static toEntityFromResource(resource) {
        return new MaterialWasteEntity({...resource});
    }

    /**
     * Parses material waste resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {MaterialWasteEntity[]} MaterialWaste entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['materialsWaste'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}