import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdvanceApi } from '../infrastructure/advance-api.js';
import { BudgetApi } from '@/domains/budget/infrastructure/budget-api.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';
import i18n from '@/locales/i18n';

export const useAdvanceStore = defineStore('advances', () => {
    const api = new AdvanceApi();
    const budgetApi = new BudgetApi();
    const projectsStore = useProjectsStore();

    const advances = ref([]);
    const isLoading = ref(false);
    const specialtyFilter = ref('');
    const searchFilter = ref('');
    const dateRange = ref({ start: null, end: null });

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
                advances.value = await api.getAll(currentId);
            } else {
                advances.value = [];
            }
        } catch (error) {
            console.error('Advance API failed.', error);
            advances.value = [];
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

        const created = await api.create(newEntry);
        const merged = { ...created, ...newEntry, id: created.id };

        budgetApi.create({
            projectId: merged.projectId,
            activityName: merged.activityName,
            details: merged.details || '',
            assignedBudget: 0
        });
        advances.value = [merged, ...advances.value];
    };

    const getAdvanceById = (id) => {
        return advances.value.find(item => String(item.id) === String(id));
    };

    const updateAdvance = async (id, updatedData) => {
        const result = await api.update(id, updatedData);
        const index = advances.value.findIndex(item => String(item.id) === String(id));
        if (index !== -1) {
            const merged = { ...advances.value[index], ...result };
            advances.value[index] = merged;
        }
    };

    const deleteAdvance = async (id) => {
        const advance = getAdvanceById(id);
        if (advance && advance.activityName) {
            try {
                const budgetItems = await budgetApi.findAll();
                const budgetItem = budgetItems.find(
                    bi => bi.activityName === advance.activityName &&
                          String(bi.projectId) === String(advance.projectId)
                );
                if (budgetItem) {
                    await budgetApi.delete(budgetItem.id);
                }
            } catch (e) {
                console.error('Failed to delete corresponding budget item.', e);
            }
        }
        await api.delete(id);
        advances.value = advances.value.filter(item => String(item.id) !== String(id));
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
