import {MaterialRequestItemEntity} from "@/domains/logistics/domain/model/requests/materialRequestItem.entity.js";

/**
 * MaterialRequest entity representing a formal requisition for materials.
 *
 * @class MaterialRequestEntity
 */
export class MaterialRequestEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Request identifier.
     * @param {?string} [params.projectId=null] - Associated project identifier.
     * @param {string} [params.requestDate=''] - Date the request was created.
     * @param {string} [params.deadline=''] - Deadline for delivery.
     * @param {string} [params.status=''] - Current workflow status (e.g., PENDING, APPROVED).
     * @param {string} [params.priority=''] - Urgency level (e.g., LOW, MEDIUM, HIGH).
     * @param {string} [params.deliveryLocation=''] - Designated delivery spot.
     * @param {string} [params.budgetLineId=''] - Associated budget line code.
     * @param {string} [params.purpose=''] - Reason for the request.
     * @param {string} [params.additionalNotes=''] - Extra comments or delivery instructions.
     * @param {?string} [params.suggestedSupplierId=null] - Preferred supplier identifier.
     * @param {Array} [params.attachments=[]] - List of attached file URLs or references.
     * @param {?string} [params.requestedBy=null] - User identifier who made the request.
     * @param {MaterialRequestItemEntity[]} [params.items=[]] - List of requested items.
     */
    constructor({
                    id = null, projectId = null, requestDate = '', deadline = '',
                    status = '', priority = '', deliveryLocation = '', budgetLineId = '',
                    purpose = '', additionalNotes = '', suggestedSupplierId = null,
                    attachments = [], requestedBy = null, items = []
                } = {}) {
        this.id = id;
        this.projectId = projectId;
        this.requestDate = requestDate;
        this.deadline = deadline;
        this.status = status;
        this.priority = priority;
        this.deliveryLocation = deliveryLocation;
        this.budgetLineId = budgetLineId;
        this.purpose = purpose;
        this.additionalNotes = additionalNotes;
        this.suggestedSupplierId = suggestedSupplierId;
        this.attachments = attachments;
        this.requestedBy = requestedBy;
        this.items = items.map(item => new MaterialRequestItemEntity(item));
    }
}