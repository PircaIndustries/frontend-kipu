/**
 * Repository for Daily Progress
 * Handles data persistence for daily work reports.
 */
export class DailyProgressRepository {
    constructor() {
        this.storageKey = 'kipu_daily_progress';
    }

    /**
     * Saves a new progress record
     * @param {DailyProgress} progress
     */
    async save(progress) {
        const records = await this.getAll();
        records.push(progress);
        localStorage.setItem(this.storageKey, JSON.stringify(records));
        return progress;
    }

    /**
     * Retrieves all progress records
     */
    async getAll() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }
}