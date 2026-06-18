import { defineStore } from "pinia";
import { ref } from "vue";
import { LogisticsApi } from "@/domains/logistics/infrastructure/logistics.api.js";
import { MaterialWasteEntity } from "@/domains/logistics/domain/model/waste/materialWaste.entity.js";
import { MaterialWasteAssembler } from "@/domains/logistics/infrastructure/waste/materialWaste.assembler.js";
import { WasteClassificationEntity } from "@/domains/logistics/domain/model/waste/wasteClassification.entity.js";
import { WasteClassificationAssembler } from "@/domains/logistics/infrastructure/waste/wasteClassification.assembler.js";
import {WasteApi} from "../infrastructure/waste.api.js";

const wasteApi = new WasteApi();

const DEFAULT_CLASSIFICATIONS = [
  new WasteClassificationEntity({ id: 'wcls-001', name: 'Rotura' }),
  new WasteClassificationEntity({ id: 'wcls-002', name: 'Vencimiento' }),
  new WasteClassificationEntity({ id: 'wcls-003', name: 'Hurto' }),
  new WasteClassificationEntity({ id: 'wcls-004', name: 'Otro' }),
];

const useWasteStore = defineStore('waste', () => {

    const waste = ref([]);
    const errors = ref([]);
    const wasteLoaded = ref(false);

    const classifications = ref([...DEFAULT_CLASSIFICATIONS]);
    const classificationsLoaded = ref(false);

    function fetchWaste() {
        wasteApi.getMaterialWastes().then(response => {
            waste.value = MaterialWasteAssembler.toEntitiesFromResponse(response);
            wasteLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function fetchClassifications() {
        wasteApi.getWasteClassifications().then(response => {
            const fetched = WasteClassificationAssembler.toEntitiesFromResponse(response);
            if (fetched.length > 0) {
                classifications.value = fetched;
            }
            classificationsLoaded.value = true;
        }).catch(() => {
            classificationsLoaded.value = true;
        });
    }

    function addClassification(name, onSuccess) {
        wasteApi.createWasteClassification({ name }).then(response => {
            const newItems = WasteClassificationAssembler.toEntitiesFromResponse(response);
            if (newItems.length > 0) {
                classifications.value.push(...newItems);
            } else {
                classifications.value.push(new WasteClassificationEntity({ id: `wcls-${Date.now()}`, name }));
            }
            onSuccess?.();
        }).catch(() => {
            classifications.value.push(new WasteClassificationEntity({ id: `wcls-${Date.now()}`, name }));
            onSuccess?.();
        });
    }

    function addWaste(item, onSuccess) {
        wasteApi.createMaterialWaste(item).then(response => {
            const newItems = MaterialWasteAssembler.toEntitiesFromResponse(response);
            waste.value.push(...newItems);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    function updateWaste(id, updates, onSuccess) {
        const payload = { id, ...updates };
        wasteApi.updateMaterialWaste(payload).then(response => {
            const [updated] = MaterialWasteAssembler.toEntitiesFromResponse(response);
            if (!updated) return;
            const index = waste.value.findIndex(w => w.id === id);
            if (index !== -1) waste.value[index] = updated;
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    function deleteWaste(id, onSuccess) {
        wasteApi.deleteMaterialWaste(id).then(() => {
            waste.value = waste.value.filter(w => w.id !== id);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    return {
        waste, errors, wasteLoaded,
        classifications, classificationsLoaded,
        fetchWaste, fetchClassifications,
        addClassification,
        addWaste, updateWaste, deleteWaste,
    };
});

export default useWasteStore;
