import {MaterialEntity} from "@/domains/logistics/domain/model/materials/material.entity.js";

/**
 * Maps material resources into domain entities.
 *
 * @class MaterialAssembler
 */
export class MaterialAssembler {
    /**
     * @param {Object} resource - Material resource payload.
     * @returns {MaterialEntity} Material entity.
     */
    static toEntityFromResource(resource) {
        return new MaterialEntity({...resource});
    }

    /**
     * Parses material resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {MaterialEntity[]} Material entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['materialsCatalog'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}