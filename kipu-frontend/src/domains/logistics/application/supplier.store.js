import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { SupplierEntity } from "@/domains/logistics/domain/model/suppliers/supplier.entity.js";
import { SupplierOfferEntity } from "@/domains/logistics/domain/model/suppliers/supplierOffer.entity.js";
import { SupplierAssembler } from "@/domains/logistics/infrastructure/suppliers/supplier.assembler.js";
import { SupplierOfferAssembler } from "@/domains/logistics/infrastructure/suppliers/supplierOffer.assembler.js";
import {SupplierApi} from "../infrastructure/supplier.api.js";

const supplierApi = new SupplierApi();

const useSupplierStore = defineStore('supplier', () => {

    const suppliers = ref([]);
    const supplierOffers = ref([]);
    const errors = ref([]);
    const suppliersLoaded = ref(false);
    const supplierOffersLoaded = ref(false);

    const activeFilter = ref(false);
    const inactiveFilter = ref(false);
    const searchRuc = ref('');
    const selectedSupplier = ref('');

    const filteredSuppliers = computed(() => {
        let result = suppliers.value;
        const ruc = searchRuc.value.trim();
        if (ruc) result = result.filter(s => s.ruc.includes(ruc));
        if (activeFilter.value) result = result.filter(s => s.isActive === true);
        if (inactiveFilter.value) result = result.filter(s => s.isActive === false);
        return result;
    });

    const activeCount = computed(() => suppliers.value.filter(s => s.isActive === true).length);
    const inactiveCount = computed(() => suppliers.value.filter(s => s.isActive === false).length);

    function setSelectedSupplier(socialReason) { selectedSupplier.value = socialReason; }
    function toggleActiveFilter() { activeFilter.value = !activeFilter.value; inactiveFilter.value = false; }
    function toggleInactiveFilter() { inactiveFilter.value = !inactiveFilter.value; activeFilter.value = false; }
    function setSearchRuc(ruc) { searchRuc.value = ruc; }
    function clearFilters() { activeFilter.value = false; inactiveFilter.value = false; searchRuc.value = ''; }

    function fetchSuppliers() {
        return supplierApi.getSuppliers().then(response => {
            suppliers.value = SupplierAssembler.toEntitiesFromResponse(response);
            suppliersLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function fetchSupplierOffers() {
        return supplierApi.getSupplierOffers().then(response => {
            supplierOffers.value = SupplierOfferAssembler.toEntitiesFromResponse(response);
            supplierOffersLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function addSupplier(supplier, onSuccess, onError) {
        supplierApi.createSupplier(supplier).then(response => {
            return fetchSuppliers().then(() => onSuccess?.());
        }).catch(error => {
            errors.value.push(error);
            onError?.();
        });
    }

    function updateSupplier(id, updates, onSuccess, onError) {
        const payload = { id, ...updates };
        supplierApi.updateSupplier(payload).then(() => {
            return fetchSuppliers().then(() => onSuccess?.());
        }).catch(error => {
            errors.value.push(error);
            onError?.();
        });
    }

    function deleteSupplier(id, onSuccess) {
        supplierApi.deleteSupplier(id).then(() => {
            return fetchSuppliers().then(() => onSuccess?.());
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function addSupplierOffer(offer, onSuccess) {
        return supplierApi.createSupplierOffer(offer).then(() => {
            return fetchSupplierOffers().then(() => onSuccess?.());
        }).catch(error => { errors.value.push(error); });
    }

    function removeSupplierOffer(id) {
        supplierApi.deleteSupplierOffer(id).then(() => {
            fetchSupplierOffers();
        }).catch(error => { errors.value.push(error); });
    }

    function getSuppliersByMaterialId(materialId) {
        const offerSupplierIds = supplierOffers.value
            .filter(o => String(o.materialId) === String(materialId))
            .map(o => String(o.supplierId));
        return suppliers.value.filter(s => offerSupplierIds.includes(String(s.id)));
    }

    function getSupplierOffer(materialId, supplierSocialReason) {
        const supplier = suppliers.value.find(s => s.socialReason === supplierSocialReason);
        if (!supplier) return null;
        return supplierOffers.value.find(o =>
            String(o.materialId) === String(materialId) &&
            String(o.supplierId) === String(supplier.id)
        ) ?? null;
    }

    return {
        suppliers, supplierOffers, errors,
        suppliersLoaded, supplierOffersLoaded,
        filteredSuppliers, activeFilter, inactiveFilter, searchRuc, selectedSupplier,
        activeCount, inactiveCount,
        setSelectedSupplier, toggleActiveFilter, toggleInactiveFilter,
        setSearchRuc, clearFilters,
        fetchSuppliers, fetchSupplierOffers,
        getSuppliersByMaterialId, getSupplierOffer,
        addSupplier, updateSupplier, deleteSupplier,
        addSupplierOffer, removeSupplierOffer,
    };
});

export default useSupplierStore;
