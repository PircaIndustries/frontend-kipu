import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { projectsApi } from '../infrastructure/projects.api';
import { ProjectEntity } from '../domain/models/project.entity';

/**
 * Pinia store for project management.
 * Translated from Angular's ProjectsStore using Composition API.
 * Signals → refs, computed signals → computed properties.
 */
export const useProjectsStore = defineStore('projects', () => {
    // ── State (equivalent to Angular signals) ──
    const projects = ref([]);
    const currentProjectId = ref(localStorage.getItem('currentProjectId') || null);

    // ── Getters (equivalent to Angular computed signals) ──
    const currentProject = computed(() =>
        projects.value.find(p => p.id === currentProjectId.value) || null
    );

    const totalProjects = computed(() => projects.value.length);

    // ── Actions ──

    /**
     * Loads all projects from the API.
     * Only fetches if the local list is empty (cache-first strategy).
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
     * Sets the current working project and persists the selection.
     * @param {string} id - Project identifier
     */
    function setCurrentProject(id) {
        localStorage.setItem('currentProjectId', id);
        currentProjectId.value = id;
    }

    /**
     * Creates a new project via the API and adds it to the local store.
     * @param {Object} projectData - Project data to create
     * @returns {Promise<ProjectEntity>} The created project
     */
    async function addProject(projectData) {
        try {
            const newProject = await projectsApi.create(projectData);
            const entity = new ProjectEntity(newProject);
            projects.value.unshift(entity);
            return entity;
        } catch (error) {
            console.error('Failed to add project:', error);
            throw error;
        }
    }

    /**
     * Checks whether a project name is already taken.
     * @param {string} name - Project name to verify
     * @returns {Promise<boolean>}
     */
    function checkNameExists(name) {
        return projectsApi.checkNameExists(name);
    }

    /**
     * Updates the status of a project and refreshes the local copy.
     * @param {string} id - Project identifier
     * @param {string} status - New status value
     * @param {string} [justification] - Optional status change reason
     */
    async function updateProjectStatus(id, status, justification) {
        try {
            const updatedProject = await projectsApi.updateStatus(id, {
                status,
                statusJustification: justification
            });
            projects.value = projects.value.map(p =>
                p.id === id ? new ProjectEntity(updatedProject) : p
            );
        } catch (error) {
            console.error('Failed to update project status:', error);
            throw error;
        }
    }

    /**
     * Deletes a project and clears it from current selection if necessary.
     * @param {string} id - Project identifier
     */
    async function deleteProject(id) {
        try {
            await projectsApi.delete(id);
            projects.value = projects.value.filter(p => p.id !== id);
            if (currentProjectId.value === id) {
                currentProjectId.value = null;
                localStorage.removeItem('currentProjectId');
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    }

    return {
        // State
        projects,
        currentProjectId,
        // Getters
        currentProject,
        totalProjects,
        // Actions
        loadProjects,
        setCurrentProject,
        addProject,
        checkNameExists,
        updateProjectStatus,
        deleteProject
    };
});
