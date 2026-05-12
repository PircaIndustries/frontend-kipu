/**
 * MaterialEntity entity representing a specific item in the catalog.
 *
 * @class MaterialEntity
 */
export class MaterialEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - MaterialEntity unique identifier.
     * @param {string} [params.name=''] - Name of the material.
     * @param {?string} [params.categoryId=null] - Reference to the parent category ID.
     * @param {string} [params.subcategory=''] - Subcategory classification.
     * @param {string} [params.measureUnit=''] - Unit of measurement (e.g., und, m3, kg).
     */
    constructor({ id = null, name = '', categoryId = null, subcategory = '', measureUnit = '' } = {}) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        this.subcategory = subcategory;
        this.measureUnit = measureUnit;
    }
}