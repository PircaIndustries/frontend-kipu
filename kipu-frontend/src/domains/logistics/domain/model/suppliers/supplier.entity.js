export class SupplierEntity {
    constructor({ id = null, ruc = '', socialReason = '', contact = '', phone = '', email = '', paymentTerms = '', isActive = true } = {}) {
        this.id = id;
        this.ruc = ruc;
        this.socialReason = socialReason;
        this.contact = contact;
        this.phone = phone;
        this.email = email;
        this.paymentTerms = paymentTerms;
        this.isActive = isActive;
    }
}
