import { IdentityEntity } from '../domain/model/identity.entity.js';

/**
 * Maps identity resources to domain entities and vice versa.
 */
export class IdentityAssembler {
    /**
     * Converts a resource to an IdentityEntity
     * @param {import('./identity.response.js').IdentityResource} resource
     * @returns {IdentityEntity}
     */
    static toEntityFromResource(resource) {
        const entity = new IdentityEntity();
        entity.id = resource.id;
        entity.name = resource.name;
        entity.email = resource.email;
        entity.password = resource.password;
        entity.role = resource.role;
        return entity;
    }

    /**
     * Converts an IdentityEntity to a resource
     * @param {IdentityEntity} entity
     * @returns {import('./identity.response.js').IdentityResource}
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            name: entity.name,
            email: entity.email,
            password: entity.password,
            role: entity.role
        };
    }

    /**
     * Converts an API response array to IdentityEntity array
     * @param {import('./identity.response.js').IdentityResponse} response
     * @returns {IdentityEntity[]}
     */
    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response)) return [];
        return response.map(resource => this.toEntityFromResource(resource));
    }
}
