import {SupplierOfferEntity} from "@/domains/logistics/domain/model/suppliers/supplierOffer.entity.js";

export class SupplierOfferAssembler {
    static toEntityFromResource(resource) {
        return new SupplierOfferEntity({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['supplierOffers'];
        return resources ? resources.map(resource => this.toEntityFromResource(resource)) : [];
    }
}
