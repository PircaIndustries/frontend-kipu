import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { LogisticsApi } from "@/domains/logistics/infrastructure/logistics.api.js";
import { BudgetApi } from "@/domains/budget/infrastructure/budget-api.js";
import {MaterialRequestEntity} from "@/domains/logistics/domain/model/requests/materialRequest.entity.js";
import { MaterialEntity } from "@/domains/logistics/domain/model/materials/material.entity.js";
import { CategoryEntity } from "@/domains/logistics/domain/model/materials/category.entity.js";
import {SupplierOfferEntity} from "@/domains/logistics/domain/model/suppliers/supplierOffer.entity.js";
import {MaterialRequestAssembler} from "@/domains/logistics/infrastructure/requests/materialRequest.assembler.js";
import { MaterialAssembler } from "@/domains/logistics/infrastructure/materials/material.assembler.js";
import { CategoryAssembler } from "@/domains/logistics/infrastructure/materials/category.assembler.js";
import {SupplierOfferAssembler} from "@/domains/logistics/infrastructure/suppliers/supplierOffer.assembler.js";
const logisticsApi = new LogisticsApi();
const budgetApi = new BudgetApi();



const useRequestStore = defineStore('request', () => {

    // ── RAW ──────────────────────────────────────────────────────────

    /**
     * List of Request entities.
     * @type {import('vue').Ref<MaterialRequestEntity[]>}
     */
    const requests = ref([]);
    /**
     * List of Materials entities.
     * @type {import('vue').Ref<MaterialEntity[]>}
     */
    const materials = ref([]);
    /**
     * List of Categories entities.
     * @type {import('vue').Ref<CategoryEntity[]>}
     */
    const categories = ref([]);
    /**
     * List of Supplier Offer entities (used for request enrichment).
     * @type {import('vue').Ref<SupplierOfferEntity[]>}
     */
    const supplierOffers = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether Requests have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const requestsLoaded = ref(false);
    /**
     * Whether Materials have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const materialsLoaded = ref(false);
    /**
     * Whether Categories have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const categoriesLoaded = ref(false);
    /**
     * Whether Supplier Offers have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const supplierOffersLoaded = ref(false);
    /**
     * List of budget lines from budget API.
     * @type {import('vue').Ref<Array>}
     */
    const budgetLines = ref([]);
    /**
     * Whether budget lines have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const budgetLinesLoaded = ref(false);

    // ── ENRICHED VIEW ───────────────────────────────────────────────────────
    /**
     * Enriched view of all requests with material, category and price data.
     * @type {import('vue').ComputedRef<EnrichedRequest[]>}
     */
    const requestDetailsView = computed(() => {
        const currentMaterials = materials.value;
        const currentCategories = categories.value.filter(c => c.isActive);
        const currentSupplierOffers = supplierOffers.value;
        const currentBudgetLines = budgetLines.value;

        return requests.value.map(request => {
            const enrichedItems = request.items.map(item => {
                const offer = currentSupplierOffers.find(s => s.id === item.supplierOfferId);
                const material = currentMaterials.find(m => m.id === offer?.materialId);
                const category = currentCategories.find(c => c.id === material?.categoryId);

                return {
                    ...item,
                    materialName: material?.name ?? 'Unknown Name',
                    categoryName: category?.name ?? 'Unknown Category',
                    materialUnit: material?.measureUnit ?? 'Without unit',
                    pricePerUnit: offer?.unitPrice ?? 0,
                };
            });

            const totalAmount = enrichedItems.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
            const budgetLine = currentBudgetLines.find(b => b.id === request.budgetLineId);
            const budgetAvailable = budgetLine ? budgetLine.budgeted - budgetLine.executed : 0;
            const isWithinBudget = budgetLine ? totalAmount <= budgetAvailable : true;

            return {
                ...request,
                items: enrichedItems,
                totalAmount,
                budgetAvailable,
                isWithinBudget,
            };
        });
    });

    // ── FILTERS ─────────────────────────────────────────────────────────────

    // ────────── FILTERS STATES ─────────────────────────────────────────────────
    const selectedRequestFilter = ref('');
    const pendingRequestFilter = ref(false);
    const approvedRequestFilter = ref(false);
    const refusedRequestFilter = ref(false);

    /**
     * Filtered requests based on status toggles, budget, and deadline filters.
     * @type {import('vue').ComputedRef<EnrichedRequest[]>}
     */
    const filteredRequests = computed(() => {
        let result = requestDetailsView.value;

        // ‣ Toggle filters (exclusive)
        if (pendingRequestFilter.value) result = result.filter(r => r.status === 'PENDING');
        if (approvedRequestFilter.value) result = result.filter(r => r.status === 'APPROVED');
        if (refusedRequestFilter.value) result = result.filter(r => r.status === 'REFUSED');

        const filter = selectedRequestFilter.value;
        if (filter === 'within-budget') {
            result = result.filter(r => r.isWithinBudget);
        } else if (filter === 'out-budget') {
            result = result.filter(r => !r.isWithinBudget);
        } else if (filter === 'expire-48h') {
            const now = Date.now();
            result = result.filter(r => {
                const diff = new Date(r.deadline).getTime() - now;
                const days = diff / (1000 * 60 * 60 * 24);
                return days <= 2 && days >= 0;
            });
        }
        return result;
    });

    function setSelectedRequestFilter(filter) {
        selectedRequestFilter.value = filter;
    }

    function togglePendingRequestFilter() {
        pendingRequestFilter.value = !pendingRequestFilter.value;
        approvedRequestFilter.value = false;
        refusedRequestFilter.value = false;
    }
    function toggleApprovedRequestFilter() {
        approvedRequestFilter.value = !approvedRequestFilter.value;
        pendingRequestFilter.value = false;
        refusedRequestFilter.value = false;
    }
    function toggleRefusedRequestFilter() {
        refusedRequestFilter.value = !refusedRequestFilter.value;
        pendingRequestFilter.value = false;
        approvedRequestFilter.value = false;
    }

    // ── LOADERS ────────────────────────────────────────────────────────────
    /**
     * Fetches supplier offers from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchSupplierOffers() {
        logisticsApi.getSupplierOffers().then(response => {
            supplierOffers.value = SupplierOfferAssembler.toEntitiesFromResponse(response);
            supplierOffersLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Fetches material requests from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchRequests() {
        logisticsApi.getMaterialRequests().then(response => {
            requests.value = MaterialRequestAssembler.toEntitiesFromResponse(response);
            requestsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }
    /**
     * Fetches material materials from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchMaterials() {
        logisticsApi.getMaterials().then(response => {
            materials.value = MaterialAssembler.toEntitiesFromResponse(response);
            materialsLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }
    /**
     * Fetches material categories from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchCategories() {
        logisticsApi.getCategories().then(response => {
            categories.value = CategoryAssembler.toEntitiesFromResponse(response);
            categoriesLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }
    /**
     * Fetches budget lines from budget API.
     * @returns {void}
     */
    function fetchBudgetLines() {
        budgetApi.findAll().then(response => {
            budgetLines.value = response;
            budgetLinesLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    // ── CRUD ────────────────────────────────────────────────────────────────

    /**
     * Creates a new request.
     * @param {MaterialRequestEntity} request
     * @param {Function} [onSuccess]
     */
    function createRequest(request, onSuccess) {
        logisticsApi.createMaterialRequest(request).then(response => {
            const newRequests = MaterialRequestAssembler.toEntitiesFromResponse(response);
            requests.value.push(...newRequests);
            onSuccess?.();
        }).catch(error => {
            errors.value.push(error);
        });
    }
    /**
     * Updates an existing request.
     * @param {string} id
     * @param {Partial<MaterialRequestEntity>} updates
     * @param {Function} [onSuccess]
     */
    function updateRequest(id, updates, onSuccess) {
        const payload = { id, ...updates };
        logisticsApi.updateMaterialRequest(payload).then(response => {
            const [updated] = MaterialRequestAssembler.toEntitiesFromResponse(response);
            if (!updated) return;
            const index = requests.value.findIndex(r => r.id === id);
            if (index !== -1) requests.value[index] = updated;
            onSuccess?.();
        }).catch(error => {
            errors.value.push(error);
        });
    }

    // ── RETURN ─────────────────────────────────────────────────────────────

    return {
        requests, materials, categories, supplierOffers, budgetLines, errors,
        requestsLoaded, materialsLoaded, categoriesLoaded, supplierOffersLoaded, budgetLinesLoaded,
        requestDetailsView,
        filteredRequests,
        selectedRequestFilter, pendingRequestFilter, approvedRequestFilter, refusedRequestFilter,
        setSelectedRequestFilter,
        togglePendingRequestFilter, toggleApprovedRequestFilter, toggleRefusedRequestFilter,
        fetchMaterials, fetchCategories, fetchSupplierOffers, fetchRequests, fetchBudgetLines,
        createRequest, updateRequest,
    };
});

export default useRequestStore;