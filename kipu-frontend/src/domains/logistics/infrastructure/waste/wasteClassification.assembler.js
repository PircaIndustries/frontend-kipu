import { WasteClassificationEntity } from "@/domains/logistics/domain/model/waste/wasteClassification.entity.js";

export class WasteClassificationAssembler {
    static toEntityFromResource(resource) {
        return new WasteClassificationEntity({ ...resource });
    }

    static toEntitiesFromResponse(data) {
        if (!data) return [];

        // Maneja si el backend responde con el array envuelto o directo
        let items = data.wasteClassifications || data;

        if (!Array.isArray(items)) {
            items = [items];
        }
        return items.map(resource => this.toEntityFromResource(resource));
    }
}