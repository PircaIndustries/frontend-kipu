import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { LogisticsApi } from "@/domains/logistics/infrastructure/logistics.api.js";
import { MachineryEntity } from "@/domains/logistics/domain/model/machinery/machinery.entity.js";
import { MachineryAssignmentEntity } from "@/domains/logistics/domain/model/machinery/machineryAssignment.entity.js";
import { MachineryAssembler } from "@/domains/logistics/infrastructure/machinery/machinery.assembler.js";
import { MachineryAssignmentAssembler } from "@/domains/logistics/infrastructure/machinery/machineryAssignment.assembler.js";

const logisticsApi = new LogisticsApi();

const ENTITY_FIELDS = ['id', 'projectId', 'machineryId', 'status', 'assignedTo', 'registrationDate', 'maintenanceHours', 'assignmentDetail'];

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
        logisticsApi.getMachinery().then(response => {
            catalog.value = MachineryAssembler.toEntitiesFromResponse(response);
            catalogLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function fetchAssignments() {
        logisticsApi.getMachineryAssignments().then(response => {
            assignments.value = MachineryAssignmentAssembler.toEntitiesFromResponse(response);
            assignmentsLoaded.value = true;
        }).catch(error => { errors.value.push(error); });
    }

    function fetchMachinery() {
        fetchCatalog();
        fetchAssignments();
    }

    function addAssignment(item, onSuccess, onError) {
        return logisticsApi.createMachineryAssignment(stripExtraFields(item)).then(response => {
            const newItems = MachineryAssignmentAssembler.toEntitiesFromResponse(response);
            assignments.value.push(...newItems);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); onError?.(error); });
    }

    function updateAssignment(id, updates, onSuccess, onError) {
        const payload = stripExtraFields(updates);
        payload.id = id;
        return logisticsApi.updateMachineryAssignment(payload).then(response => {
            const [updated] = MachineryAssignmentAssembler.toEntitiesFromResponse(response);
            if (!updated) return;
            const index = assignments.value.findIndex(a => a.id === id);
            if (index !== -1) assignments.value[index] = updated;
            onSuccess?.();
        }).catch(error => { errors.value.push(error); onError?.(error); });
    }

    function deleteAssignment(id, onSuccess, onError) {
        return logisticsApi.deleteMachineryAssignment(id).then(() => {
            assignments.value = assignments.value.filter(a => a.id !== id);
            onSuccess?.();
        }).catch(error => { errors.value.push(error); onError?.(error); });
    }

    return {
        assignments, catalog, errors,
        assignmentsLoaded, catalogLoaded,
        machineryView,
        fetchMachinery, fetchCatalog, fetchAssignments,
        addAssignment, updateAssignment, deleteAssignment,
    };
});

export default useMachineryStore;
