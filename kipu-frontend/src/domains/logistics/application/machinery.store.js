import { defineStore } from "pinia";
import { ref } from "vue";
import { LogisticsApi } from "@/domains/logistics/infrastructure/logistics.api.js";
import { MachineryEntity } from "@/domains/logistics/domain/model/machinery/machinery.entity.js";
import { MachineryAssembler } from "@/domains/logistics/infrastructure/machinery/machinery.assembler.js";

const logisticsApi = new LogisticsApi();

const useMachineryStore = defineStore('machinery', () => {

    // ── RAW ──────────────────────────────────────────────────────────

    /**
     * List of Machinery entities.
     * @type {import('vue').Ref<MachineryEntity[]>}
     */
    const machinery = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether Machinery have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const machineryLoaded = ref(false);

    // ── LOADERS ──────────────────────────────────────────────────────

    /**
     * Fetches machinery from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchMachinery() {
        logisticsApi.getMachinery().then(response => {
            machinery.value = MachineryAssembler.toEntitiesFromResponse(response);
            machineryLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    // ── CRUD ─────────────────────────────────────────────────────────

    /**
     * Creates a new machinery record.
     * @param {MachineryEntity} item
     * @param {Function} [onSuccess]
     */
    function addMachinery(item, onSuccess) {
        logisticsApi.createMachinery(item).then(response => {
            const newItems = MachineryAssembler.toEntitiesFromResponse(response);
            machinery.value.push(...newItems);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    /**
     * Updates an existing machinery record.
     * @param {string} id
     * @param {Partial<MachineryEntity>} updates
     * @param {Function} [onSuccess]
     */
    function updateMachinery(id, updates, onSuccess) {
        const payload = { id, ...updates };
        logisticsApi.updateMachinery(payload).then(response => {
            const [updated] = MachineryAssembler.toEntitiesFromResponse(response);
            if (!updated) return;
            const index = machinery.value.findIndex(m => m.id === id);
            if (index !== -1) machinery.value[index] = updated;
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    /**
     * Deletes a machinery record by its ID.
     * @param {string} id
     * @param {Function} [onSuccess]
     */
    function deleteMachinery(id, onSuccess) {
        logisticsApi.deleteMachinery(id).then(() => {
            machinery.value = machinery.value.filter(m => m.id !== id);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    // ── RETURN ───────────────────────────────────────────────────────

    return {
        machinery, errors, machineryLoaded,
        fetchMachinery,
        addMachinery, updateMachinery, deleteMachinery,
    };
});

export default useMachineryStore;
