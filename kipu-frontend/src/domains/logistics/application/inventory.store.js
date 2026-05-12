import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {LogisticsApi} from "@/domains/logistics/infrastructure/logistics.api.js"

import {CategoryEntity} from "@/domains/logistics/domain/model/materials/category.entity.js";
import {MaterialEntity} from "@/domains/logistics/domain/model/materials/material.entity.js";
import {MaterialInventoryEntity} from "@/domains/logistics/domain/model/materials/materialInventory.entity.js";
import {CategoryAssembler} from "@/domains/logistics/infrastructure/materials/category.assembler.js";
import {MaterialAssembler} from "@/domains/logistics/infrastructure/materials/material.assembler.js";
import {MaterialInventoryAssembler} from "@/domains/logistics/infrastructure/materials/materialInventory.assembler.js";

const logisticsApi = new LogisticsApi();

const useInventoryStore = defineStore('logistics', () => {

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

    // ── INVENTORY VIEW ────────────────────────────────────────────────────────────────

    const inventoryView = computed(() => {
        const activeCategories = categories.value.filter(c => c.isActive);
        return inventoryMaterials.value.map(invItem => {
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

    // ── LOADERS ────────────────────────────────────────────────────────────────

    function fetchCategories() {
        logisticsApi.getCategories().then(response => {
            categories.value = CategoryAssembler.toEntitiesFromResponse(response);
            categoriesLoaded.value = true;
            /*
            console.log(categoriesLoaded.value);
            console.log(categories.value);
            */
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
            /*
            console.log(materialsLoaded.value);
            console.log(materials.value);
            */
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
            /*
            console.log(inventoryLoaded.value);
            console.log(inventoryMaterials.value);
            */
        }).catch(error => {
            errors.value.push(error);
        });
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
    };

});

export default useInventoryStore;