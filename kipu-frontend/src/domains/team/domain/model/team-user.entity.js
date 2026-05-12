/**
 * @typedef {Object} TeamUser
 * @property {string} id - User identifier
 * @property {string} fullName - User full name
 * @property {string} email - User email address
 * @property {boolean} isActive - Whether user is active
 * @property {string} role - User role (Administrador, Gestor, Logistica, Cliente, Ingeniero)
 */

/**
 * TeamUser entity class
 */
export class TeamUserEntity {
    constructor() {
        /** @type {string} */
        this.id = ''

        /** @type {string} */
        this.fullName = ''

        /** @type {string} */
        this.email = ''

        /** @type {boolean} */
        this.isActive = true

        /** @type {string} */
        this.role = ''
    }
}