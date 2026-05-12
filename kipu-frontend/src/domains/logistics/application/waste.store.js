import { defineStore } from "pinia";
import { ref } from "vue";
import { LogisticsApi } from "@/domains/logistics/infrastructure/logistics.api.js";
import { MaterialWasteEntity } from "@/domains/logistics/domain/model/waste/materialWaste.entity.js";
import { MaterialWasteAssembler } from "@/domains/logistics/infrastructure/waste/materialWaste.assembler.js";

const logisticsApi = new LogisticsApi();

const useWasteStore = defineStore('waste', () => {

    // ── RAW ──────────────────────────────────────────────────────────

    /**
     * List of Material Waste entities.
     * @type {import('vue').Ref<MaterialWasteEntity[]>}
     */
    const waste = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether Waste have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const wasteLoaded = ref(false);

    // ── LOADERS ──────────────────────────────────────────────────────

    /**
     * Fetches waste records from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchWaste() {
        logisticsApi.getMaterialWastes().then(response => {
            waste.value = MaterialWasteAssembler.toEntitiesFromResponse(response);
            wasteLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    // ── CRUD ─────────────────────────────────────────────────────────

    /**
     * Creates a new waste record.
     * @param {MaterialWasteEntity} item
     * @param {Function} [onSuccess]
     */
    function addWaste(item, onSuccess) {
        logisticsApi.createMaterialWaste(item).then(response => {
            const newItems = MaterialWasteAssembler.toEntitiesFromResponse(response);
            waste.value.push(...newItems);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    /**
     * Updates an existing waste record.
     * @param {string} id
     * @param {Partial<MaterialWasteEntity>} updates
     * @param {Function} [onSuccess]
     */
    function updateWaste(id, updates, onSuccess) {
        const payload = { id, ...updates };
        logisticsApi.updateMaterialWaste(payload).then(response => {
            const [updated] = MaterialWasteAssembler.toEntitiesFromResponse(response);
            if (!updated) return;
            const index = waste.value.findIndex(w => w.id === id);
            if (index !== -1) waste.value[index] = updated;
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    /**
     * Deletes a waste record by its ID.
     * @param {string} id
     * @param {Function} [onSuccess]
     */
    function deleteWaste(id, onSuccess) {
        logisticsApi.deleteMaterialWaste(id).then(() => {
            waste.value = waste.value.filter(w => w.id !== id);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    // ── RETURN ───────────────────────────────────────────────────────

    return {
        waste, errors, wasteLoaded,
        fetchWaste,
        addWaste, updateWaste, deleteWaste,
    };
});

export default useWasteStore;
