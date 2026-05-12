/**
 * DailyProgress Entity
 * Represents the daily work progress for a specific task (partida).
 */
export class DailyProgress {
    /**
     * @param {string} id - Unique identifier
     * @param {string} taskName - Name of the task (Partida)
     * @param {string} status - Status (Progress/Blocked)
     * @param {string} impedimentReason - Reason if blocked (optional)
     * @param {string} date - Registration date
     */
    constructor(id, taskName, status, impedimentReason = '', date = new Date().toISOString()) {
        this.id = id;
        this.taskName = taskName; // English: Partida Name
        this.status = status;     // English: Status
        this.impedimentReason = impedimentReason; // English: Motivo de impedimento
        this.date = date;
    }
}