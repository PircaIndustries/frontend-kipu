import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdvanceApi } from '../infrastructure/advance-api.js';
import { allProjects } from '@/domains/project-management/data/projectsStore.js';

export const useAdvanceStore = defineStore('advances', () => {
    const api = new AdvanceApi();

    const advances = ref([]);
    const isLoading = ref(false);
    const specialtyFilter = ref('');
    const searchFilter = ref('');
    const dateRange = ref({ start: null, end: null });

    // Strictly filter by current project context
    const currentProjectAdvances = computed(() => {
        const currentId = allProjects.value.length > 0 ? String(allProjects.value[0].id) : null;
        return advances.value.filter(item => String(item.projectId) === currentId);
    });

    const filteredAdvances = computed(() => {
        let list = currentProjectAdvances.value;
        if (specialtyFilter.value) list = list.filter(item => item.specialty === specialtyFilter.value);
        if (searchFilter.value) {
            const query = searchFilter.value.toLowerCase();
            list = list.filter(item => item.activityName?.toLowerCase().includes(query));
        }
        if (dateRange.value.start && dateRange.value.end) {
            list = list.filter(item => {
                const itemDate = new Date(item.lastUpdate);
                return itemDate >= dateRange.value.start && itemDate <= dateRange.value.end;
            });
        }
        return list;
    });

    const loadAdvances = async () => {
        isLoading.value = true;
        try {
            advances.value = await api.getAll();
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
        }
    };

    const addAdvance = async (newEntry) => {
        try {
            const currentId = allProjects.value.length > 0 ? String(allProjects.value[0].id) : null;
            newEntry.projectId = currentId;
            const savedEntry = await api.create(newEntry);
            advances.value = [savedEntry, ...advances.value];
        } catch (error) {
            console.error(error);
        }
    };

    const setSpecialtyFilter = (v) => specialtyFilter.value = v;
    const setSearchFilter = (v) => searchFilter.value = v;
    const setDateRange = (start, end) => dateRange.value = { start, end };

    return { advances, isLoading, currentProjectAdvances, filteredAdvances, loadAdvances, addAdvance, setSpecialtyFilter, setSearchFilter, setDateRange };
});