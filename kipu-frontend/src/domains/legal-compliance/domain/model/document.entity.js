// domain/model/document.entity.js

/**
 * Document entity within the Publishing bounded context.
 *
 * @class Document
 */
export class DocumentEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Document identifier.
     * @param {string} [params.type=''] - Document type (e.g., 'contract', 'invoice', 'report').
     * @param {boolean} [params.isSigned=false] - Flag indicating if document is signed.
     * @param {?string} [params.digitalSignatureToken=null] - Token for digital signature.
     * @param {?Date} [params.deadLine=null] - Deadline for document signing.
     */
    constructor({ id = null, type = '', isSigned = false, digitalSignatureToken = null, deadLine = null }) {
        this.id = id;
        this.type = type;
        this.isSigned = isSigned;
        this.digitalSignatureToken = digitalSignatureToken;
        this.deadLine = deadLine ? new Date(deadLine) : null;
    }

    /**
     * Checks if the document is expired based on deadline.
     * @returns {boolean}
     */
    isExpired() {
        if (!this.deadLine) return false;
        return new Date() > this.deadLine;
    }

    /**
     * Checks if document can be signed (not expired and not already signed).
     * @returns {boolean}
     */
    canBeSigned() {
        return !this.isSigned && !this.isExpired();
    }
}