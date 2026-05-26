import {CategoryEntity} from "@/domains/logistics/domain/model/materials/category.entity.js";

export class CategoryAssembler {
    static toEntityFromResource(resource) {
        return new CategoryEntity({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let data = response.data;
        if (!Array.isArray(data)) {
            data = data['categoriesCatalog'] || [data];
        }
        if (!Array.isArray(data)) {
            data = [data];
        }
        return data.map(resource => this.toEntityFromResource(resource));
    }
}
