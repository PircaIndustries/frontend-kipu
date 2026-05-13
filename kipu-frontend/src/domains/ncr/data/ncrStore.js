import { ref } from 'vue';

export const allNcrs = ref([
    {
        id: '1',
        projectId: '1',
        date: '2026-04-20',
        ncrTitle: 'Fisura en Losa N3',
        ncrDescription: 'Se detectó una fisura longitudinal tras el desencofrado.',
        specialty: 'Estructuras',
        severityLevel: 'Alto',
        photoUrl: 'https://i.pinimg.com/736x/29/7b/a1/297ba161005c3fef3978dd086c8bc76f.jpg'
    }
]);

/**
 * Función para agregar un nuevo NCR al store
 * @param {Object} newNcr - Objeto con la estructura del modelo NCR
 */
export const addNcr = (newNcr) => {
    allNcrs.value.unshift(newNcr); // Agregamos al inicio para que aparezca primero en la lista
};