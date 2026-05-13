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
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources;
        if (Array.isArray(response.data)) {
            resources = response.data;
        } else if (response.data?.materialsSuppliers) {
            resources = response.data.materialsSuppliers;
        } else {
            resources = [response.data];
        }
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}