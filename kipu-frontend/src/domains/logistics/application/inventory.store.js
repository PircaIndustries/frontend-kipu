import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {LogisticsApi} from "@/domains/logistics/infrastructure/logistics.api.js"
import { useProjectsStore } from "@/domains/project-management/data/useProjectsStore.js";

import {CategoryEntity} from "@/domains/logistics/domain/model/materials/category.entity.js";
import {MaterialEntity} from "@/domains/logistics/domain/model/materials/material.entity.js";
import {MaterialInventoryEntity} from "@/domains/logistics/domain/model/materials/materialInventory.entity.js";
import {CategoryAssembler} from "@/domains/logistics/infrastructure/materials/category.assembler.js";
import {MaterialAssembler} from "@/domains/logistics/infrastructure/materials/material.assembler.js";
import {MaterialInventoryAssembler} from "@/domains/logistics/infrastructure/materials/materialInventory.assembler.js";

const logisticsApi = new LogisticsApi();

const useInventoryStore = defineStore('logistics', () => {
    const projectsStore = useProjectsStore();

    // ── RAW ────────────────────────────────────────────────────────────────

    /**
     * List of Material Inventory entities.
     * @type {import('vue').Ref<MaterialInventoryEntity[]>}
     */
    const inventoryMaterials  = ref([]);
    /**
     * List of materials entities.
     * @type {import('vue').Ref<MaterialEntity[]>}
     */
    const materials  = ref([]);

    /**
     * List of category entities.
     * @type {import('vue').Ref<CategoryEntity[]>}
     */
    const categories = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether inventory have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const inventoryLoaded  = ref(false);
    /**
     * Whether materials have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const materialsLoaded  = ref(false);
    /**
     * Whether categories have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const categoriesLoaded = ref(false);

    /**
     * Loads categories from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchCategories() {
        logisticsApi.getCategories().then(response => {
            categories.value = CategoryAssembler.toEntitiesFromResponse(response);
            categoriesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }
    /**
     * Loads materials from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchMaterials() {
        logisticsApi.getMaterials().then(response => {
            materials.value = MaterialAssembler.toEntitiesFromResponse(response);
            materialsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }
    /**
     * Loads inventory from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchInventory() {
        logisticsApi.getMaterialInventories().then(response => {
            inventoryMaterials.value = MaterialInventoryAssembler.toEntitiesFromResponse(response);
            inventoryLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    // ── INVENTORY VIEW ────────────────────────────────────────────────────────────────

    const inventoryView = computed(() => {
        const activeCategories = categories.value.filter(c => c.isActive);
        const currentId = projectsStore.currentProjectId;
        const filteredItems = currentId
            ? inventoryMaterials.value.filter(item => String(item.projectId) === String(currentId))
            : [];
        return filteredItems.map(invItem => {
            const material = materials.value.find(m => m.id === invItem.materialId);
            const category = activeCategories.find(c => c.id === material?.categoryId);

            return {
                ...invItem,
                materialName:        material?.name        ?? 'Unknown',
                materialCategory:    category?.name        ?? 'Without category',
                materialSubcategory: material?.subcategory ?? 'Without Subcategory',
                materialUnit:        material?.measureUnit ?? 'Without Unit'
            };
        });
    });

    // ── FILTERS ────────────────────────────────────────────────────────────────

    // ────────── FILTERS STATES ─────────────────────────────────────────────────

    const selectedCategory    = ref('');
    const selectedInventoryId =  ref('');
    const criticalStockFilter = ref(false);

    // ────────── FILTERS INVENTORY  ─────────────────────────────────────────────────

    const filteredInventory = computed(() => {
        let result = inventoryView.value;
        if (selectedCategory.value) {
            result = result.filter(i => i.materialCategory === selectedCategory.value);
        }
        if (criticalStockFilter.value) {
            result = result.filter(i => i.currentStock <= i.miniumStock);
        }
        if (selectedInventoryId.value) {
            result = result.filter(i => i.id === selectedInventoryId.value);
        }
        return result;
    });
    // ────────── FILTERS COUNTS  ─────────────────────────────────────────────────
    const criticalCount = computed(() =>
        inventoryView.value.filter(i => i.currentStock <= i.miniumStock).length
    );

    // ────────── FILTERS ACTIONS ─────────────────────────────────────────────────
    function filterByCategory(category)  { selectedCategory.value = category; }
    function clearCategoryFilter()       { selectedCategory.value = ''; }
    function toggleCriticalFilter()      { criticalStockFilter.value = !criticalStockFilter.value; }
    function filterById(id)              { selectedInventoryId.value = id; }
    function clearInventoryIdFilter()    { selectedInventoryId.value = ''; }

    function resetAllFilters() {
        clearCategoryFilter();
        criticalStockFilter.value = false;
        clearInventoryIdFilter();
    }

    function addCategory(name, onSuccess) {
        logisticsApi.createCategory({
            id: `cat-${Date.now()}`,
            name,
            description: '',
            isActive: true
        }).then(response => {
            const newItems = CategoryAssembler.toEntitiesFromResponse(response);
            if (newItems.length > 0) {
                categories.value.push(...newItems);
            } else {
                categories.value.push(new CategoryEntity({ id: `cat-${Date.now()}`, name, description: '', isActive: true }));
            }
            filterByCategory(name);
            onSuccess?.();
        }).catch(() => {
            categories.value.push(new CategoryEntity({ id: `cat-${Date.now()}`, name, description: '', isActive: true }));
            filterByCategory(name);
            onSuccess?.();
        });
    }

    function deductStock(inventoryId, quantity) {
        const item = inventoryMaterials.value.find(i => i.id === inventoryId);
        if (!item) return;
        const newStock = Math.max(0, item.currentStock - quantity);
        logisticsApi.updateMaterialInventory({
            id: item.id,
            projectId: item.projectId,
            materialId: item.materialId,
            currentStock: newStock,
            miniumStock: item.miniumStock,
            location: item.location
        }).then(() => {
            const idx = inventoryMaterials.value.findIndex(i => i.id === inventoryId);
            if (idx !== -1) inventoryMaterials.value[idx].currentStock = newStock;
        }).catch(error => { errors.value.push(error); });
    }

    // ── RETURN ────────────────────────────────────────────────────────────────

    return {
        // states
        inventoryMaterials,
        materials,
        categories,
        errors,
        inventoryLoaded,
        materialsLoaded,
        categoriesLoaded,
        inventoryView,
        // filters
        filteredInventory,
        criticalCount,
        selectedCategory,
        criticalStockFilter,
        selectedInventoryId,
        // actions
        fetchCategories,
        fetchMaterials,
        fetchInventory,
        filterByCategory,
        filterById,
        clearCategoryFilter,
        toggleCriticalFilter,
        resetAllFilters,
        addCategory,
        deductStock,
    };

});

export default useInventoryStore;