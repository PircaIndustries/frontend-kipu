import { Injectable, signal } from '@angular/core';
import { DocumentEntity } from '../domain/model/document.entity.js';
import { DocumentApi } from '../infrastructure/document.api.js';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentsStore {
    #documentsSignal = signal([]);
    #currentTokenSignal = signal(null);
    #currentDocumentIdSignal = signal(null);

    documents$ = this.#documentsSignal.asReadonly();
    currentToken$ = this.#currentTokenSignal.asReadonly();

    /**
     * @param {DocumentApi} documentApi - Document API service
     */
    constructor(documentApi) {
        /** @private */
        this.documentApi = documentApi;
    }

    /**
     * @returns {void}
     */
    loadAllDocuments() {
        this.documentApi.getAllDocuments().subscribe({
            next: (docs) => {
                this.#documentsSignal.set(docs);
            },
            error: (err) => {
                console.error('Error al cargar documentos:', err);
            },
        });
    }

    /**
     * @param {DocumentEntity} document - Document entity to add
     * @returns {void}
     */
    addLocalDocument(document) {
        this.#documentsSignal.update((currentDocs) => [...currentDocs, document]);
        console.log('📄 Documento añadido localmente:', document);
    }

    /**
     * @param {DocumentEntity} updatedDocument - Updated document entity
     * @returns {void}
     */
    updateLocalDocument(updatedDocument) {
        const currentDocs = this.#documentsSignal();
        const index = currentDocs.findIndex((d) => d.id === updatedDocument.id);

        if (index !== -1) {
            const newDocs = [...currentDocs];
            newDocs[index] = updatedDocument;
            this.#documentsSignal.set(newDocs);
            console.log('📄 Documento actualizado localmente:', updatedDocument);
        }
    }

    /**
     * @param {string} documentId - Document ID to generate token for
     * @returns {string} Generated token
     */
    generateToken(documentId) {
        const token = 123456;
        this.#currentTokenSignal.set(token);
        this.#currentDocumentIdSignal.set(documentId);
        console.log(`Token generado: ${token} para documento ${documentId}`);
        return token;
    }

    /**
     * @param {string} token - Digital signature token for verification
     * @returns {Observable<{success: boolean, message: string}>} Result of sign operation
     */
    verifyAndSign(token) {
        const activeToken = this.#currentTokenSignal();
        const activeDocumentId = this.#currentDocumentIdSignal();

        if (!activeToken || !activeDocumentId) {
            return of({ success: false, message: 'No hay un proceso de firma activo' });
        }

        if (token !== activeToken) {
            return of({ success: false, message: 'Token incorrecto' });
        }

        const documentToUpdate = this.#documentsSignal().find((d) => d.id === activeDocumentId);

        if (!documentToUpdate) {
            return of({ success: false, message: 'Documento no encontrado' });
        }

        if (documentToUpdate.isSigned) {
            return of({ success: false, message: 'Este documento ya está firmado' });
        }

        const updatedDocument = {
            ...documentToUpdate,
            isSigned: true,
            digitalSignatureToken: token,
        };

        this.#currentTokenSignal.set(null);
        this.#currentDocumentIdSignal.set(null);

        return this.documentApi.updateDocument(updatedDocument).pipe(
            map((response) => {
                const currentDocs = this.#documentsSignal();
                const index = currentDocs.findIndex((d) => d.id === response.id);
                if (index !== -1) {
                    const newDocs = [...currentDocs];
                    newDocs[index] = response;
                    this.#documentsSignal.set(newDocs);
                }
                return {
                    success: true,
                    message: 'Documento firmado exitosamente',
                };
            }),
            catchError((error) => {
                console.error('Error al actualizar:', error);
                return of({
                    success: false,
                    message: 'Error al guardar la firma: ' + (error.error?.message || error.message),
                });
            }),
        );
    }

    /**
     * @returns {void}
     */
    cancelSignature() {
        this.#currentTokenSignal.set(null);
        this.#currentDocumentIdSignal.set(null);
        console.log('🔐 Proceso de firma cancelado');
    }

    /**
     * @returns {boolean} True if active signature exists
     */
    hasActiveSignature() {
        return this.#currentTokenSignal() !== null && this.#currentDocumentIdSignal() !== null;
    }

    /**
     * @returns {DocumentEntity[]} Pending documents
     */
    getPendingDocuments() {
        return this.#documentsSignal().filter((doc) => !doc.isSigned);
    }

    /**
     * @returns {DocumentEntity[]} Signed documents
     */
    getSignedDocuments() {
        return this.#documentsSignal().filter((doc) => doc.isSigned);
    }

    /**
     * @param {string} type - Document type
     * @returns {DocumentEntity[]} Documents matching the type
     */
    getDocumentsByType(type) {
        return this.#documentsSignal().filter((doc) => doc.type === type);
    }
}