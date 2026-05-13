/**
 * Domain entity representing a user identity in the system.
 *
 */
export class IdentityEntity {
    constructor() {
        /** @type {string} */
        this.id = '';
        /** @type {string} */
        this.name = '';
        /** @type {string} */
        this.email = '';
        /** @type {string} */
        this.password = '';
        /** @type {string} */
        this.role = '';
    }
}
