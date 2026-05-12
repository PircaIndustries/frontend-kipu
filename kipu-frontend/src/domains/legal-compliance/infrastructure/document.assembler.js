// infrastructure/document.assembler.js

import { DocumentEntity } from "../domain/model/document.entity.js";

/**
 * Maps publishing document resources into domain entities.
 *
 * @class DocumentAssembler
 */
export class DocumentAssembler {
    /**
     * @param {Object} resource - Document resource payload.
     * @returns {DocumentEntity} Document entity.
     */
    static toEntityFromResource(resource) {
        return new DocumentEntity({
            id: resource.id,
            type: resource.type,
            isSigned: resource.isSigned,
            digitalSignatureToken: resource.digitalSignatureToken,
            deadLine: resource.deadLine
        });
    }

    /**
     * Parses document resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with document resources.
     * @returns {DocumentEntity[]} Document entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['documents'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * Converts a Document entity to a plain object for API requests.
     * @param {DocumentEntity} document - Document entity.
     * @returns {Object} Plain object ready for API.
     */
    static toResourceFromEntity(document) {
        return {
            id: document.id,
            type: document.type,
            isSigned: document.isSigned,
            digitalSignatureToken: document.digitalSignatureToken,
            deadLine: document.deadLine ? document.deadLine.toISOString() : null
        };
    }
}