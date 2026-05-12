/**
 * @typedef {Object} UserDocument
 * @property {string} id - User identifier
 * @property {string} fullName - User full name
 * @property {Date} [signedAt] - Date when user signed
 */

export class DocumentEntity {
    constructor() {
        this.id = '';
        this.type = '';
        this.isSigned = false;
        this.digitalSignatureToken = null;
        this.deadLine = new Date();
        this.assignedTo = [];
    }

    /**
     * @returns {boolean} True if expired, false otherwise
     */
    isExpired() {
        if (!this.deadLine) return false;
        return new Date() > this.deadLine;
    }

    /**
     * @returns {boolean} True if can be signed, false otherwise
     */
    canBeSigned() {
        return !this.isSigned && !this.isExpired();
    }
}