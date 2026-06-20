<script setup>
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import useWasteStore from '@/domains/logistics/application/waste.store.js';
import useInventoryStore from '@/domains/logistics/application/inventory.store.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';
import WasteList from '@/domains/logistics/presentation/components/waste/waste-list.vue';
import FilterSummaryBar from '@/shared/presentation/components/FilterSummaryBar.vue';
import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue';
import SelectWithAddComponent from '@/shared/presentation/components/selectWithAddComponent.vue';
import WasteReportForm from '@/domains/logistics/presentation/components/waste/form/waste-report-form.vue';
import {getMeasureUnitLabel} from "@/domains/logistics/domain/model/materials/measureUnit.map.js";

const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const wasteStore = useWasteStore();
const inventoryStore = useInventoryStore();
const projectsStore = useProjectsStore();

const { waste, wasteLoaded, classifications } = storeToRefs(wasteStore);
const { materials } = storeToRefs(inventoryStore);

const currentProjectId = computed(() => projectsStore.currentProjectId);

const enrichedWaste = computed(() =>
  waste.value
    .filter(w => w.projectId === currentProjectId.value)
    .map(w => {
      const material = materials.value.find(m => m.id === w.materialId);
      return {
        ...w,
        materialName: material?.name ?? w.materialId ?? '---',
        materialUnit: getMeasureUnitLabel(material?.measureUnit)
      };
    })
);

const dateRange = ref(null);
const selectedClassification = ref(null);
const selectedMaterial = ref(null);
const searchText = ref('');

const classificationFilterOptions = computed(() =>
  classifications.value.map(c => ({ name: c.name }))
);

const materialFilterOptions = computed(() => {
  const uniqueMaterials = new Map();
  enrichedWaste.value.forEach(w => {
    if (!uniqueMaterials.has(w.materialId)) {
      uniqueMaterials.set(w.materialId, {
        id: w.materialId,
        name: w.materialName
      });
    }
  });
  return Array.from(uniqueMaterials.values());
});

const filteredWaste = computed(() => {
  let records = [...enrichedWaste.value];

  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const [start, end] = dateRange.value;
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    records = records.filter(w => w.date >= startStr && w.date <= endStr);
  }

  if (selectedClassification.value) {
    const term = selectedClassification.value.name.toUpperCase();
    records = records.filter(w => (w.classificationType || '').toUpperCase() === term);
  }

  if (selectedMaterial.value) {
    records = records.filter(w => w.materialId === selectedMaterial.value.id);
  }

  if (searchText.value.trim()) {
    const term = searchText.value.trim().toLowerCase();
    records = records.filter(w =>
      w.id.toLowerCase().includes(term) ||
      (w.materialName && w.materialName.toLowerCase().includes(term)) ||
      (w.classificationType && w.classificationType.toLowerCase().includes(term)) ||
      (w.description && w.description.toLowerCase().includes(term))
    );
  }

  return records;
});

const totalRecords = computed(() => filteredWaste.value.length);
const totalDiscountedUnits = computed(() =>
  filteredWaste.value.reduce((sum, w) => sum + (w.quantity || 0), 0)
);

const summaryFilters = computed(() => [
  {
    label: t('waste.summary.total-records'),
    value: totalRecords.value,
    icon: 'pi-file',
    variant: 'neutral',
    active: !dateRange.value && !selectedClassification.value && !selectedMaterial.value && !searchText.value,
    onClick: () => {
      dateRange.value = null;
      selectedClassification.value = null;
      selectedMaterial.value = null;
      searchText.value = '';
    }
  },
  {
    label: t('waste.summary.total-units'),
    value: totalDiscountedUnits.value,
    icon: 'pi-box',
    variant: 'info',
    active: false,
    onClick: () => {}
  }
]);

const showCreateDialog = ref(false);

function onAddClassification(name) {
  wasteStore.addClassification(name, () => {
    selectedClassification.value = { name };
    toast.add({
      severity: 'success',
      summary: t('waste.classification.added.summary'),
      detail: t('waste.classification.added.detail', { name }),
      life: 2000
    })
  })
}

const handleDelete = (wasteRecord) => {
  confirm.require({
    message: `${t('waste.delete.message')} ${wasteRecord.id}?`,
    header: t('waste.delete.title'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('waste.delete.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('waste.delete.confirm'), severity: 'danger' },
    accept: () => {
      wasteStore.deleteWaste(wasteRecord.id, () => {
        toast.add({
          severity: 'success',
          summary: t('waste.delete.success.summary'),
          detail: t('waste.delete.success.detail'),
          life: 3000
        });
      });
    }
  });
};

onMounted(() => {
  wasteStore.fetchWaste();
  wasteStore.fetchClassifications();
  if (inventoryStore.materials.length === 0) {
    inventoryStore.fetchMaterials();
  }
  if (!inventoryStore.inventoryLoaded) {
    inventoryStore.fetchInventory();
  }
});
</script>

<template>
  <section class="flex flex-col gap-6 p-4 md:p-6 h-full">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary tracking-tight m-0">
          {{ t('waste.title') }}
        </h1>
        <p v-if="wasteLoaded" class="text-sm text-neutral-border mt-1">
          {{ t('waste.subtitle', { count: enrichedWaste.length }) }}
        </p>
      </div>
      <button
        @click="showCreateDialog = true"
        class="bg-accent text-white py-2.5 px-6 rounded-lg font-bold text-base shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 w-full md:w-auto"
      >
        <i class="pi pi-plus-circle text-lg"></i>
        <span>{{ t('waste.button-register') }}</span>
      </button>
    </header>

    <div class="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-border text-sm"></i>
          <input
            v-model="searchText"
            type="text"
            :placeholder="t('waste.search.placeholder')"
            class="w-full pl-9 pr-4 py-2 border border-neutral-border/30 rounded-lg text-sm placeholder:text-neutral-border/70 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div class="overflow-x-auto w-full">
          <WasteList :waste-records="filteredWaste" />
        </div>

        <div v-if="filteredWaste.length === 0 && wasteLoaded" class="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div class="w-14 h-14 rounded-full bg-neutral-bg flex items-center justify-center">
            <i class="pi pi-inbox text-2xl text-neutral-border"></i>
          </div>
          <p class="text-sm font-medium text-primary m-0">{{ t('waste.empty.title') }}</p>
          <p class="text-xs text-neutral-border m-0">{{ t('waste.empty.description') }}</p>
        </div>
      </div>

      <aside class="w-full md:w-64 flex flex-col gap-6 shrink-0">
        <FilterSummaryBar :title="t('waste.summary.title')" :filters="summaryFilters" />

        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
            {{ t('waste.filters.classification') }}
          </h3>
          <SelectWithAddComponent
            v-model="selectedClassification"
            :options="classificationFilterOptions"
            :placeholder="t('waste.filters.classification-placeholder')"
            :add-label="t('waste.classification.add-label')"
            :add-placeholder="t('waste.classification.add-placeholder')"
            @add="onAddClassification"
          />
        </div>

        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
            {{ t('waste.filters.material') }}
          </h3>
          <AutocompleteComponent
            v-model="selectedMaterial"
            :options="materialFilterOptions"
            :placeholder="t('waste.filters.material-placeholder')"
            return-object
          />
        </div>

        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
            {{ t('waste.filters.date-range') }}
          </h3>
          <pv-datepicker
            v-model="dateRange"
            selectionMode="range"
            :placeholder="t('waste.filters.date-placeholder')"
            class="w-full"
            dateFormat="mm/dd/yy"
            showButtonBar
            :manualInput="false"
          />
        </div>
      </aside>
    </div>
  </section>

  <WasteReportForm
    v-if="showCreateDialog"
    @saved="wasteStore.fetchWaste()"
    @close="showCreateDialog = false"
  />

  <pv-confirmdialog />
</template>
