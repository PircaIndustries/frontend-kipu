<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from 'primevue/confirmdialog'
import useSupplierStore from '@/domains/logistics/application/supplier.store.js'
import SupplierList from '@/domains/logistics/presentation/components/suppliers/supplier-list.vue'
import FilterSummaryBar from '@/shared/presentation/components/FilterSummaryBar.vue'
import SupplierEditDialog from '@/domains/logistics/presentation/components/suppliers/form/supplier-edit-dialog.vue'
import SupplierCreateForm from '@/domains/logistics/presentation/components/suppliers/form/supplier-create-form.vue'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const supplierStore = useSupplierStore()

const {
  filteredSuppliers,
  activeCount,
  inactiveCount,
  activeFilter,
  inactiveFilter
} = storeToRefs(supplierStore)

const searchInput = ref('')
watch(searchInput, (val) => { supplierStore.setSearchRuc(val) })

const statusFilters = computed(() => [
  {
    label: t('suppliers.summary.active'),
    value: activeCount.value,
    icon: 'pi-check-circle',
    variant: 'success',
    active: activeFilter.value,
    onClick: () => supplierStore.toggleActiveFilter()
  },
  {
    label: t('suppliers.summary.inactive'),
    value: inactiveCount.value,
    icon: 'pi-times-circle',
    variant: 'danger',
    active: inactiveFilter.value,
    onClick: () => supplierStore.toggleInactiveFilter()
  }
])

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingSupplier = ref(null)

const handleEdit = (supplier) => {
  editingSupplier.value = { ...supplier }
  showEditDialog.value = true
}

const handleDelete = (supplier) => {
  confirm.require({
    message: `${t('suppliers.delete.message')} ${supplier.socialReason}?`,
    header: t('suppliers.delete.title'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('suppliers.delete.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('suppliers.delete.confirm'), severity: 'danger' },
    accept: () => {
      supplierStore.deleteSupplier(supplier.id, () => {
        toast.add({ severity: 'success', summary: t('suppliers.edit.success.summary'), detail: t('suppliers.edit.success.message'), life: 3000 })
      })
    }
  })
}

onMounted(() => {
  supplierStore.fetchSuppliers()
  supplierStore.fetchSupplierOffers()
})
</script>

<template>
  <section class="flex flex-col gap-6 p-6 h-full">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-primary">{{ t('suppliers.title') }}</h1>
      <button
          @click="showCreateDialog = true"
          class="w-60 bg-accent text-white py-2.5 rounded-lg font-bold text-base shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
      >
        <i class="pi pi-plus-circle text-lg"></i>
        <span>{{ t('suppliers.button-create') }}</span>
      </button>
    </header>
    <div class="flex gap-6 flex-1 min-h-0">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <SupplierList
            :suppliers="filteredSuppliers"
            @edit="handleEdit"
            @delete="handleDelete"
        />
      </div>
      <aside class="w-60 flex flex-col gap-6 shrink-0">
        <FilterSummaryBar :title="t('suppliers.filters.status')" :filters="statusFilters" />
        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
            {{ t('suppliers.filters.search') }}
          </h3>
          <span class="p-input-icon-left">
            <i class="pi pi-search text-neutral-border" />
            <pv-inputtext v-model="searchInput" :placeholder="t('suppliers.filters.search-ruc')" class="w-full" />
          </span>
        </div>
      </aside>
    </div>
  </section>

  <SupplierCreateForm
      v-model:visible="showCreateDialog"
      @saved="supplierStore.fetchSuppliers()"
  />

  <SupplierEditDialog
      v-model:visible="showEditDialog"
      :supplier="editingSupplier"
      @saved="supplierStore.fetchSuppliers()"
  />

  <ConfirmDialog />
</template>