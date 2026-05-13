import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { LogisticsApi } from "@/domains/logistics/infrastructure/logistics.api.js";
import { SupplierEntity } from "@/domains/logistics/domain/model/suppliers/supplier.entity.js";
import { SupplierOfferEntity } from "@/domains/logistics/domain/model/suppliers/supplierOffer.entity.js";
import { SupplierAssembler } from "@/domains/logistics/infrastructure/suppliers/supplier.assembler.js";
import { SupplierOfferAssembler } from "@/domains/logistics/infrastructure/suppliers/supplierOffer.assembler.js";

const logisticsApi = new LogisticsApi();

const useSupplierStore = defineStore('supplier', () => {

    // ── RAW ──────────────────────────────────────────────────────────

    /**
     * List of Supplier entities.
     * @type {import('vue').Ref<SupplierEntity[]>}
     */
    const suppliers = ref([]);
    /**
     * List of Supplier Offer entities.
     * @type {import('vue').Ref<SupplierOfferEntity[]>}
     */
    const supplierOffers = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether Suppliers have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const suppliersLoaded = ref(false);
    /**
     * Whether Supplier Offers have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const supplierOffersLoaded = ref(false);

    // ── FILTERS ──────────────────────────────────────────────────────

    /**
     * Active/inactive filter toggles (mutually exclusive).
     * @type {import('vue').Ref<boolean>}
     */
    const activeFilter = ref(false);
    const inactiveFilter = ref(false);

    /**
     * RUC search term.
     * @type {import('vue').Ref<string>}
     */
    const searchRuc = ref('');

    /**
     * Selected supplier socialReason (for forms).
     * @type {import('vue').Ref<string>}
     */
    const selectedSupplier = ref('');

    /**
     * Filtered list based on status toggles and RUC search.
     * @type {import('vue').ComputedRef<SupplierEntity[]>}
     */
    const filteredSuppliers = computed(() => {
        let result = suppliers.value;
        const ruc = searchRuc.value.trim();
        if (ruc) result = result.filter(s => s.ruc.includes(ruc));
        if (activeFilter.value) result = result.filter(s => s.status === 'ACTIVE');
        if (inactiveFilter.value) result = result.filter(s => s.status === 'INACTIVE');
        return result;
    });

    /**
     * Count of active suppliers.
     * @type {import('vue').ComputedRef<number>}
     */
    const activeCount = computed(() =>
        suppliers.value.filter(s => s.status === 'ACTIVE').length
    );

    /**
     * Count of inactive suppliers.
     * @type {import('vue').ComputedRef<number>}
     */
    const inactiveCount = computed(() =>
        suppliers.value.filter(s => s.status === 'INACTIVE').length
    );

    function setSelectedSupplier(socialReason) {
        selectedSupplier.value = socialReason;
    }

    function toggleActiveFilter() {
        activeFilter.value = !activeFilter.value;
        inactiveFilter.value = false;
    }

    function toggleInactiveFilter() {
        inactiveFilter.value = !inactiveFilter.value;
        activeFilter.value = false;
    }

    function setSearchRuc(ruc) {
        searchRuc.value = ruc;
    }

    function clearFilters() {
        activeFilter.value = false;
        inactiveFilter.value = false;
        searchRuc.value = '';
    }

    // ── LOADERS ──────────────────────────────────────────────────────

    /**
     * Fetches suppliers from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchSuppliers() {
        logisticsApi.getSuppliers().then(response => {
            suppliers.value = SupplierAssembler.toEntitiesFromResponse(response);
            suppliersLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    /**
     * Fetches supplier offers from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchSupplierOffers() {
        logisticsApi.getSupplierOffers().then(response => {
            supplierOffers.value = SupplierOfferAssembler.toEntitiesFromResponse(response);
            supplierOffersLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    // ── HELPERS ──────────────────────────────────────────────────────

    /**
     * Returns suppliers that offer a given material.
     * @param {string} materialId
     * @returns {SupplierEntity[]}
     */
    function getSuppliersByMaterialId(materialId) {
        const offerSupplierIds = supplierOffers.value
            .filter(o => o.materialId === materialId)
            .map(o => o.supplierId);
        return suppliers.value.filter(s => offerSupplierIds.includes(s.id));
    }

    /**
     * Returns the supplier offer for a given material and supplier socialReason.
     * @param {string} materialId
     * @param {string} supplierSocialReason
     * @returns {SupplierOfferEntity|null}
     */
    function getSupplierOffer(materialId, supplierSocialReason) {
        const supplier = suppliers.value.find(s => s.socialReason === supplierSocialReason);
        if (!supplier) return null;
        return supplierOffers.value.find(o => o.materialId === materialId && o.supplierId === supplier.id) ?? null;
    }

    // ── CRUD ─────────────────────────────────────────────────────────

    /**
     * Creates a new supplier.
     * @param {SupplierEntity} supplier
     * @param {Function} [onSuccess]
     * @param {Function} [onError]
     */
    function addSupplier(supplier, onSuccess, onError) {
        logisticsApi.createSupplier(supplier).then(() => {
            fetchSuppliers()
            onSuccess?.()
        }).catch(error => {
            errors.value.push(error);
            onError?.();
        });
    }

    function updateSupplier(id, updates, onSuccess, onError) {
        const payload = { id, ...updates };
        logisticsApi.updateSupplier(payload).then(() => {
            fetchSuppliers()
            onSuccess?.()
        }).catch(error => {
            errors.value.push(error);
            onError?.();
        });
    }

    function deleteSupplier(id, onSuccess) {
        logisticsApi.deleteSupplier(id).then(() => {
            fetchSuppliers()
            onSuccess?.()
        }).catch(error => { errors.value.push(error); });
    }

    // ── RETURN ───────────────────────────────────────────────────────

    return {
        suppliers, supplierOffers, errors,
        suppliersLoaded, supplierOffersLoaded,
        filteredSuppliers,
        activeFilter, inactiveFilter,
        searchRuc, selectedSupplier,
        activeCount, inactiveCount,
        setSelectedSupplier,
        toggleActiveFilter, toggleInactiveFilter,
        setSearchRuc, clearFilters,
        fetchSuppliers, fetchSupplierOffers,
        getSuppliersByMaterialId, getSupplierOffer,
        addSupplier, updateSupplier, deleteSupplier,
    };
});

export default useSupplierStore;
