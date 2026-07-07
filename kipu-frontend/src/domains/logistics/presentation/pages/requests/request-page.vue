<script setup>
import {onMounted, computed, ref} from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import useRequestStore from '@/domains/logistics/application/requests.store.js'
import useSupplierStore from '@/domains/logistics/application/supplier.store.js'
import { useCurrentUser } from '@/domains/logistics/application/useCurrentUser.js'
import RequestList from '@/domains/logistics/presentation/components/requests/request-list.vue'
import FilterMenu from "@/shared/presentation/components/FilterMenu.vue"
import FilterSummaryBar from "@/shared/presentation/components/FilterSummaryBar.vue"
import { useRouter } from 'vue-router'
import RequestDetailDialog from "@/domains/logistics/presentation/components/requests/request-detail-dialog.vue";
import RequestModifyDialog from "@/domains/logistics/presentation/components/requests/form/request-modify-dialog.vue";

const { t } = useI18n()
const requestStore = useRequestStore()
const supplierStore = useSupplierStore()
const router = useRouter()
const toast = useToast()
const { isLogistics, isGestor, getUserId } = useCurrentUser()
const currentUserId = getUserId()
const {
  requestDetailsView,
  pendingRequestFilter,
  approvedRequestFilter,
  refusedRequestFilter,
  selectedRequestFilter,
  filteredRequests
} = storeToRefs(requestStore)

const pendingCount = computed(() =>
    requestDetailsView.value.filter(r => r.requestStatus === 'Pending').length
)
const approvedCount = computed(() =>
    requestDetailsView.value.filter(r => r.requestStatus === 'Accepted').length
)
const refusedCount = computed(() =>
    requestDetailsView.value.filter(r => r.requestStatus === 'Refused').length
)

const selectedFilterModel = computed({
  get: () => selectedRequestFilter.value,
  set: (val) => requestStore.setSelectedRequestFilter(val)
})

onMounted(() => {
  requestStore.fetchMaterials()
  requestStore.fetchCategories()
  supplierStore.fetchSupplierOffers()
  requestStore.fetchRequests()
  requestStore.fetchBudgetLines()
})

const handleCreateRequest = () => {
  router.push({ name: 'request-create' })
}

const filterItems = computed(() => [
  { key: 'all', label: t('request.filters.all') },
  { key: 'within-budget', label: t('request.filters.within-budget') },
  { key: 'out-budget', label: t('request.filters.exceed-budget') },
  { key: 'expire-48h', label: t('request.filters.expire-48h') }
])

const statusFilters = computed(() => [
  {
    label: t('request.summary.pending'),
    value: pendingCount.value,
    icon: 'pi-clock',
    variant: 'warning',
    active: pendingRequestFilter.value,
    onClick: () => requestStore.togglePendingRequestFilter()
  },
  {
    label: t('request.summary.approved-today'),
    value: approvedCount.value,
    icon: 'pi-check-circle',
    variant: 'success',
    active: approvedRequestFilter.value,
    onClick: () => requestStore.toggleApprovedRequestFilter()
  },
  {
    label: t('request.summary.rejected'),
    value: refusedCount.value,
    icon: 'pi-times-circle',
    variant: 'danger',
    active: refusedRequestFilter.value,
    onClick: () => requestStore.toggleRefusedRequestFilter()
  }
])

const showDetailDialog = ref(false)
const selectedRequest = ref(null)
const handleDetail = (request) => {
  selectedRequest.value = request
  showDetailDialog.value = true
}
const showModifyDialog = ref(false)
const selectedModifyRequest = ref(null)

const handleModify = (request) => {
  selectedModifyRequest.value = request
  showModifyDialog.value = true
}

const handleApproveRequest = async (event) => {
  try {
    await requestStore.approveRequest(event.id);
    await requestStore.fetchRequests();
    requestStore.fetchBudgetLines();
    toast.add({
      severity: 'success',
      summary: 'Solicitud Aprobada',
      detail: 'La solicitud ha sido aprobada con éxito.',
      life: 3000
    });
  } catch (error) {
    console.error(error);
    const detail = error?.response?.data?.message || error?.response?.data || 'No se pudo aprobar la solicitud.';
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: typeof detail === 'string' ? detail : (detail?.detail || detail?.message || JSON.stringify(detail)),
      life: 5000
    });
  }
};
</script>

<template>
  <pv-toast />
  <section class="flex flex-col gap-6 p-4 md:p-6 h-full">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-0.5">
        <h1 class="text-2xl font-bold text-primary tracking-tight m-0">
          {{ t('request.title') }}
        </h1>
      </div>
      <button
          v-if="isGestor()"
          @click="handleCreateRequest"
          class="w-full md:w-60 bg-accent text-white py-2.5 rounded-lg font-bold text-base shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
      >
        <i class="pi pi-plus-circle text-lg"></i>
        <span>{{ t('request.button-create') }}</span>
      </button>
    </header>

    <div class="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <div class="overflow-x-auto w-full">
          <RequestList
              :requests="filteredRequests"
              :current-user-id="currentUserId"
              @detail="handleDetail"
              @modify="handleModify"
          />
        </div>
      </div>

      <aside class="w-full md:w-60 flex flex-col gap-6 shrink-0">
        <FilterSummaryBar
            :title="t('general.summary')"
            :filters="statusFilters"
        />

        <FilterMenu
            v-model="selectedFilterModel"
            :title="t('request.filters.title')"
            :items="filterItems"
        />
      </aside>
    </div>
    <RequestDetailDialog
        v-model:visible="showDetailDialog"
        :request="selectedRequest"
        :can-approve="isLogistics()"
        @approve="handleApproveRequest"
        @reject="requestStore.rejectRequest($event.id).then(() => requestStore.fetchRequests())"
    />
    <RequestModifyDialog
        v-model:visible="showModifyDialog"
        :request="selectedModifyRequest"
        @modified="requestStore.fetchRequests()"
    />
  </section>
</template>