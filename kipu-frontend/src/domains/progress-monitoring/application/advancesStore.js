import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdvanceApi } from '../infrastructure/advance-api.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';
import i18n from '@/locales/i18n';

export const useAdvanceStore = defineStore('advances', () => {
    const api = new AdvanceApi();
    const projectsStore = useProjectsStore();

    const advances = ref([]);
    const isLoading = ref(false);
    const specialtyFilter = ref('');
    const searchFilter = ref('');
    const dateRange = ref({ start: null, end: null });

    const persistLocal = () => {
        const currentId = projectsStore.currentProjectId;
        if (currentId) {
            localStorage.setItem(`mock_advances_${currentId}`, JSON.stringify(advances.value));
        }
    };

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
            const currentId = projectsStore.currentProjectId;
            if (currentId) {
                const result = await api.getAll(currentId);
                advances.value = result;
                persistLocal();
            } else {
                advances.value = [];
            }
        } catch (error) {
            console.warn('Advance API failed, using local data.', error);
            const currentId = projectsStore.currentProjectId;
            if (currentId) {
                const localData = localStorage.getItem(`mock_advances_${currentId}`);
                advances.value = localData ? JSON.parse(localData) : [];
            } else {
                advances.value = [];
            }
        } finally {
            isLoading.value = false;
        }
    };

    const addAdvance = async (newEntry) => {
        if (!newEntry.isMiniAdvance) {
            const duplicate = advances.value.find(a => a.activityName === newEntry.activityName);
            if (duplicate) {throw new Error(i18n.global.t('errors.activity_exists')); return;}
        }
        const currentId = projectsStore.currentProjectId;
        if (!currentId) throw new Error(i18n.global.t('errors.no_active_project'));

        newEntry.projectId = currentId;

        try {
            const created = await api.create(newEntry);
            advances.value = [created, ...advances.value];
            persistLocal();
        } catch (error) {
            console.warn('Advance API create failed, saving locally.', error);
            newEntry.id = `adv-${Date.now()}`;
            newEntry.lastUpdate = new Date().toISOString();
            advances.value = [newEntry, ...advances.value];
            persistLocal();
        }
    };

    const getAdvanceById = (id) => {
        return advances.value.find(item => String(item.id) === String(id));
    };

    const updateAdvance = async (id, updatedData) => {
        try {
            const result = await api.update(id, updatedData);
            const index = advances.value.findIndex(item => String(item.id) === String(id));
            if (index !== -1) {
                advances.value[index] = result;
            }
            persistLocal();
        } catch (error) {
            console.warn('Advance API update failed, updating locally.', error);
            const index = advances.value.findIndex(item => String(item.id) === String(id));
            if (index !== -1) {
                updatedData.lastUpdate = new Date().toISOString();
                advances.value[index] = { ...advances.value[index], ...updatedData };
            }
            persistLocal();
        }
    };

    const deleteAdvance = async (id) => {
        try {
            await api.delete(id);
            advances.value = advances.value.filter(item => String(item.id) !== String(id));
            persistLocal();
        } catch (error) {
            console.warn('Advance API delete failed, deleting locally.', error);
            advances.value = advances.value.filter(item => String(item.id) !== String(id));
            persistLocal();
        }
    };

    const calendarEvents = computed(() => {
        return currentProjectAdvances.value.map(a => ({
            id: a.id,
            title: `${a.activityName} (${a.currentPercentage}%)`,
            start: a.lastUpdate,
            backgroundColor: a.currentPercentage >= 100 ? '#10B981' : '#3B82F6',
            extendedProps: {
                specialty: a.specialty,
                percentage: a.currentPercentage
            }
        }));
    });

    const addMiniAdvance = async (newEntry) => {
        const activityAdvances = advances.value.filter(a => a.activityName === newEntry.activityName);

        const currentSum = activityAdvances.reduce((sum, a) => sum + (a.currentPercentage || 0), 0);

        if (currentSum + newEntry.currentPercentage > 100) {
            throw new Error(i18n.global.t('errors.progress_exceeds'));
        }

        return await addAdvance(newEntry);
    };

    const groupedAdvances = computed(() => {
        const groups = {};
        filteredAdvances.value.forEach(a => {
            if (!groups[a.activityName]) {
                groups[a.activityName] = {
                    activityName: a.activityName,
                    specialty: a.specialty,
                    totalWeight: Number(a.weight || 0),
                    totalProgress: 0,
                    lastUpdate: a.lastUpdate
                };
            }
            groups[a.activityName].totalProgress += Number(a.currentPercentage || 0);
            if (new Date(a.lastUpdate) > new Date(groups[a.activityName].lastUpdate)) {
                groups[a.activityName].lastUpdate = a.lastUpdate;
            }
        });
        return Object.values(groups);
    });

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
        getAdvanceById,
        updateAdvance,
        deleteAdvance,
        setSpecialtyFilter,
        setSearchFilter,
        setDateRange,
        calendarEvents,
        groupedAdvances,
        addMiniAdvance
    };
});
