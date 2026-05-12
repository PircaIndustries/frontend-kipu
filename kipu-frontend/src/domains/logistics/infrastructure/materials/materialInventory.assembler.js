import {MaterialInventoryEntity} from "@/domains/logistics/domain/model/materials/materialInventory.entity.js";

/**
 * Maps material inventory resources into domain entities.
 *
 * @class MaterialInventoryAssembler
 */
export class MaterialInventoryAssembler {
    /**
     * @param {Object} resource - Material inventory resource payload.
     * @returns {MaterialInventoryEntity} MaterialInventory entity.
     */
    static toEntityFromResource(resource) {
        return new MaterialInventoryEntity({...resource});
    }

    /**
     * Parses material inventory resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {MaterialInventoryEntity[]} MaterialInventory entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['materialsInventory'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}