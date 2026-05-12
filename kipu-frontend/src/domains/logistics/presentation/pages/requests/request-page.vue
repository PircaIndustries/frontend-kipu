<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useRequestStore from '@/domains/logistics/application/requests.store.js'
import RequestList from '@/domains/logistics/presentation/components/requests/request-list.vue'
import FilterMenu from "@/shared/presentation/components/FilterMenu.vue"
import FilterSummaryBar from "@/shared/presentation/components/FilterSummaryBar.vue"

const { t } = useI18n()
const requestStore = useRequestStore()

const {
  requestDetailsView,
  pendingRequestFilter,
  approvedRequestFilter,
  refusedRequestFilter,
  selectedRequestFilter,
  filteredRequests
} = storeToRefs(requestStore)

const pendingCount = computed(() =>
    requestDetailsView.value.filter(r => r.status === 'PENDING').length
)
const approvedCount = computed(() =>
    requestDetailsView.value.filter(r => r.status === 'APPROVED').length
)
const refusedCount = computed(() =>
    requestDetailsView.value.filter(r => r.status === 'REFUSED').length
)

const selectedFilterModel = computed({
  get: () => selectedRequestFilter.value,
  set: (val) => requestStore.setSelectedRequestFilter(val)
})

onMounted(() => {
  requestStore.fetchMaterials()
  requestStore.fetchCategories()
  requestStore.fetchSupplierOffers()
  requestStore.fetchRequests()
})

const handleCreateRequest = () => {
  // router.push({ name: 'request-create' })
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
</script>

<template>
  <section class="flex flex-col gap-6 p-6 h-full">
    <header class="flex items-center justify-between">
      <div class="flex flex-col gap-0.5">
        <h1 class="text-2xl font-bold text-primary tracking-tight m-0">
          {{ t('request.title') }}
        </h1>
      </div>
      <button
          @click="handleCreateRequest"
          class="w-60 bg-accent text-white py-2.5 rounded-lg font-bold text-base shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
      >
        <i class="pi pi-plus-circle text-lg"></i>
        <span>{{ t('request.button-create') }}</span>
      </button>
    </header>

    <div class="flex gap-6 flex-1 min-h-0">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <RequestList
            :requests="filteredRequests"
            :available-budget="0"
            :total-budget="0"
        />
      </div>

      <aside class="w-60 flex flex-col gap-6 shrink-0">
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
  </section>
</template>