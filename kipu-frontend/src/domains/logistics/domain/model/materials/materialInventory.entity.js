/**
 * MaterialInventoryEntity entity representing stock details per project and location.
 *
 * @class MaterialInventoryEntity
 */
export class MaterialInventoryEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Inventory record identifier.
     * @param {?string} [params.projectId=null] - Associated project identifier.
     * @param {?string} [params.materialId=null] - Associated material identifier.
     * @param {number} [params.currentStock=0] - Current available quantity.
     * @param {number} [params.miniumStock=0] - Minimum required stock to trigger alerts.
     * @param {string} [params.location=''] - Physical storage location.
     */
    constructor({ id = null, projectId = null, materialId = null, currentStock = 0, miniumStock = 0, location = '' } = {}) {
        this.id = id;
        this.projectId = projectId;
        this.materialId = materialId;
        this.currentStock = currentStock;
        this.miniumStock = miniumStock;
        this.location = location;
    }
}