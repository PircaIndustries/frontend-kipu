import { TeamUserEntity } from '../domain/model/team-user.entity.js'

/**
 * Maps team user resources to domain entities and vice versa
 */
export class TeamUserAssembler {
    /**
     * Converts a resource to a TeamUserEntity
     * @param {TeamUserResource} resource - Team user resource
     * @returns {TeamUserEntity} Team user entity
     */
    static toEntityFromResource(resource) {
        const entity = new TeamUserEntity()
        entity.id = resource.id
        entity.fullName = resource.fullName
        entity.email = resource.email
        entity.isActive = resource.isActive
        entity.role = resource.role
        return entity
    }

    /**
     * Converts a TeamUserEntity to a resource
     * @param {TeamUserEntity} entity - Team user entity
     * @returns {TeamUserResource} Team user resource
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            isActive: entity.isActive,
            role: entity.role
        }
    }

    /**
     * Converts an API response to an array of TeamUserEntities
     * @param {TeamUserResponse} response - API response
     * @returns {TeamUserEntity[]} Array of team user entities
     */
    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response)) return []
        return response.map(resource => this.toEntityFromResource(resource))
    }

    /**
     * Converts an array of TeamUserEntities to an API response
     * @param {TeamUserEntity[]} entities - Array of team user entities
     * @returns {TeamUserResponse} API response
     */
    static toResponseFromEntities(entities) {
        return entities.map(entity => this.toResourceFromEntity(entity))
    }
}