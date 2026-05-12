import { DocumentEntity } from '../domain/model/document.entity.js';

export class DocumentAssembler {
    /**
     * @param {DocumentResource} resource - Document resource payload
     * @returns {DocumentEntity} Document entity
     */
    static toEntityFromResource(resource) {
        const entity = new DocumentEntity();
        entity.id = resource.id;
        entity.type = resource.type;
        entity.isSigned = resource.isSigned;
        entity.digitalSignatureToken = resource.digitalSignatureToken;
        entity.deadLine = new Date(resource.deadLine);
        entity.assignedTo = resource.assignedTo.map((user) => this.toUserDocumentEntity(user));
        return entity;
    }

    /**
     * @param {DocumentEntity} entity - Document entity
     * @returns {DocumentResource} Document resource
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            type: entity.type,
            isSigned: entity.isSigned,
            digitalSignatureToken: entity.digitalSignatureToken,
            deadLine: entity.deadLine.toISOString(),
            assignedTo: entity.assignedTo.map((user) => this.toUserDocumentResource(user)),
        };
    }

    /**
     * @param {DocumentResponse} response - API response
     * @returns {DocumentEntity[]} Array of document entities
     */
    static toEntitiesFromResponse(response) {
        return response.map((resource) => this.toEntityFromResource(resource));
    }

    /**
     * @param {DocumentEntity[]} entities - Array of document entities
     * @returns {DocumentResponse} API response
     */
    static toResponseFromEntities(entities) {
        return entities.map((entity) => this.toResourceFromEntity(entity));
    }

    /**
     * @param {UserDocumentResource} resource - User resource
     * @returns {UserDocument} User document object
     * @private
     */
    static toUserDocumentEntity(resource) {
        return {
            id: resource.id,
            fullName: resource.fullName,
            signedAt: resource.signedAt ? new Date(resource.signedAt) : undefined,
        };
    }

    /**
     * Converts a UserDocument object to a user resource.
     * @param {UserDocument} entity - User document object
     * @returns {UserDocumentResource} User resource
     * @private
     */
    static toUserDocumentResource(entity) {
        return {
            id: entity.id,
            fullName: entity.fullName,
            signedAt: entity.signedAt?.toISOString(),
        };
    }
}