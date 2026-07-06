import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { MachineryEntity } from "@/domains/logistics/domain/model/machinery/machinery.entity.js";
import { MachineryAssignmentEntity } from "@/domains/logistics/domain/model/machinery/machineryAssignment.entity.js";
import { MachineryAssembler } from "@/domains/logistics/infrastructure/machinery/machinery.assembler.js";
import { MachineryAssignmentAssembler } from "@/domains/logistics/infrastructure/machinery/machineryAssignment.assembler.js";
import {MachineryApi} from "../infrastructure/machinery.api.js";

const machineryApi = new MachineryApi();

const ENTITY_FIELDS = ['id', 'projectId', 'machineryId', 'name', 'status', 'assignedTo', 'assignedWorkerId', 'registrationDate', 'maintenanceHours', 'assignmentDetail'];

function stripExtraFields(obj) {
    const clean = {};
    for (const key of ENTITY_FIELDS) {
        if (key in obj) clean[key] = obj[key];
    }
    return clean;
}

const useMachineryStore = defineStore('machinery', () => {

    const errors = ref([]);
    const assignments = ref([]);
    const catalog = ref([]);
    const assignmentsLoaded = ref(false);
    const catalogLoaded = ref(false);

    const machineryView = computed(() =>
        assignments.value.map(a => {
            const machine = catalog.value.find(c => c.id === a.machineryId);
            return {
                ...a,
                machineryName: machine?.name ?? a.machineryId ?? '---',
                machineryModel: machine?.model ?? '',
            };
        })
    );

    function fetchCatalog() {
        machineryApi.getMachinery().then(response => {
            const data = Array.isArray(response?.data) ? response.data : [];
            catalog.value = MachineryAssembler.toEntitiesFromResponse({ status: 200, data });
            catalogLoaded.value = true;
        }).catch(error => {
            console.warn('No se pudo cargar el catálogo de maquinaria', error);
            catalogLoaded.value = true;
        });
    }

    function addCatalogItem(item, onSuccess, onError) {
        return machineryApi.createMachinery(item).then(response => {
            const [newItem] = MachineryAssembler.toEntitiesFromResponse(response);
            if (newItem) catalog.value.push(newItem);
            onSuccess?.(newItem);
        }).catch(error => { errors.value.push(error); onError?.(error); });
    }

    function fetchAssignments() {
        const projectId = localStorage.getItem('currentProjectId');
        machineryApi.getMachineryAssignments(projectId).then(response => {
            const data = Array.isArray(response?.data) ? response.data : (response?.data?.[Symbol.iterator] ? [...response.data] : [response.data].filter(Boolean));
            assignments.value = MachineryAssignmentAssembler.toEntitiesFromResponse({ status: 200, data });
            assignmentsLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function fetchMachinery() {
        fetchCatalog();
        fetchAssignments();
    }

    function addAssignment(item, onSuccess, onError) {
        return machineryApi.createMachineryAssignment(stripExtraFields(item)).then(response => {
            const newItems = MachineryAssignmentAssembler.toEntitiesFromResponse(response);
            assignments.value.push(...newItems);
            onSuccess?.(newItems);
        }).catch(error => { errors.value.push(error); onError?.(error); });
    }

    function updateAssignment(id, updates, onSuccess, onError) {
        const payload = stripExtraFields(updates);
        payload.id = id;
        return machineryApi.updateMachineryAssignment(payload).then(response => {
            const [updated] = MachineryAssignmentAssembler.toEntitiesFromResponse(response);
            if (!updated) return;
            const index = assignments.value.findIndex(a => a.id === id);
            if (index !== -1) assignments.value[index] = updated;
            onSuccess?.();
        }).catch(error => { errors.value.push(error); onError?.(error); });
    }

    function deleteAssignment(id, onSuccess, onError) {
        return machineryApi.deleteMachineryAssignment(id).then(() => {
            assignments.value = assignments.value.filter(a => a.id !== id);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); onError?.(error); });
    }

    return {
        assignments, catalog, errors,
        assignmentsLoaded, catalogLoaded,
        machineryView,
        fetchMachinery, fetchCatalog, fetchAssignments,
        addCatalogItem, addAssignment, updateAssignment, deleteAssignment,
    };
});

export default useMachineryStore;
