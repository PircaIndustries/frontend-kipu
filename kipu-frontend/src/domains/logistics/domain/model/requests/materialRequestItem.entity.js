/**
 * MaterialRequestItem entity representing individual items within a material request.
 *
 * @class MaterialRequestItemEntity
 */
export class MaterialRequestItemEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.supplierOfferId=null] - Associated supplier offer identifier.
     * @param {number} [params.quantity=0] - Requested quantity.
     */
    constructor({ supplierOfferId = null, quantity = 0 } = {}) {
        this.supplierOfferId = supplierOfferId;
        this.quantity = quantity;
    }
}