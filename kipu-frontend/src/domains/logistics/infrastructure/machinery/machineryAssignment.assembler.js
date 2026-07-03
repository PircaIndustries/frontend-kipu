import {MachineryAssignmentEntity} from "@/domains/logistics/domain/model/machinery/machineryAssignment.entity.js";

export class MachineryAssignmentAssembler {
    static toEntityFromResource(resource) {
        return new MachineryAssignmentEntity({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let data = response.data;
        if (!Array.isArray(data)) data = [data];
        return data.map(resource => this.toEntityFromResource(resource));
    }
}
