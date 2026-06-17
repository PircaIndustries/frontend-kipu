// src/domains/team/application/team-worker.store.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teamWorkerApi } from '../infrastructure/team-worker.api.js'
import { TeamWorkerAssembler } from '../infrastructure/team-worker.assembler.js'
import { TeamWorkerEntity } from '../domain/model/team-worker.entity.js'

export const useTeamWorkerStore = defineStore('teamWorker', () => {

    const workers = ref([])
    const searchTerm = ref('')
    const loading = ref(false)

    // ========== GETTERS ==========
    const allWorkers = computed(() => {
        const currentId = localStorage.getItem('currentProjectId')
        if (!currentId) return []
        return workers.value.filter(worker => String(worker.projectId) === String(currentId))
    })

    const activeWorkers = computed(() => allWorkers.value.filter(worker => worker.isActive))

    const filteredWorkers = computed(() => {
        const term = searchTerm.value.toLowerCase().trim()
        if (!term) return allWorkers.value

        return allWorkers.value.filter(worker =>
            worker.dni.toLowerCase().includes(term) ||
            worker.fullName.toLowerCase().includes(term) ||
            worker.role.toLowerCase().includes(term)
        )
    })

    const totalActiveWorkers = computed(() => activeWorkers.value.length)

    // ========== ACTIONS ==========
    const fetchWorkers = async () => {
        const currentProjectId = localStorage.getItem('currentProjectId')
        if (!currentProjectId) return

        loading.value = true
        try {
            const response = await teamWorkerApi.getAllWorkers(currentProjectId, searchTerm.value)
            workers.value = TeamWorkerAssembler.toEntitiesFromResponse(response)
            console.log(`Loaded ${workers.value.length} team workers`)
        } catch (error) {
            console.error('Error fetching workers:', error)
        } finally {
            loading.value = false
        }
    }

    const addLocalWorker = (worker) => {
        workers.value.push(worker)
    }

    const toggleWorkerStatus = async (worker) => {
        // Para este paso el Delete lógico aún se maneja según tu necesidad de negocio
        // Dejamos esta función por compatibilidad, aunque tu backend tiene Delete y no Update general.
        console.warn("Update status no está definido en el backend nativo. Eliminando de la vista...")
        try {
            await teamWorkerApi.deleteWorker(worker.id)
            workers.value = workers.value.filter(w => w.id !== worker.id)
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Create a new worker con sus herramientas
     */
    const createWorker = async (workerData, toolsList = []) => {
        const currentProjectId = localStorage.getItem('currentProjectId')
        if (!currentProjectId) return null

        const newWorker = new TeamWorkerEntity()
        newWorker.dni = workerData.dni
        newWorker.fullName = workerData.fullName
        newWorker.role = workerData.role
        newWorker.projectId = currentProjectId

        // Mapeamos a la estructura que requiere tu POST en C#
        const createResource = TeamWorkerAssembler.toCreateResourceFromEntity(newWorker, toolsList)

        try {
            const createdResponse = await teamWorkerApi.createWorker(createResource)
            const entity = TeamWorkerAssembler.toEntityFromResource(createdResponse)
            workers.value.push(entity)
            return entity
        } catch (error) {
            console.error('Error creating worker:', error.response?.data || error.message)
            return null
        }
    }

    /**
     * Asignar una maquinaria extra a un trabajador existente
     * Útil para futuras implementaciones (POST /machineries)
     */
    const assignMachineryToWorker = async (workerId, machineryData) => {
        try {
            // machineryData debe tener la estructura { machineryId: string, fullName: string }
            await teamWorkerApi.assignMachinery(workerId, machineryData)

            // Refrescamos la lista para obtener la data fresca desde C#
            await fetchWorkers()
        } catch (error) {
            console.error(`Error assigning machinery to worker ${workerId}:`, error.response?.data || error.message)
            throw error
        }
    }

    /**
     * Remover una maquinaria específica de un trabajador
     * Útil para futuras implementaciones (DELETE /machineries/{id})
     */
    const removeMachineryFromWorker = async (workerId, machineryId) => {
        try {
            await teamWorkerApi.removeMachinery(workerId, machineryId)

            // Refrescamos la lista para actualizar la UI
            await fetchWorkers()
        } catch (error) {
            console.error(`Error removing machinery ${machineryId} from worker ${workerId}:`, error.response?.data || error.message)
            throw error
        }
    }

    const updateSearchTerm = (term) => {
        searchTerm.value = term
    }

    const clearSearch = () => {
        searchTerm.value = ''
    }

    return {
        workers, searchTerm, loading,
        allWorkers, activeWorkers, filteredWorkers, totalActiveWorkers,
        fetchWorkers, addLocalWorker, toggleWorkerStatus, createWorker,
        assignMachineryToWorker, removeMachineryFromWorker, // <-- Agregadas aquí
        updateSearchTerm, clearSearch
    }
})