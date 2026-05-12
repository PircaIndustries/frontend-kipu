/**
 * MaterialWaste entity tracking damaged, expired, or unusable materials.
 *
 * @class MaterialWasteEntity
 */
export class MaterialWasteEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Waste record identifier.
     * @param {?string} [params.projectId=null] - Associated project identifier.
     * @param {?string} [params.materialId=null] - Associated material identifier.
     * @param {number} [params.quantity=0] - Amount of wasted material.
     * @param {string} [params.classificationType=''] - Type of waste (e.g., ROTURA, VENCIMIENTO).
     * @param {string} [params.date=''] - Date the waste was reported.
     * @param {string} [params.description=''] - Details regarding how the material was wasted.
     * @param {?string} [params.reportedBy=null] - User identifier who reported the waste.
     * @param {string} [params.photoUrl=''] - URL to photographic evidence.
     */
    constructor({ id = null, projectId = null, materialId = null, quantity = 0, classificationType = '', date = '', description = '', reportedBy = null, photoUrl = '' } = {}) {
        this.id = id;
        this.projectId = projectId;
        this.materialId = materialId;
        this.quantity = quantity;
        this.classificationType = classificationType;
        this.date = date;
        this.description = description;
        this.reportedBy = reportedBy;
        this.photoUrl = photoUrl;
    }
}