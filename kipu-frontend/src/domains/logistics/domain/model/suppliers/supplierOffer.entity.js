/**
 * SupplierOffer entity representing pricing offered by a specific supplier for a material.
 *
 * @class SupplierOfferEntity
 */
export class SupplierOfferEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Offer identifier.
     * @param {?string} [params.supplierId=null] - Associated supplier identifier.
     * @param {?string} [params.materialId=null] - Associated material identifier.
     * @param {number} [params.unitPrice=0.0] - Price per unit of the material.
     */
    constructor({ id = null, supplierId = null, materialId = null, unitPrice = 0.0 } = {}) {
        this.id = id;
        this.supplierId = supplierId;
        this.materialId = materialId;
        this.unitPrice = unitPrice;
    }
}