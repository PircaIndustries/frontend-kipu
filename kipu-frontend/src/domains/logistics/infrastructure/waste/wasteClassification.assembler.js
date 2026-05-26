import { WasteClassificationEntity } from "@/domains/logistics/domain/model/waste/wasteClassification.entity.js";

export class WasteClassificationAssembler {
    static toEntityFromResource(resource) {
        return new WasteClassificationEntity({ ...resource });
    }
    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let data = response.data;
        if (!Array.isArray(data)) {
            data = data['wasteClassifications'] || [data];
        }
        if (!Array.isArray(data)) {
            data = [data];
        }
        return data.map(resource => this.toEntityFromResource(resource));
    }
}
