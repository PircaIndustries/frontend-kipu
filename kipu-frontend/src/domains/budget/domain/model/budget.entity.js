export class Budget {
    /**
     *
     * @param param0
     * @param param0.id
     * @param param0.name
     * @param param0.description
     * @param param0.budgeted
     * @param param0.executed
     * @param param0.status
     * @param param0.alertMessage
     */
    constructor({ id, name, description, budgeted, executed, status, alertMessage = null }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.budgeted = budgeted;
        this.executed = executed;
        this.status = status;
        this.alertMessage = alertMessage;
    }

    get percentageExecuted() {
        return Math.round((this.executed / this.budgeted) * 100);
    }

    get availableAmount() {
        return this.budgeted - this.executed;
    }

    get isAtRisk() {
        return this.status === 'En riesgo';
    }
}