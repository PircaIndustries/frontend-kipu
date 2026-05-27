import { Budget } from '../domain/model/budget.entity.js';

export class BudgetAssembler {
    // ADDED: Convert database plain object to fully operational domain entity
    static toEntity(response) {
        return new Budget({
            id: response.id,
            name: response.name,
            description: response.description,
            budgeted: response.budgeted,
            executed: response.executed,
            status: response.status,
            alertMessage: response.alertMessage
        });
    }

    // ADDED: Map an array of plain data objects into an entity list
    static toEntityList(responses) {
        if (!responses || !Array.isArray(responses)) return [];
        return responses.map(this.toEntity);
    }
}