/**
 * CategoryEntity entity representing a material classification.
 *
 * @class CategoryEntity
 */
export class CategoryEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - CategoryEntity unique identifier.
     * @param {string} [params.name=''] - Human-readable category name.
     * @param {string} [params.description=''] - Detailed description of the category.
     * @param {boolean} [params.isActive=true] - Indicates if the category is currently active.
     */
    constructor({ id = null, name = '', description = '', isActive = true } = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
    }
}