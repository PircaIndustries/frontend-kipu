import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { projectsApi } from '../infrastructure/projects.api';
import { ProjectEntity, getRandomProjectImage } from '../domain/models/project.entity';
import { useAdvanceStore } from '../../progress-monitoring/application/advancesStore.js';

/**
 * Pinia store for project management.
 * Provides state, getters and actions for the entire application.
 *
 * Key getters for other developers:
 *   - currentProject      → full ProjectEntity of the selected project
 *   - currentProjectName  → string name of the selected project
 *   - hasProjectSelected  → boolean indicating if a project is active
 */
export const useProjectsStore = defineStore('projects', () => {
    // ── State ──
    const projects = ref([]);
    const currentProjectId = ref(localStorage.getItem('currentProjectId') || null);

    // ── Getters ──
    /**
     * Computed property to calculate the project status and progress dynamically.
     * It ensures a single source of truth for the project's progress and status.
     */
    const currentProject = computed(() => {
        const baseProject = projects.value.find(p => p.id === currentProjectId.value);
        if (!baseProject) return null;

        const advanceStore = useAdvanceStore();
        const projectAdvances = advanceStore.advances.filter(a => a.projectId === baseProject.id);

        // If no advances exist, it is in 'Planning' status with 0% progress
        if (projectAdvances.length === 0) {
            return {
                ...baseProject,
                progress: 0,
                status: 'Planificación' // Note: Ensure your i18n keys match this value
            };
        }

        // Weighted progress calculation: Sum(percentage * weight) / Sum(weights)
        const totalWeightedSum = projectAdvances.reduce((sum, item) =>
            sum + (Number(item.currentPercentage || 0) * Number(item.weight || 1)), 0);

        const totalWeight = projectAdvances.reduce((sum, item) =>
            sum + Number(item.weight || 1), 0);

        const calculatedProgress = totalWeight > 0 ? Math.round(totalWeightedSum / totalWeight) : 0;

        // Determine status: 100% means 'Finalizada', otherwise 'En ejecución'
        const calculatedStatus = calculatedProgress >= 100 ? 'Finalizada' : 'En ejecución';

        // Return the object, respecting the 'Paralizada' state if it was manually set
        return {
            ...baseProject,
            progress: calculatedProgress,
            status: baseProject.status === 'Paralizada' ? 'Paralizada' : calculatedStatus
        };
    });

    /** Name of the currently selected project (convenience getter for other modules). */
    const currentProjectName = computed(() => currentProject.value?.name || '');

    /** Whether a project is currently selected — used by the navigation guard. */
    const hasProjectSelected = computed(() => !!currentProjectId.value);

    /** Total count of loaded projects. */
    const totalProjects = computed(() => projects.value.length);

    // ── Persistence ──
    // Sync currentProjectId to localStorage on every change.
    watch(currentProjectId, (newId) => {
        if (newId) {
            localStorage.setItem('currentProjectId', newId);
        } else {
            localStorage.removeItem('currentProjectId');
        }
    });

    // ── Actions ──

    /**
     * Loads all projects from the API (cache-first).
     */
    async function loadProjects() {
        if (projects.value.length === 0) {
            try {
                const data = await projectsApi.getAll();
                projects.value = data.map(p => new ProjectEntity(p));
            } catch (error) {
                console.error('Failed to load projects:', error);
            }
        }
    }

    /**
     * Sets the current working project.
     * @param {string} id - Project identifier
     */
    function setCurrentProject(id) {
        currentProjectId.value = id;
    }

    /**
     * Clears the current project selection.
     */
    function clearCurrentProject() {
        currentProjectId.value = null;
    }

    /**
     * Creates a new project. Assigns a random local image automatically.
     * @param {Object} projectData
     * @returns {Promise<ProjectEntity>}
     */
    /**
     * Creates a new project. Assigns a random local image automatically.
     * @param {Object} projectData
     * @returns {Promise<ProjectEntity>}
     */
    async function addProject(projectData) {
        try {
            const initialStatus = projectData.status || 'Planificación';
            const payload = {
                ...projectData,
                image: getRandomProjectImage(),
                progress: 0,
                members: 1,
                rnc: 0,
                pending: 0,
                statusLogs: [
                    {
                        id: `log-${Date.now()}`,
                        status: initialStatus,
                        date: new Date().toISOString().split('T')[0],
                        justification: 'Proyecto creado e iniciado.',
                        progress: initialStatus === 'En ejecución' ? 45 : 12
                    }
                ],
                documents: []
            };
            const created = await projectsApi.create(payload);
            const entity = new ProjectEntity(created);
            projects.value.unshift(entity);
            return entity;
        } catch (error) {
            console.error('Failed to add project:', error);
            throw error;
        }
    }

    /**
     * Checks whether a project name already exists via GET filter to json-server.
     * @param {string} name
     * @returns {Promise<boolean>}
     */
    function checkNameExists(name) {
        return projectsApi.checkNameExists(name);
    }

    /**
     * Updates the status of a project and persists the justification in a 1:N StatusLog collection.
     * When progress is provided (number), it also updates the progress bar.
     * @param {string} id
     * @param {string} status
     * @param {string} [justification]
     * @param {number|null} [progress] - Auto-set progress, null keeps current value
     */
    async function updateProjectStatus(id, status, justification, progress) {
        try {
            const project = projects.value.find(p => p.id === id);
            if (!project) throw new Error('Project not found');

            const currentProgress = typeof progress === 'number' ? progress : project.progress;
            const newLogEntry = {
                id: `log-${Date.now()}`,
                status: status,
                date: new Date().toISOString().split('T')[0],
                justification: justification || 'Cambio de estado del proyecto.',
                progress: currentProgress
            };

            const updatedLogs = [...(project.statusLogs || []), newLogEntry];

            const payload = {
                status,
                statusJustification: justification || '',
                statusLogs: updatedLogs
            };
            if (typeof progress === 'number') {
                payload.progress = progress;
            }

            const updated = await projectsApi.updateStatus(id, payload);
            projects.value = projects.value.map(p =>
                p.id === id ? new ProjectEntity(updated) : p
            );
        } catch (error) {
            console.error('Failed to update project status:', error);
            throw error;
        }
    }

    /**
     * Adds a new document/blueprint to a project.
     * @param {string} projectId
     * @param {Object} documentData
     */
    async function addProjectDocument(projectId, documentData) {
        try {
            const project = projects.value.find(p => p.id === projectId);
            if (!project) throw new Error('Project not found');

            const newDoc = {
                id: `doc-proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: documentData.name,
                type: documentData.type || 'Plano',
                version: documentData.version || 'v1.0',
                uploadDate: new Date().toISOString().split('T')[0],
                isSigned: documentData.isSigned || false,
                deadline: documentData.deadline || ''
            };

            const updatedDocs = [...(project.documents || []), newDoc];

            const updated = await projectsApi.updateStatus(projectId, { documents: updatedDocs });
            projects.value = projects.value.map(p =>
                p.id === projectId ? new ProjectEntity(updated) : p
            );
            return newDoc;
        } catch (error) {
            console.error('Failed to add project document:', error);
            throw error;
        }
    }

    /**
     * Deletes a project.
     * @param {string} id
     */
    async function deleteProject(id) {
        try {
            await projectsApi.delete(id);
            projects.value = projects.value.filter(p => p.id !== id);
            if (currentProjectId.value === id) {
                currentProjectId.value = null;
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    }

    /**
     * Helper to sync the calculated progress to the backend.
     * Call this after adding or updating an advance.
     */
    async function syncProjectProgress() {
        if (!currentProject.value) return;

        try {
            await updateProjectStatus(
                currentProject.value.id,
                currentProject.value.status,
                'Auto-sync weighted progress',
                currentProject.value.progress
            );
        } catch (error) {
            console.error('Failed to sync progress:', error);
        }
    }

    return {
        // State
        projects,
        currentProjectId,
        // Getters (for other developers)
        currentProject,
        currentProjectName,
        hasProjectSelected,
        totalProjects,
        // Actions
        loadProjects,
        setCurrentProject,
        clearCurrentProject,
        addProject,
        checkNameExists,
        updateProjectStatus,
        addProjectDocument,
        deleteProject,
        syncProjectProgress
    };
});
