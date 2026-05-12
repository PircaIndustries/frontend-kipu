/**
 * Supplier entity representing a vendor or provider of materials.
 *
 * @class SupplierEntity
 */
export class SupplierEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Supplier identifier.
     * @param {string} [params.ruc=''] - Taxpayer registry number (RUC).
     * @param {string} [params.onboarded=''] - Registration or onboarding date.
     * @param {string} [params.socialReason=''] - Legal company name.
     * @param {string} [params.contact=''] - Primary contact person or department.
     * @param {string} [params.phone=''] - Contact phone number.
     * @param {string} [params.email=''] - Contact email address.
     * @param {string} [params.paymentTerms=''] - Agreed payment terms (e.g., NET 30).
     * @param {string} [params.status=''] - Current status (e.g., ACTIVE, INACTIVE).
     */
    constructor({ id = null, ruc = '', onboarded = '', socialReason = '', contact = '', phone = '', email = '', paymentTerms = '', status = '' } = {}) {
        this.id = id;
        this.ruc = ruc;
        this.onboarded = onboarded;
        this.socialReason = socialReason;
        this.contact = contact;
        this.phone = phone;
        this.email = email;
        this.paymentTerms = paymentTerms;
        this.status = status;
    }
}