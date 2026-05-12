import {CategoryEntity} from "@/domains/logistics/domain/model/materials/category.entity.js";

/**
 * Maps category resources into domain entities.
 *
 * @class CategoryAssembler
 */
export class CategoryAssembler {
    /**
     * @param {Object} resource - Category resource payload.
     * @returns {CategoryEntity} Category entity.
     */
    static toEntityFromResource(resource) {
        return new CategoryEntity({...resource});
    }

    /**
     * Parses category resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {CategoryEntity[]} Category entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['categoriesCatalog'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}