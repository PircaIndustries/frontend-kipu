import {MaterialRequestEntity} from "@/domains/logistics/domain/model/requests/materialRequest.entity.js";

export class MaterialRequestAssembler {
    static toEntityFromResource(resource) {
        return new MaterialRequestEntity({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let data = response.data;
        if (data && data['materialsRequests']) {
            data = data['materialsRequests'];
        }
        let resources = Array.isArray(data) ? data : [data];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
