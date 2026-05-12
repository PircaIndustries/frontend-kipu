import {SupplierEntity} from "@/domains/logistics/domain/model/suppliers/supplier.entity.js";

/**
 * Maps supplier resources into domain entities.
 *
 * @class SupplierAssembler
 */
export class SupplierAssembler {
    /**
     * @param {Object} resource - Supplier resource payload.
     * @returns {SupplierEntity} Supplier entity.
     */
    static toEntityFromResource(resource) {
        return new SupplierEntity({...resource});
    }

    /**
     * Parses supplier resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
     * @returns {SupplierEntity[]} Supplier entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['materialsSuppliers'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}