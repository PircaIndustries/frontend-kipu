import axios from "axios";

const apiURL = import.meta.env.BASE_URL;

/**
 * @class BaseApi
 */

export class BaseApi {
    /**
     * @private
     * @type {import('axios').AxiosInstance}
     */
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: apiURL,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })
    }

    /**
     *
     * @returns {axios.AxiosInstance}
     */
    get http() {
        return  this.#http;
    }
}