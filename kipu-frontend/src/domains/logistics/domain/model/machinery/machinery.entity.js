/**
 * Machinery entity representing heavy equipment in the catalog.
 *
 * @class MachineryEntity
 */
export class MachineryEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Machinery identifier.
     * @param {string} [params.name=''] - General name of the equipment.
     * @param {string} [params.brand=''] - Manufacturer brand.
     * @param {string} [params.model=''] - Specific model name/number.
     * @param {string} [params.serialNumber=''] - Unique serial number from the manufacturer.
     * @param {string} [params.acquisitionDate=''] - Date the machinery was acquired (ISO format).
     */
    constructor({ id = null, name = '', brand = '', model = '', serialNumber = '', acquisitionDate = '' } = {}) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.acquisitionDate = acquisitionDate;
    }
}