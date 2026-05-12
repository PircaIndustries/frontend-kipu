/**
 * @typedef {Object} UserDocumentResource
 * @property {string} id - User identifier
 * @property {string} fullName - User full name
 * @property {string|Date} [signedAt] - Date when user signed
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