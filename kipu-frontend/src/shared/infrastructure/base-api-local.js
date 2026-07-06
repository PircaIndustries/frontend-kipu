import axios from "axios";

const apiURL = import.meta.env.VITE_API_KIPU_BASEURL || import.meta.env.VITE_API_KIPU_BASEURL_LOCAL || 'http://localhost:5230/api/v1';

/**
 * @class BaseApiLocal
 */

export class BaseApiLocal {
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
        });

        this.#http.interceptors.request.use((config) => {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user && user.token) {
                        config.headers.Authorization = `Bearer ${user.token}`;
                    }
                } catch (e) {
                    console.error('Error parsing currentUser from localStorage', e);
                }
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
    }

    /**
     *
     * @returns {axios.AxiosInstance}
     */
    get http() {
        return  this.#http;
    }
}