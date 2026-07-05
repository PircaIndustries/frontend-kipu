import { defineStore } from "pinia";
import { ref } from "vue";
import { MaterialWasteEntity } from "@/domains/logistics/domain/model/waste/materialWaste.entity.js";
import { MaterialWasteAssembler } from "@/domains/logistics/infrastructure/waste/materialWaste.assembler.js";
import { WasteClassificationEntity } from "@/domains/logistics/domain/model/waste/wasteClassification.entity.js";
import { WasteClassificationAssembler } from "@/domains/logistics/infrastructure/waste/wasteClassification.assembler.js";
import { WasteRepository } from "../infrastructure/waste.api.js";
import useInventoryStore from "./inventory.store.js"; // Importación integrada del store de inventario

const wasteApi = new WasteRepository();

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
        const inventoryStore = useInventoryStore();

        wasteApi.getMaterialWastes().then(data => {
            console.log("Datos crudos recibidos del backend:", data);

            const entities = MaterialWasteAssembler.toEntitiesFromResponse(data);

            // Mapeo integrado para cruzar los datos y resolver materialName y materialUnit
            waste.value = entities.map(w => {
                const matchedMaterial = inventoryStore.inventoryView.find(
                    inv => Number(inv.materialId) === Number(w.materialId)
                );
                return {
                    ...w,
                    materialName: matchedMaterial ? matchedMaterial.materialName : `Material #${w.materialId}`,
                    materialUnit: matchedMaterial ? matchedMaterial.materialUnit : 'U'
                };
            });

            wasteLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function fetchClassifications() {
        wasteApi.getWasteClassifications().then(data => {
            const fetched = WasteClassificationAssembler.toEntitiesFromResponse(data);
            if (fetched.length > 0) {
                classifications.value = fetched;
            }
            classificationsLoaded.value = true;
        }).catch(() => {
            classificationsLoaded.value = true;
        });
    }

    function addClassification(name, onSuccess) {
        wasteApi.createWasteClassification({ name }).then(data => {
            const newItems = WasteClassificationAssembler.toEntitiesFromResponse(data);
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
        wasteApi.createMaterialWaste(item).then(data => {
            const newItems = MaterialWasteAssembler.toEntitiesFromResponse(data);

            // Hidratamos los nuevos elementos que se agregan al estado local inmediatamente
            const inventoryStore = useInventoryStore();
            const hydratedItems = newItems.map(w => {
                const matchedMaterial = inventoryStore.inventoryView.find(inv => inv.materialId === w.materialId);
                return {
                    ...w,
                    materialName: matchedMaterial ? matchedMaterial.materialName : `Material #${w.materialId}`,
                    materialUnit: matchedMaterial ? matchedMaterial.materialUnit : 'U'
                };
            });

            waste.value.push(...hydratedItems);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    function updateWaste(id, updates, onSuccess) {
        wasteApi.updateMaterialWaste(id, updates).then(data => {
            const [updated] = MaterialWasteAssembler.toEntitiesFromResponse(data);
            if (!updated) return;

            const inventoryStore = useInventoryStore();
            const matchedMaterial = inventoryStore.inventoryView.find(inv => inv.materialId === updated.materialId);

            const hydratedUpdated = {
                ...updated,
                materialName: matchedMaterial ? matchedMaterial.materialName : `Material #${updated.materialId}`,
                materialUnit: matchedMaterial ? matchedMaterial.materialUnit : 'U'
            };

            const index = waste.value.findIndex(w => w.id === id);
            if (index !== -1) waste.value[index] = hydratedUpdated;
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