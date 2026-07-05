import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { CatalogApi } from "../infrastructure/catalog.api.js";

const catalogApi = new CatalogApi();

const useCatalogStore = defineStore('catalog', () => {
    const materialsCatalog = ref([]);
    const machineryCatalog = ref([]);
    const errors = ref([]);
    const materialsLoaded = ref(false);
    const machineryLoaded = ref(false);

    const searchMaterial = ref('');
    const searchMachinery = ref('');

    const filteredMaterialsCatalog = computed(() => {
        const q = searchMaterial.value.trim().toLowerCase();
        if (!q) return materialsCatalog.value;
        return materialsCatalog.value.filter(m =>
            (m.name ?? '').toLowerCase().includes(q)
        );
    });

    const filteredMachineryCatalog = computed(() => {
        const q = searchMachinery.value.trim().toLowerCase();
        if (!q) return machineryCatalog.value;
        return machineryCatalog.value.filter(m =>
            (m.name ?? '').toLowerCase().includes(q) ||
            (m.brand ?? '').toLowerCase().includes(q) ||
            (m.model ?? '').toLowerCase().includes(q)
        );
    });

    function setSearchMaterial(val) { searchMaterial.value = val; }
    function setSearchMachinery(val) { searchMachinery.value = val; }

    function fetchMaterialsCatalog() {
        return catalogApi.getMaterialsCatalog().then(response => {
            const data = Array.isArray(response?.data) ? response.data : [];
            materialsCatalog.value = data;
            materialsLoaded.value = true;
        }).catch(error => {
            console.warn('Error fetching materials catalog:', error);
            errors.value.push(error);
            materialsLoaded.value = true;
        });
    }

    function fetchMachineryCatalog() {
        return catalogApi.getMachineryCatalog().then(response => {
            const data = Array.isArray(response?.data) ? response.data : [];
            machineryCatalog.value = data;
            machineryLoaded.value = true;
        }).catch(error => {
            console.warn('Error fetching machinery catalog:', error);
            errors.value.push(error);
            machineryLoaded.value = true;
        });
    }

    function fetchAll() {
        return Promise.all([fetchMaterialsCatalog(), fetchMachineryCatalog()]);
    }

    function addMaterialCatalog(resource, onSuccess, onError) {
        return catalogApi.createMaterialCatalog(resource).then(response => {
            const item = response?.data;
            if (item) materialsCatalog.value.push(item);
            onSuccess?.(item);
        }).catch(error => {
            errors.value.push(error);
            onError?.(error);
        });
    }

    function updateMaterialCatalog(id, resource, onSuccess, onError) {
        return catalogApi.patchMaterialCatalog(id, resource).then(response => {
            const updated = response?.data;
            if (updated) {
                const idx = materialsCatalog.value.findIndex(m => String(m.id) === String(id));
                if (idx !== -1) materialsCatalog.value[idx] = updated;
            }
            onSuccess?.(updated);
        }).catch(error => {
            errors.value.push(error);
            onError?.(error);
        });
    }

    function deleteMaterialCatalog(id, onSuccess, onError) {
        return catalogApi.deleteMaterialCatalog(id).then(() => {
            materialsCatalog.value = materialsCatalog.value.filter(m => String(m.id) !== String(id));
            onSuccess?.();
        }).catch(error => {
            errors.value.push(error);
            onError?.(error);
        });
    }

    function addMachineryCatalog(resource, onSuccess, onError) {
        return catalogApi.createMachineryCatalog(resource).then(response => {
            const item = response?.data;
            if (item) machineryCatalog.value.push(item);
            onSuccess?.(item);
        }).catch(error => {
            errors.value.push(error);
            onError?.(error);
        });
    }

    function updateMachineryCatalog(id, resource, onSuccess, onError) {
        return catalogApi.patchMachineryCatalog(id, resource).then(response => {
            const updated = response?.data;
            if (updated) {
                const idx = machineryCatalog.value.findIndex(m => String(m.id) === String(id));
                if (idx !== -1) machineryCatalog.value[idx] = updated;
            }
            onSuccess?.(updated);
        }).catch(error => {
            errors.value.push(error);
            onError?.(error);
        });
    }

    function deleteMachineryCatalog(id, onSuccess, onError) {
        return catalogApi.deleteMachineryCatalog(id).then(() => {
            machineryCatalog.value = machineryCatalog.value.filter(m => String(m.id) !== String(id));
            onSuccess?.();
        }).catch(error => {
            errors.value.push(error);
            onError?.(error);
        });
    }

    return {
        materialsCatalog, machineryCatalog, errors,
        materialsLoaded, machineryLoaded,
        filteredMaterialsCatalog, filteredMachineryCatalog,
        searchMaterial, searchMachinery,
        setSearchMaterial, setSearchMachinery,
        fetchMaterialsCatalog, fetchMachineryCatalog, fetchAll,
        addMaterialCatalog, updateMaterialCatalog, deleteMaterialCatalog,
        addMachineryCatalog, updateMachineryCatalog, deleteMachineryCatalog,
    };
});

export default useCatalogStore;
