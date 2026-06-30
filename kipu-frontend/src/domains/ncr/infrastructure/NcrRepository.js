import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_KIPU_BASEURL || 'http://localhost:5230/api/v1';
const API_URL = `${BASE_URL}/ncrs`;


export class NcrRepository {
    async getAll() {
        try {
            const { data } = await axios.get(API_URL);
            return data;
        } catch (error) {
            console.error("Error al obtener NCRs:", error);
            return [];
        }
    }

    async save(ncrData) {
        try {
            const { data } = await axios.post(API_URL, ncrData);
            return data;
        } catch (error) {
            console.error("Error al guardar NCR:", error);
            throw error;
        }
    }
}