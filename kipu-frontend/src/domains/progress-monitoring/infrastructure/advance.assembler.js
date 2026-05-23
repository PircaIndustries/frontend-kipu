import { DailyProgressEntity } from '../domain/models/DailyProgress.entity.js';

export class AdvanceAssembler {
    /**
     * Transforms raw API JSON into a valid domain entity.
     */
    static toEntity(response) {
        return new DailyProgressEntity({
            id: response.id,
            projectId: String(response.projectId),
            projectName: response.projectName || '',
            activityName: response.activityName || response.activity,
            details: response.details || response.sector || '',
            specialty: response.specialty,
            status: response.status,
            currentPercentage: response.currentPercentage || response.progress || 0,
            startDate: response.startDate ? new Date(response.startDate) : new Date(),
            endDate: response.endDate ? new Date(response.endDate) : new Date(),
            lastUpdate: response.lastUpdate ? new Date(response.lastUpdate) : new Date(),
            responsible: response.responsible || '',
            workers: response.workers || 0,
            weather: response.weather || 'sunny'
        });
    }

    static toEntityList(responses) {
        return responses.map(this.toEntity);
    }
}