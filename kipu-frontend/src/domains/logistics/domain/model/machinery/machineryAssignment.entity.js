/**
 * MachineryAssignment entity representing the deployment and status of equipment on projects.
 *
 * @class MachineryAssignmentEntity
 */
export class MachineryAssignmentEntity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Assignment identifier.
     * @param {?string} [params.projectId=null] - Associated project identifier.
     * @param {?string} [params.machineryId=null] - Associated machinery identifier.
     * @param {string} [params.status=''] - Operational status (e.g., IN_USE, URGENT_MAINTENANCE).
     * @param {?string} [params.assignedTo=null] - Operator or supervisor assigned to the machinery.
     * @param {string} [params.registrationDate=''] - Timestamp of the assignment (ISO format).
     * @param {string} [params.maintenanceHours='0'] - Accumulated hours tracking for maintenance.
     * @param {string} [params.assignmentDetail=''] - Specific task or issue details.
     */
    constructor({ id = null, projectId = null, machineryId = null, status = '', assignedTo = null, registrationDate = '', maintenanceHours = '0', assignmentDetail = '' } = {}) {
        this.id = id;
        this.projectId = projectId;
        this.machineryId = machineryId;
        this.status = status;
        this.assignedTo = assignedTo;
        this.registrationDate = registrationDate;
        this.maintenanceHours = maintenanceHours;
        this.assignmentDetail = assignmentDetail;
    }
}