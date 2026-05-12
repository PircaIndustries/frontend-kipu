import { ref } from 'vue';

export const allProjects = ref([
    {
        id: '1',
        name: 'Edificio Los Alisos',
        location: 'Lima, Perú',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        budget: 1500000,
        progress: 45,
        status: 'En ejecución',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=500',
        members: 8,
        rnc: 3,
        pending: 5
    }
]);