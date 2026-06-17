/**
 * @typedef {Object} UserDocumentResource
 * @property {string} id - User identifier
 * @property {string} fullName - User full name
 */

/**
 * @typedef {Object} DocumentResource
 * @property {string} id - Document identifier
 * @property {string} type - Document type
 * @property {boolean} isSigned - Whether document is signed
 * @property {string|null} digitalSignatureToken - Digital signature token
 * @property {string|Date} deadLine - Deadline for signing
 * @property {UserDocumentResource[]} assignedTo - Assigned users
 */

/**
 * @typedef {DocumentResource[]} DocumentResponse
 */