import { ref } from 'vue';

/**
 * Shared state for Work Advances.
 * Acts as a temporary data store that persists during navigation.
 */
export const allAdvances = ref([
    {
        id: '1',
        projectId: '1',
        date: '2026-04-18',
        activity: 'Vaciado de Losa N3',
        sector: 'Nivel 3 - Eje A-F',
        specialty: 'Estructuras',
        progress: 100,
        status: 'COMPLETED',
        photoUrl: 'https://plus.unsplash.com/premium_photo-1661861764549-197296f20351?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmFjaWFkbyUyMGxvc2F8ZW58MHx8MHx8fDA%3D'
    },
    {
        id: '2',
        projectId: '1',
        date: '2026-04-17',
        activity: 'Instalación Eléctrica',
        sector: 'Nivel 2 - Oficinas',
        specialty: 'Instalaciones',
        progress: 65,
        status: 'IN_PROGRESS',
        photoUrl: 'https://images.pexels.com/photos/585418/pexels-photo-585418.jpeg'
    },
    {
        id: '3',
        projectId: '1',
        date: '2026-04-16',
        activity: 'Acabado de Muros',
        sector: 'Fachada Posterior',
        specialty: 'Arquitectura',
        progress: 30,
        status: 'DELAYED',
        photoUrl: 'https://plus.unsplash.com/premium_photo-1683134669278-179ab90ae04a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGFjYWJhZG8lMjBtdXJvcyUyMGNvbnN0cnVjY2lvbnxlbnwwfHwwfHx8MA%3D%3D'
    }
]);