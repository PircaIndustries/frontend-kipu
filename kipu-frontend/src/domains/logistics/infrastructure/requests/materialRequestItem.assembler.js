import {MaterialRequestItemEntity} from "@/domains/logistics/domain/model/requests/materialRequestItem.entity.js";

/**
 * Maps material request item resources into domain entities.
 * (Note: Uses a custom array parser since items usually come nested inside a request).
 *
 * @class MaterialRequestItemAssembler
 */
export class MaterialRequestItemAssembler {
    /**
     * @param {Object} resource - Request item resource payload.
     * @returns {MaterialRequestItemEntity} MaterialRequestItem entity.
     */
    static toEntityFromResource(resource) {
        return new MaterialRequestItemEntity({...resource});
    }

    /**
     * Parses request item resources from an array and maps them into entities.
     *
     * @param {Array<Object>} resources - Array of item resources.
     * @returns {MaterialRequestItemEntity[]} MaterialRequestItem entities.
     */
    static toEntitiesFromResourceArray(resources) {
        if (!Array.isArray(resources)) return [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}