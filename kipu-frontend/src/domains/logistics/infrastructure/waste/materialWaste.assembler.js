import { MaterialWasteEntity } from "@/domains/logistics/domain/model/waste/materialWaste.entity.js";

// REVISA QUE DIGA 'export class'
export class MaterialWasteAssembler {
    static toEntityFromResource(resource) {
        return {
            id: resource.id,
            projectId: resource.projectId,
            materialId: resource.materialId,
            quantity: resource.quantity,
            classificationType: resource.classificationType || 'OTRO',
            date: resource.date,
            description: resource.description,
            reportedBy: resource.reportedBy,
            photoUrl: resource.photoUrl,
            materialName: resource.materialName || `Material #${resource.materialId}`,
            materialUnit: resource.materialUnit || 'U'
        };
    }

    static toEntitiesFromResponse(data) {
        if (!data) return [];
        let items = data.materialsWaste || data;
        if (!Array.isArray(items)) {
            items = [items];
        }
        return items.map(resource => this.toEntityFromResource(resource));
    }
}