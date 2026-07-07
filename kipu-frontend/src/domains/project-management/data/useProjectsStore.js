import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { projectsApi } from '../infrastructure/projects.api.js';
import i18n from '@/locales/i18n';
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
        const baseProject = projects.value.find(p => String(p.id) === String(currentProjectId.value));
        if (!baseProject) return null;

        const advanceStore = useAdvanceStore();
        const projectAdvances = advanceStore.advances.filter(a => a.projectId === baseProject.id);

        // If no advances exist, it is in 'Planning' status with 0% progress (unless it is halted)
        if (projectAdvances.length === 0) {
            return {
                ...baseProject,
                progress: 0,
                status: baseProject.status === 'Paralizada' ? 'Paralizada' : 'Planificación' // Note: Ensure your i18n keys match this value
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
        try {
            const data = await projectsApi.getAll();
            projects.value = data.map(p => {
                const entity = new ProjectEntity(p);
                // Load local documents and logs if they exist (preserving previous logic if it was there)
                const localDocs = localStorage.getItem(`mock_docs_${entity.id}`);
                if (localDocs) entity.documents = JSON.parse(localDocs);
                const localLogs = localStorage.getItem(`mock_logs_${entity.id}`);
                if (localLogs) entity.statusLogs = JSON.parse(localLogs);
                
                // Load local images
                const localImages = JSON.parse(localStorage.getItem('mock_images') || '{}');
                if (localImages[entity.id]) {
                    entity.image = localImages[entity.id].imageUrl || entity.image;
                    entity.imageId = localImages[entity.id].imageId;
                    entity.imageUrl = localImages[entity.id].imageUrl;
                }
                
                return entity;
            });
        } catch (error) {
            console.error('🔍 loadProjects - ERROR:', error);
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
    async function addProject(projectData) {
        try {
            const initialStatus = projectData.status || 'Planificación';
            const payload = {
                ...projectData,
                image: projectData.imageUrl || getRandomProjectImage(),
                imageId: projectData.imageId || null,
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
            
            if (projectData.imageUrl) {
                entity.image = projectData.imageUrl;
                entity.imageUrl = projectData.imageUrl;
                entity.imageId = projectData.imageId;
                
                const localImages = JSON.parse(localStorage.getItem('mock_images') || '{}');
                localImages[entity.id] = { imageUrl: projectData.imageUrl, imageId: projectData.imageId };
                localStorage.setItem('mock_images', JSON.stringify(localImages));
            }
            
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

    async function updateProject(id, projectData) {
        try {
            const index = projects.value.findIndex(p => String(p.id) === String(id));
            if (index === -1) throw new Error('Project not found');
            
            projects.value[index] = {
                ...projects.value[index],
                ...projectData
            };
            
            if (projectData.imageUrl) {
                const localImages = JSON.parse(localStorage.getItem('mock_images') || '{}');
                localImages[id] = { imageUrl: projectData.imageUrl, imageId: projectData.imageId };
                localStorage.setItem('mock_images', JSON.stringify(localImages));
            }
            
            localStorage.setItem('mock_projects', JSON.stringify(projects.value));
            return projects.value[index];
        } catch(error) {
            console.error('Error updating project:', error);
            throw error;
        }
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
            const project = projects.value.find(p => String(p.id) === String(id));
            if (!project) throw new Error(i18n.global.t('errors.project_not_found'));

            const currentProgress = typeof progress === 'number' ? progress : project.progress;
            
            const userStr = localStorage.getItem('currentUser');
            let author = 'Sistema';
            if (userStr) {
                try {
                    const u = JSON.parse(userStr);
                    author = u.name || u.fullName || u.email || 'Sistema';
                } catch(e) {}
            }
            
            const newLogEntry = {
                id: `log-${Date.now()}`,
                status: status,
                date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                justification: justification || 'Cambio de estado del proyecto.',
                progress: currentProgress,
                author: author
            };

            const updatedLogs = [...(project.statusLogs || []), newLogEntry];

            const payload = {
                status,
                statusJustification: justification || 'Cambio de estado del proyecto.',
                statusLogs: updatedLogs
            };
            if (typeof progress === 'number') {
                payload.progress = progress;
            }

            const updated = await projectsApi.updateStatus(id, payload);
            
            // Re-attach local data
            updated.documents = project.documents;
            updated.statusLogs = updatedLogs;

            projects.value = projects.value.map(p =>
                String(p.id) === String(id) ? new ProjectEntity(updated) : p
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
            const project = projects.value.find(p => String(p.id) === String(projectId));
            if (!project) throw new Error(i18n.global.t('errors.project_not_found'));

            const newDoc = {
                id: `doc-proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: documentData.name,
                type: documentData.type || 'Plano',
                fileId: documentData.fileId || null,
                fileName: documentData.fileName || '',
                uploadDate: new Date().toISOString().split('T')[0]
            };

            const updatedDocs = [...(project.documents || []), newDoc];

            project.documents = updatedDocs;
            
            return newDoc;
        } catch (error) {
            console.error('Failed to add project document:', error);
            throw error;
        }
    }

    async function updateProjectDocument(projectId, docId, updates) {
        try {
            const project = projects.value.find(p => String(p.id) === String(projectId));
            if (!project) throw new Error(i18n.global.t('errors.project_not_found'));

            const updatedDocs = (project.documents || []).map(d => 
                d.id === docId ? { ...d, ...updates } : d
            );

            project.documents = updatedDocs;
        } catch (error) {
            console.error('Failed to update project document:', error);
            throw error;
        }
    }

    async function deleteProjectDocument(projectId, docId) {
        try {
            const project = projects.value.find(p => String(p.id) === String(projectId));
            if (!project) throw new Error(i18n.global.t('errors.project_not_found'));

            const updatedDocs = (project.documents || []).filter(d => d.id !== docId);

            project.documents = updatedDocs;
        } catch (error) {
            console.error('Failed to delete project document:', error);
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
            if (String(currentProjectId.value) === String(id)) {
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
        updateProject,
        checkNameExists,
        updateProjectStatus,
        addProjectDocument,
        updateProjectDocument,
        deleteProjectDocument,
        deleteProject,
        syncProjectProgress
    };
});
