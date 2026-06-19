/**
 * @class BaseEndpointLocal
 */

export class BaseEndpointLocal {
    /**
     * @param {import('./base-api-local.js').BaseApiLocal} baseApiLocal
     * @param {string} endpointPath
     */
    constructor(baseApiLocal, endpointPath) {
        this.http = baseApiLocal.http;
        this.endpointPath = endpointPath;
    }

    /**
     *
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getAll(){
        return this.http.get(this.endpointPath);
    }

    /**
     * @param {string|number} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */

    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
    }

    /**
     *
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */

    create(resource) {
        return this.http.post(this.endpointPath, resource);
    }

    /**
     *
     * @param {string|number} id
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */

    update(id, resource) {
        return this.http.put(`${this.endpointPath}/${id}`, resource);
    }

    /**
     * @param {string|number} id -
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}