/**
 * @typedef {Object} TeamWorker
 * @property {string} id - Worker identifier
 * @property {string} dni - Worker ID number (DNI)
 * @property {string} fullName - Worker full name
 * @property {string} role - Worker position/crew
 * @property {boolean} isActive - Whether worker is active
 * @property {string[]} assignedTools - Array of assigned tool names
 */

/**
 * TeamWorker entity class
 */
export class TeamWorkerEntity {
    constructor() {
        /** @type {string} */
        this.id = ''

        /** @type {string} */
        this.dni = ''

        /** @type {string} */
        this.fullName = ''

        /** @type {string} */
        this.role = ''

        /** @type {boolean} */
        this.isActive = true

        /** @type {string[]} */
        this.assignedTools = []
    }
}