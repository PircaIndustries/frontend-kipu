import {MaterialRequestItemEntity} from "@/domains/logistics/domain/model/requests/materialRequestItem.entity.js";

export class MaterialRequestEntity {
    constructor({
                    id = null, deadline = '', requestStatus = '', requestPriority = '',
                    deliveryLocation = '', budgetLineId = null, purpose = '',
                    additionalNotes = '', requestedBy = null, projectId = null, items = []
                } = {}) {
        this.id = id;
        this.deadline = deadline;
        this.requestStatus = requestStatus;
        this.requestPriority = requestPriority;
        this.deliveryLocation = deliveryLocation;
        this.budgetLineId = budgetLineId;
        this.purpose = purpose;
        this.additionalNotes = additionalNotes;
        this.requestedBy = requestedBy;
        this.projectId = projectId;
        this.items = items.map(item => new MaterialRequestItemEntity(item));
    }
}
