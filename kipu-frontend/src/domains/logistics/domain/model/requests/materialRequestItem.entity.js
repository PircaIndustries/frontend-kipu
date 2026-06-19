export class MaterialRequestItemEntity {
    constructor({ id = null, materialCatalogId = null, supplierId = null, quantity = 0, unitPrice = 0 } = {}) {
        this.id = id;
        this.materialCatalogId = materialCatalogId;
        this.supplierId = supplierId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}
