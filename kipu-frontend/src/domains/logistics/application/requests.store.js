import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useProjectsStore } from "@/domains/project-management/data/useProjectsStore.js";
import {MaterialRequestEntity} from "@/domains/logistics/domain/model/requests/materialRequest.entity.js";
import { MaterialEntity } from "@/domains/logistics/domain/model/materials/material.entity.js";
import { CategoryEntity } from "@/domains/logistics/domain/model/materials/category.entity.js";
import {MaterialRequestAssembler} from "@/domains/logistics/infrastructure/requests/materialRequest.assembler.js";
import { MaterialAssembler } from "@/domains/logistics/infrastructure/materials/material.assembler.js";
import { CategoryAssembler } from "@/domains/logistics/infrastructure/materials/category.assembler.js";
import {RequestsApi} from "../infrastructure/requests.api.js";
import {MaterialsApi} from "../infrastructure/materials.api.js";
import {CategoriesApi} from "../infrastructure/categories.api.js";

const requestApi = new RequestsApi();
const materialsApi = new MaterialsApi();
const categoriesApi = new CategoriesApi();

const useRequestStore = defineStore('request', () => {
    const projectsStore = useProjectsStore();

    const requests = ref([]);
    const materials = ref([]);
    const categories = ref([]);
    const errors = ref([]);
    const requestsLoaded = ref(false);
    const materialsLoaded = ref(false);
    const categoriesLoaded = ref(false);

    const requestDetailsView = computed(() => {
        const currentMaterials = materials.value;
        const currentCategories = categories.value.filter(c => c.isActive);

        return requests.value.map(request => {
                const enrichedItems = request.items.map(item => {
                    const material = currentMaterials.find(m => m.id === item.materialCatalogId);
                    const category = currentCategories.find(c => c.id === material?.categoryId);

                    return {
                        ...item,
                        materialName: material?.name ?? 'Unknown Name',
                        categoryName: category?.name ?? 'Unknown Category',
                    };
                });

                return {
                    ...request,
                    items: enrichedItems,
                };
            });
    });

    const selectedRequestFilter = ref('');
    const pendingRequestFilter = ref(false);
    const approvedRequestFilter = ref(false);
    const refusedRequestFilter = ref(false);

    const filteredRequests = computed(() => {
        let result = requestDetailsView.value;

        if (pendingRequestFilter.value) result = result.filter(r => r.requestStatus === 'Pending');
        if (approvedRequestFilter.value) result = result.filter(r => r.requestStatus === 'Accepted');
        if (refusedRequestFilter.value) result = result.filter(r => r.requestStatus === 'Refused');

        const filter = selectedRequestFilter.value;
        if (filter === 'expire-48h') {
            const now = Date.now();
            result = result.filter(r => {
                const diff = new Date(r.deadline).getTime() - now;
                const days = diff / (1000 * 60 * 60 * 24);
                return days <= 2 && days >= 0;
            });
        }
        return result;
    });

    function setSelectedRequestFilter(filter) { selectedRequestFilter.value = filter; }
    function togglePendingRequestFilter() { pendingRequestFilter.value = !pendingRequestFilter.value; approvedRequestFilter.value = false; refusedRequestFilter.value = false; }
    function toggleApprovedRequestFilter() { approvedRequestFilter.value = !approvedRequestFilter.value; pendingRequestFilter.value = false; refusedRequestFilter.value = false; }
    function toggleRefusedRequestFilter() { refusedRequestFilter.value = !refusedRequestFilter.value; pendingRequestFilter.value = false; approvedRequestFilter.value = false; }

    function fetchRequests() {
        const projectId = Number(projectsStore.currentProjectId) || null;
        console.log('[requests.store] fetchRequests, projectId:', projectId, 'from store:', projectsStore.currentProjectId);
        requestApi.getMaterialRequestsByProject(projectId).then(response => {
            console.log('[requests.store] fetchRequests response:', response?.data);
            requests.value = MaterialRequestAssembler.toEntitiesFromResponse(response);
            requestsLoaded.value = true;
        }).catch(error => {
            console.error('[requests.store] fetchRequests error:', error);
            errors.value.push(error);
        });
    }

    function fetchMaterials() {
        materialsApi.getMaterials().then(response => {
            materials.value = MaterialAssembler.toEntitiesFromResponse(response);
            materialsLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function fetchCategories() {
        categoriesApi.getCategories().then(response => {
            categories.value = CategoryAssembler.toEntitiesFromResponse(response);
            categoriesLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function createRequest(request, onSuccess, onError) {
        if (!request.projectId) {
            request.projectId = Number(projectsStore.currentProjectId) || null;
        }
        console.log('[requests.store] createRequest payload:', JSON.stringify(request));
        requestApi.createMaterialRequest(request).then(response => {
            console.log('[requests.store] createRequest response:', response?.data);
            const newRequests = MaterialRequestAssembler.toEntitiesFromResponse(response);
            requests.value.push(...newRequests);
            onSuccess?.();
        }).catch(error => {
            console.error('[requests.store] createRequest error:', error);
            errors.value.push(error);
            onError?.();
        });
    }

    function updateRequest(id, updates, onSuccess) {
        const payload = { id, ...updates };
        requestApi.updateMaterialRequest(payload).then(response => {
            const [updated] = MaterialRequestAssembler.toEntitiesFromResponse(response);
            if (!updated) return;
            const index = requests.value.findIndex(r => r.id === id);
            if (index !== -1) requests.value[index] = updated;
            onSuccess?.();
        }).catch(error => { errors.value.push(error); });
    }

    function rejectRequest(id) {
        return requestApi.updateMaterialRequest({ id, requestStatus: 'Refused' })
            .then(response => {
                const [updated] = MaterialRequestAssembler.toEntitiesFromResponse(response);
                if (!updated) return;
                const index = requests.value.findIndex(r => r.id === id);
                if (index !== -1) requests.value[index] = { ...requests.value[index], ...updated };
            })
            .catch(error => { errors.value.push(error); throw error; });
    }

    function approveRequest(id) {
        return requestApi.updateMaterialRequest({ id, requestStatus: 'Accepted' })
            .then(response => {
                const [updated] = MaterialRequestAssembler.toEntitiesFromResponse(response);
                if (!updated) return;
                const index = requests.value.findIndex(r => r.id === id);
                if (index !== -1) requests.value[index] = { ...requests.value[index], ...updated };
            })
            .catch(error => { errors.value.push(error); throw error; });
    }

    return {
        requests, materials, categories, errors,
        requestsLoaded, materialsLoaded, categoriesLoaded,
        requestDetailsView, filteredRequests,
        selectedRequestFilter, pendingRequestFilter, approvedRequestFilter, refusedRequestFilter,
        setSelectedRequestFilter,
        togglePendingRequestFilter, toggleApprovedRequestFilter, toggleRefusedRequestFilter,
        fetchMaterials, fetchCategories, fetchRequests,
        createRequest, updateRequest, approveRequest, rejectRequest
    };
});

export default useRequestStore;
