import {SupplierEntity} from "@/domains/logistics/domain/model/suppliers/supplier.entity.js";

export class SupplierAssembler {
    static toEntityFromResource(resource) {
        return new SupplierEntity({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources;
        if (Array.isArray(response.data)) {
            resources = response.data;
        } else if (response.data?.suppliers) {
            resources = response.data.suppliers;
        } else {
            resources = [response.data];
        }
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
