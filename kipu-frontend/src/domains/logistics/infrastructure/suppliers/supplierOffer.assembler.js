import {SupplierOfferEntity} from "@/domains/logistics/domain/model/suppliers/supplierOffer.entity.js";

/**
 * Maps supplier offer resources into domain entities.
 *
 * @class SupplierOfferAssembler
 */
export class SupplierOfferAssembler {
    /**
     * @param {Object} resource - Supplier offer resource payload.
     * @returns {SupplierOfferEntity} SupplierOffer entity.
     */
    static toEntityFromResource(resource) {
        return new SupplierOfferEntity({...resource});
    }

    /**
     * Parses supplier offer resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {SupplierOfferEntity[]} SupplierOffer entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['supplierOffers'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}