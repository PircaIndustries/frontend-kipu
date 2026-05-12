import { TeamWorkerEntity } from '../domain/model/team-worker.entity.js'

/**
 * Maps team worker resources to domain entities and vice versa
 */
export class TeamWorkerAssembler {
    /**
     * Converts a resource to a TeamWorkerEntity
     * @param {TeamWorkerResource} resource - Team worker resource
     * @returns {TeamWorkerEntity} Team worker entity
     */
    static toEntityFromResource(resource) {
        const entity = new TeamWorkerEntity()
        entity.id = resource.id
        entity.dni = resource.dni
        entity.fullName = resource.fullName
        entity.role = resource.role
        entity.isActive = resource.isActive
        entity.assignedTools = resource.assignedTools || []
        return entity
    }

    /**
     * Converts a TeamWorkerEntity to a resource
     * @param {TeamWorkerEntity} entity - Team worker entity
     * @returns {TeamWorkerResource} Team worker resource
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            dni: entity.dni,
            fullName: entity.fullName,
            role: entity.role,
            isActive: entity.isActive,
            assignedTools: entity.assignedTools
        }
    }

    /**
     * Converts an API response to an array of TeamWorkerEntities
     * @param {TeamWorkerResponse} response - API response
     * @returns {TeamWorkerEntity[]} Array of team worker entities
     */
    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response)) return []
        return response.map(resource => this.toEntityFromResource(resource))
    }

    /**
     * Converts an array of TeamWorkerEntities to an API response
     * @param {TeamWorkerEntity[]} entities - Array of team worker entities
     * @returns {TeamWorkerResponse} API response
     */
    static toResponseFromEntities(entities) {
        return entities.map(entity => this.toResourceFromEntity(entity))
    }
}