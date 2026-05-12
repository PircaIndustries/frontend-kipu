import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
import { DocumentEntity } from '../domain/model/document.entity.js';
import { DocumentAssembler } from './document.assembler.js';

/**
 * Infrastructure gateway for Document bounded-context endpoints.
 */
@Injectable({
    providedIn: 'root',
})
export class DocumentApi {
    http = inject(HttpClient);
    apiBaseUrl = import.meta.env.VITE_API_KIPU_BASEURL;
    documentsEndpoint = import.meta.env.VITE_API_KIPU_DOCUMENTS_ENDPOINT;
    documentsUrl = `${this.apiBaseUrl}${this.documentsEndpoint}`;

    /**
     * @returns {Observable<DocumentEntity[]>} Observable of document entities
     */
    getAllDocuments() {
        return this.http
            .get(this.documentsUrl)
            .pipe(map((response) => DocumentAssembler.toEntitiesFromResponse(response)));
    }

    /**
     * @param {string} projectId - Project identifier
     * @returns {Observable<DocumentEntity[]>} Observable of document entities
     */
    getDocumentsByProject(projectId) {
        const url = `${this.documentsUrl}?projectId=${projectId}`;
        return this.http
            .get(url)
            .pipe(map((response) => DocumentAssembler.toEntitiesFromResponse(response)));
    }

    /**
     * @param {string} id - Document identifier
     * @returns {Observable<DocumentEntity>} Observable of document entity
     */
    getDocumentById(id) {
        const url = `${this.documentsUrl}/${id}`;
        return this.http
            .get(url)
            .pipe(map((resource) => DocumentAssembler.toEntityFromResource(resource)));
    }

    /**
     * @param {DocumentEntity} document - Document entity to create
     * @returns {Observable<DocumentEntity>} Observable of created document
     */
    postDocument(document) {
        const resource = DocumentAssembler.toResourceFromEntity(document);
        return this.http
            .post(this.documentsUrl, resource)
            .pipe(map((createdResource) => DocumentAssembler.toEntityFromResource(createdResource)));
    }

    /**
     * @param {DocumentEntity} document - Document entity to update
     * @returns {Observable<DocumentEntity>} Observable of updated document
     */
    updateDocument(document) {
        const url = `${this.documentsUrl}/${document.id}`;
        return this.http.put(url, document).pipe(
            tap(() => console.log('Documento actualizado en API:', document)),
            catchError((error) => {
                console.error('Error en updateDocument:', error);
                throw error;
            }),
        );
    }

    /**
     * @param {string} id - Document identifier
     * @returns {Observable<void>} Observable of delete operation
     */
    deleteDocument(id) {
        const url = `${this.documentsUrl}/${id}`;
        return this.http.delete(url);
    }
}