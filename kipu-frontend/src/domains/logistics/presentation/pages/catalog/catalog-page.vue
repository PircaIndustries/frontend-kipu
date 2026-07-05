<script setup>
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import SelectButton from 'primevue/selectbutton';
import useCatalogStore from '@/domains/logistics/application/catalog.store.js';
import useInventoryStore from '@/domains/logistics/application/inventory.store.js';
import { useCurrentUser } from '@/domains/logistics/application/useCurrentUser.js';
import ConfirmDialog from 'primevue/confirmdialog';
import MaterialsCatalogList from '@/domains/logistics/presentation/components/catalog/materials-catalog-list.vue';
import MachineryCatalogList from '@/domains/logistics/presentation/components/catalog/machinery-catalog-list.vue';
import MaterialCatalogDialog from '@/domains/logistics/presentation/components/catalog/form/material-catalog-dialog.vue';
import MachineryCatalogDialog from '@/domains/logistics/presentation/components/catalog/form/machinery-catalog-dialog.vue';

const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const catalogStore = useCatalogStore();
const inventoryStore = useInventoryStore();
const { isLogistics } = useCurrentUser();

const catalogType = ref('materials');

const catalogTypeOptions = [
  { label: t('catalog.tabs.materials'), value: 'materials' },
  { label: t('catalog.tabs.machinery'), value: 'machinery' },
];

const showMaterialDialog = ref(false);
const showMachineryDialog = ref(false);
const editingMaterial = ref(null);
const editingMachinery = ref(null);

const searchMaterial = ref('');
const searchMachinery = ref('');

function openCreateMaterial() {
  editingMaterial.value = null;
  showMaterialDialog.value = true;
}

function openCreateMachinery() {
  editingMachinery.value = null;
  showMachineryDialog.value = true;
}

function handleEditMaterial(item) {
  editingMaterial.value = { ...item };
  showMaterialDialog.value = true;
}

function handleEditMachinery(item) {
  editingMachinery.value = { ...item };
  showMachineryDialog.value = true;
}

function handleDeleteMaterial(item) {
  confirm.require({
    message: `${t('catalog.materials.delete.message')} "${item.name}"?`,
    header: t('catalog.materials.delete.title'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    accept: () => {
      catalogStore.deleteMaterialCatalog(item.id, () => {
        toast.add({ severity: 'success', summary: t('catalog.materials.delete.success'), life: 3000 });
      });
    }
  });
}

function handleDeleteMachinery(item) {
  confirm.require({
    message: `${t('catalog.machinery.delete.message')} "${item.name}"?`,
    header: t('catalog.machinery.delete.title'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    accept: () => {
      catalogStore.deleteMachineryCatalog(item.id, () => {
        toast.add({ severity: 'success', summary: t('catalog.machinery.delete.success'), life: 3000 });
      });
    }
  });
}

onMounted(() => {
  catalogStore.fetchAll();
  inventoryStore.fetchCategories();
});
</script>

<template>
  <section class="flex flex-col gap-6 p-4 md:p-6 h-full">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-primary">{{ t('catalog.title') }}</h1>
        <SelectButton
            v-model="catalogType"
            :options="catalogTypeOptions"
            optionLabel="label"
            optionValue="value"
            size="small"
        />
      </div>
      <button
          v-if="catalogType === 'materials' && isLogistics()"
          @click="openCreateMaterial"
          class="w-full md:w-60 bg-accent text-white py-2.5 rounded-lg font-bold text-base shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
      >
        <i class="pi pi-plus-circle text-lg"></i>
        <span>{{ t('catalog.materials.button-create') }}</span>
      </button>
      <button
          v-if="catalogType === 'machinery' && isLogistics()"
          @click="openCreateMachinery"
          class="w-full md:w-60 bg-accent text-white py-2.5 rounded-lg font-bold text-base shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
      >
        <i class="pi pi-plus-circle text-lg"></i>
        <span>{{ t('catalog.machinery.button-create') }}</span>
      </button>
    </header>

    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-1 min-w-0">
        <MaterialsCatalogList
            v-if="catalogType === 'materials'"
            :materials="catalogStore.filteredMaterialsCatalog"
            :loaded="catalogStore.materialsLoaded"
            :can-edit="isLogistics()"
            @edit="handleEditMaterial"
            @delete="handleDeleteMaterial"
        />
        <MachineryCatalogList
            v-if="catalogType === 'machinery'"
            :machinery="catalogStore.filteredMachineryCatalog"
            :loaded="catalogStore.machineryLoaded"
            :can-edit="isLogistics()"
            @edit="handleEditMachinery"
            @delete="handleDeleteMachinery"
        />
      </div>

      <aside class="w-full md:w-60 flex flex-col gap-2 shrink-0">
        <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
          {{ t('catalog.filters.search') }}
        </h3>
        <span class="p-input-icon-left">
          <i class="pi pi-search text-neutral-border" />
          <pv-inputtext
              v-if="catalogType === 'materials'"
              v-model="searchMaterial"
              :placeholder="t('catalog.filters.search-material')"
              class="w-full"
              @update:model-value="catalogStore.setSearchMaterial($event)"
          />
          <pv-inputtext
              v-if="catalogType === 'machinery'"
              v-model="searchMachinery"
              :placeholder="t('catalog.filters.search-machinery')"
              class="w-full"
              @update:model-value="catalogStore.setSearchMachinery($event)"
          />
        </span>
      </aside>
    </div>
  </section>

  <MaterialCatalogDialog
      v-model:visible="showMaterialDialog"
      :material="editingMaterial"
      :categories="inventoryStore.categories"
      @saved="catalogStore.fetchMaterialsCatalog()"
  />

  <MachineryCatalogDialog
      v-model:visible="showMachineryDialog"
      :machinery="editingMachinery"
      @saved="catalogStore.fetchMachineryCatalog()"
  />

  <ConfirmDialog />
</template>
