import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdvanceApi } from '../infrastructure/advance-api.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

export const useAdvanceStore = defineStore('advances', () => {
    const api = new AdvanceApi();
    const projectsStore = useProjectsStore();

    const advances = ref([]);
    const isLoading = ref(false);
    const specialtyFilter = ref('');
    const searchFilter = ref('');
    const dateRange = ref({ start: null, end: null });

    // ADDED: Strictly filter by current project context using useProjectsStore
    const currentProjectAdvances = computed(() => {
        const currentId = projectsStore.currentProjectId;
        if (!currentId) return [];
        return advances.value.filter(item => String(item.projectId) === String(currentId));
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
            // ADDED: Assign current project ID to the new entry
            const currentId = projectsStore.currentProjectId;
            if (!currentId) throw new Error("No active project selected");

            newEntry.projectId = currentId;
            const savedEntry = await api.create(newEntry);
            advances.value = [savedEntry, ...advances.value];
        } catch (error) {
            console.error(error);
        }
    };

    // ADDED: Action to retrieve a single advance for editing
    const getAdvanceById = (id) => {
        return advances.value.find(item => String(item.id) === String(id));
    };

    // ADDED: Action to update an existing advance
    const updateAdvance = async (id, updatedData) => {
        try {
            const updatedEntry = await api.update(id, updatedData);
            const index = advances.value.findIndex(item => String(item.id) === String(id));
            if (index !== -1) {
                advances.value[index] = updatedEntry;
            }
        } catch (error) {
            console.error(error);
        }
    };

    // ADDED: Action to delete an advance
    const deleteAdvance = async (id) => {
        try {
            await api.delete(id);
            advances.value = advances.value.filter(item => String(item.id) !== String(id));
        } catch (error) {
            console.error(error);
        }
    };

    const setSpecialtyFilter = (v) => specialtyFilter.value = v;
    const setSearchFilter = (v) => searchFilter.value = v;
    const setDateRange = (start, end) => dateRange.value = { start, end };

    return {
        advances,
        isLoading,
        currentProjectAdvances,
        filteredAdvances,
        loadAdvances,
        addAdvance,
        // ADDED: Export new actions
        getAdvanceById,
        updateAdvance,
        deleteAdvance,
        setSpecialtyFilter,
        setSearchFilter,
        setDateRange
    };
});