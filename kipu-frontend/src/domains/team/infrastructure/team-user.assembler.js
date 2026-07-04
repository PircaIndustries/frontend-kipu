import { TeamUserEntity } from '../domain/model/team-user.entity.js'

export class TeamUserAssembler {
    static toEntityFromResource(resource) {
        const entity = new TeamUserEntity()
        entity.id = resource.id
        entity.userId = resource.userId
        entity.fullName = resource.fullName
        entity.email = resource.email
        entity.isActive = resource.isActive !== undefined ? resource.isActive : true
        entity.role = resource.role
        entity.projectId = resource.projectId || ''
        return entity;
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            userId: entity.userId,
            fullName: entity.fullName,
            email: entity.email,
            isActive: entity.isActive,
            role: entity.role,
            projectId: entity.projectId
        }
    }

    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response)) return []
        return response.map(resource => this.toEntityFromResource(resource))
    }

    static toResponseFromEntities(entities) {
        return entities.map(entity => this.toResourceFromEntity(entity))
    }
}
