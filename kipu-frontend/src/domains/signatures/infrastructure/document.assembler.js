import { DocumentEntity } from '../domain/model/document.entity.js';

export class DocumentAssembler {
    /**
     * Transforma el DTO de C# (DocumentResource) en una Entidad JS
     */
    static toEntityFromResource(resource) {
        const entity = new DocumentEntity();
        entity.id = resource.id;
        entity.type = resource.type;
        entity.isSigned = resource.isSigned;
        entity.digitalSignatureToken = resource.digitalSignatureToken;

        // Controlamos que lea de deadline o deadLine según provenga de la serialización
        entity.deadLine = new Date(resource.deadline || resource.deadLine);

        // Mapeamos el campo participants del C# hacia tu lista interna assignedTo
        const rawParticipants = resource.participants || resource.assignedTo || [];
        entity.assignedTo = rawParticipants.map((user) => this.toUserDocumentEntity(user));

        entity.projectId = resource.projectId || '';
        return entity;
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            type: entity.type,
            isSigned: entity.isSigned,
            digitalSignatureToken: entity.digitalSignatureToken,
            deadline: entity.deadLine.toISOString(),
            participants: entity.assignedTo.map((user) => this.toUserDocumentResource(user)),
            projectId: entity.projectId,
        };
    }

    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response)) return [];
        return response.map((resource) => this.toEntityFromResource(resource));
    }

    static toResponseFromEntities(entities) {
        return entities.map((entity) => this.toResourceFromEntity(entity));
    }

    static toUserDocumentEntity(resource) {
        return {
            id: resource.teamUserId || resource.id,
            fullName: resource.fullName,
            signedAt: resource.signedAt || null
        };
    }

    static toUserDocumentResource(entity) {
        return {
            teamUserId: entity.id,
            fullName: entity.fullName
        };
    }
}