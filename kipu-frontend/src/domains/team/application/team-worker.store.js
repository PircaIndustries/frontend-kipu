import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teamWorkerApi } from '../infrastructure/team-worker.api.js'
import { TeamWorkerAssembler } from '../infrastructure/team-worker.assembler.js'
import { TeamWorkerEntity } from '../domain/model/team-worker.entity.js'

/**
 * Team Workers Store - Manages team worker state and operations
 */
export const useTeamWorkerStore = defineStore('teamWorker', () => {
    // ========== STATE ==========

    /** @type {import('vue').Ref<TeamWorkerEntity[]>} */
    const workers = ref([])

    /** @type {import('vue').Ref<string>} */
    const searchTerm = ref('')

    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false)

    // ========== GETTERS ==========

    /**
     * All workers
     * @returns {TeamWorkerEntity[]}
     */
    const allWorkers = computed(() => workers.value)

    /**
     * Active workers only
     * @returns {TeamWorkerEntity[]}
     */
    const activeWorkers = computed(() => workers.value.filter(worker => worker.isActive))

    /**
     * Filtered workers based on search term
     * @returns {TeamWorkerEntity[]}
     */
    const filteredWorkers = computed(() => {
        const term = searchTerm.value.toLowerCase().trim()
        if (!term) return workers.value

        return workers.value.filter(worker =>
            worker.dni.toLowerCase().includes(term) ||
            worker.fullName.toLowerCase().includes(term) ||
            worker.role.toLowerCase().includes(term)
        )
    })

    /**
     * Total active workers count
     * @returns {number}
     */
    const totalActiveWorkers = computed(() => activeWorkers.value.length)

    // ========== ACTIONS ==========

    /**
     * Load all team workers from API
     * @returns {Promise<void>}
     */
    const fetchWorkers = async () => {
        loading.value = true
        try {
            const response = await teamWorkerApi.getAllWorkers()
            workers.value = TeamWorkerAssembler.toEntitiesFromResponse(response)
            console.log(`Loaded ${workers.value.length} team workers`)
        } catch (error) {
            console.error('Error fetching workers:', error)
        } finally {
            loading.value = false
        }
    }

    /**
     * Add a new worker locally (for simulation)
     * @param {TeamWorkerEntity} worker - Worker to add
     * @returns {void}
     */
    const addLocalWorker = (worker) => {
        workers.value.push(worker)
        console.log('Worker added locally:', worker)
    }

    /**
     * Update worker locally
     * @param {TeamWorkerEntity} updatedWorker - Updated worker
     * @returns {void}
     */
    const updateLocalWorker = (updatedWorker) => {
        const index = workers.value.findIndex(w => w.id === updatedWorker.id)
        if (index !== -1) {
            workers.value[index] = updatedWorker
            console.log('Worker updated locally:', updatedWorker)
        }
    }

    /**
     * Toggle worker active status
     * @param {TeamWorkerEntity} worker - Worker to toggle
     * @returns {Promise<void>}
     */
    const toggleWorkerStatus = async (worker) => {
        const updatedWorker = { ...worker, isActive: !worker.isActive }
        const index = workers.value.findIndex(w => w.id === worker.id)
        const previousState = workers.value[index]

        // Optimistic update
        workers.value[index] = updatedWorker

        try {
            const response = await teamWorkerApi.updateWorker(updatedWorker.id, updatedWorker)
            const entity = TeamWorkerAssembler.toEntityFromResource(response)
            workers.value[index] = entity
        } catch (error) {
            workers.value[index] = previousState
            console.error('Error toggling worker status:', error)
            throw error
        }
    }

    /**
     * Create a new worker
     * @param {Object} workerData - Worker application (dni, fullName, role, assignedTools)
     * @returns {Promise<TeamWorkerEntity|null>}
     */
    const createWorker = async (workerData) => {
        const newWorker = new TeamWorkerEntity()
        newWorker.id = `wkr-${Date.now()}`
        newWorker.dni = workerData.dni
        newWorker.fullName = workerData.fullName
        newWorker.role = workerData.role
        newWorker.isActive = true
        newWorker.assignedTools = workerData.assignedTools || []

        workers.value.push(newWorker)

        try {
            const created = await teamWorkerApi.createWorker(newWorker)
            const entity = TeamWorkerAssembler.toEntityFromResource(created)
            const idx = workers.value.findIndex(w => w.id === newWorker.id)
            if (idx !== -1) workers.value[idx] = entity
            return entity
        } catch (error) {
            const idx = workers.value.findIndex(w => w.id === newWorker.id)
            if (idx !== -1) workers.value.splice(idx, 1)
            console.error('Error creating worker:', error)
            return null
        }
    }

    /**
     * Update search term for filtering
     * @param {string} term - Search term
     * @returns {void}
     */
    const updateSearchTerm = (term) => {
        searchTerm.value = term
    }

    /**
     * Clear search term
     * @returns {void}
     */
    const clearSearch = () => {
        searchTerm.value = ''
    }

    return {
        // State
        workers,
        searchTerm,
        loading,

        // Getters
        allWorkers,
        activeWorkers,
        filteredWorkers,
        totalActiveWorkers,

        // Actions
        fetchWorkers,
        addLocalWorker,
        updateLocalWorker,
        toggleWorkerStatus,
        createWorker,
        updateSearchTerm,
        clearSearch
    }
})