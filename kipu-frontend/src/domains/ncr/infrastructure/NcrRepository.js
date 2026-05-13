import axios from 'axios';

const API_URL = 'http://localhost:3000/ncrs';


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