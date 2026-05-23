/**
 * Domain entity representing a Daily Progress record.
 */
export class DailyProgressEntity {
    constructor({ id, projectId, projectName, activityName, details, specialty, status, currentPercentage, startDate, endDate, lastUpdate, responsible, workers, weather }) {
        this.id = id;
        this.projectId = projectId;
        this.projectName = projectName;
        this.activityName = activityName;
        this.details = details;
        this.specialty = specialty;
        this.status = status;
        this.currentPercentage = currentPercentage;
        this.startDate = startDate;
        this.endDate = endDate;
        this.lastUpdate = lastUpdate;
        this.responsible = responsible;
        this.workers = workers;
        this.weather = weather;
    }
}