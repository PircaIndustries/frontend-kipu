export class Budget {
    constructor({ id, name, description, budgeted, executed, status, alertMessage = null }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.budgeted = Number(budgeted || 0);
        this.executed = Number(executed || 0);
        this.status = status;
        this.alertMessage = alertMessage;
    }

    // ADDED: Calculate the percentage of the budget already spent
    get percentageExecuted() {
        if (this.budgeted <= 0) return 0;
        return Math.round((this.executed / this.budgeted) * 100);
    }

    // ADDED: Calculate the remaining funds available for this item
    get availableAmount() {
        return this.budgeted - this.executed;
    }

    // ADDED: Strip the '.XX' placeholder part from the database IDs safely
    get cleanId() {
        if (!this.id) return '';
        return this.id.includes('.') ? this.id.split('.')[0] : this.id;
    }
}