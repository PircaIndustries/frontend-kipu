<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue';
import useRequestStore from '@/domains/logistics/application/requests.store.js';
import useSupplierStore from '@/domains/logistics/application/supplier.store.js';
import { getMeasureUnitLabel } from '@/domains/logistics/domain/model/materials/measureUnit.map.js';
import { BudgetApi } from '@/domains/budget/infrastructure/budget-api.js';

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const requestStore = useRequestStore();
const supplierStore = useSupplierStore();
const budgetApi = new BudgetApi();

const categoryOptions = computed(() =>
    requestStore.categories.map(c => ({ name: c.name }))
);

const selectedCategory = ref('');
const selectedMaterial = ref('');
const selectedSupplier = ref('');
const selectedPriority = ref('Low');

const quantity = ref(1);
const requiredDate = ref(null);
const deliveryLocation = ref('');
const purpose = ref('');
const additionalNotes = ref('');

const selectedBudgetLineName = ref('');

const selectedBudgetLineId = computed(() => {
  if (!selectedBudgetLineName.value) return null;
  const match = budgetLineOptions.value.find(b =>
    `${String(b.id).padStart(2, '0')} - ${b.activityName || b.name}` === selectedBudgetLineName.value
  );
  return match ? match.id : null;
});
const budgetLineOptions = ref([]);
const budgetItems = ref([]);

const filteredMaterials = computed(() => {
  if (!selectedCategory.value) return [];
  const category = requestStore.categories.find(c => c.name === selectedCategory.value);
  if (!category) return [];
  return requestStore.materials.filter(m => m.categoryId === category.id);
});
const materialOptions = computed(() =>
    filteredMaterials.value.map(m => ({ name: m.name }))
);

const materialSelected = computed(() =>
    requestStore.materials.find(m => m.name === selectedMaterial.value)
);

const filteredSuppliers = computed(() => {
  if (!materialSelected.value) return [];
  return supplierStore.getSuppliersByMaterialId(materialSelected.value.id);
});
const supplierOptions = computed(() =>
    filteredSuppliers.value.map(s => ({ name: s.socialReason }))
);

const selectedSupplierObj = computed(() =>
    supplierStore.suppliers.find(s => s.socialReason === selectedSupplier.value)
);

const selectedOffer = computed(() =>
    supplierStore.getSupplierOffer(materialSelected.value?.id, selectedSupplier.value)
);
const selectedUnit = computed(() => materialSelected.value ? getMeasureUnitLabel(materialSelected.value.measureUnit) : '');
const selectedPrice = computed(() => selectedOffer.value?.unitPrice ?? 0);
const totalPrice = computed(() => quantity.value * selectedPrice.value);

function onCategoryChange() {
  selectedMaterial.value = '';
  selectedSupplier.value = '';
}

function onMaterialChange() {
  selectedSupplier.value = '';
}

const budgetLineAutocompleteOptions = computed(() =>
  budgetLineOptions.value.map(b => ({
    name: `${String(b.id).padStart(2, '0')} - ${b.activityName || b.name}`
  }))
);

const selectedBudgetItem = computed(() => {
  if (!selectedBudgetLineId.value) return null;
  return budgetItems.value.find(b => String(b.id) === String(selectedBudgetLineId.value));
});

const budgetAssigned = computed(() => Number(selectedBudgetItem.value?.assignedBudget || 0));
const budgetExecuted = computed(() => Number(selectedBudgetItem.value?.executedAmount || 0));
const budgetAvailable = computed(() => budgetAssigned.value - budgetExecuted.value);

const isWithinBudget = computed(() => {
  if (!selectedBudgetItem.value) return null;
  return totalPrice.value <= budgetAvailable.value;
});

const allFieldsValid = computed(() => {
  if (!selectedCategory.value) return false;
  if (!selectedMaterial.value) return false;
  if (!selectedSupplier.value) return false;
  if (!quantity.value || quantity.value < 1) return false;
  if (!deliveryLocation.value) return false;
  if (!purpose.value) return false;
  if (!requiredDate.value) return false;
  return true;
});

const submitted = ref(false);
const submitting = ref(false);

const onFormSubmit = () => {
  if (submitting.value) return;
  submitted.value = true;
  if (!allFieldsValid.value) return;
  submitting.value = true;

  const currentUserId = (() => {
    try { return Number(JSON.parse(localStorage.getItem('currentUser'))?.id) || 1; }
    catch { return 1; }
  })();

  const request = {
    deadline: requiredDate.value ? new Date(requiredDate.value).toISOString() : new Date().toISOString(),
    requestPriority: selectedPriority.value,
    deliveryLocation: deliveryLocation.value,
    budgetLineId: selectedBudgetLineId.value ? Number(selectedBudgetLineId.value) : null,
    purpose: purpose.value,
    additionalNotes: additionalNotes.value || null,
    requestedBy: currentUserId,
    items: [{
        materialCatalogId: Number(materialSelected.value?.id),
        supplierId: Number(selectedSupplierObj.value?.id),
        quantity: quantity.value,
        unitPrice: selectedPrice.value
    }]
  };
  requestStore.createRequest(request, () => {
    toast.add({ severity: 'success', summary: t('request.create.success.summary'), detail: t('request.create.success.message'), life: 3000 });
    router.push({ name: 'requests-list' });
  }, () => {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('request.create.error.message'), life: 4000 });
    submitting.value = false;
  });
  setTimeout(() => { submitting.value = false; }, 8000);
};

async function loadBudgetLines() {
  try {
    budgetItems.value = await budgetApi.findAll();
    budgetLineOptions.value = budgetItems.value.filter(b => b.assignedBudget > 0);
  } catch (e) {
    console.error('Failed to load budget lines', e);
  }
}

onMounted(() => {
  requestStore.fetchCategories();
  requestStore.fetchMaterials();
  supplierStore.fetchSuppliers();
  supplierStore.fetchSupplierOffers();
  loadBudgetLines();
});
</script>

<template>
  <pv-toast />
  <form @submit.prevent="onFormSubmit" class="flex flex-col gap-6 p-6 animate-fade-in">
    <header class="flex flex-col gap-0.5">
      <h1 class="text-2xl font-bold text-primary tracking-tight">
        {{ t('request.create.title') }}
      </h1>
      <p class="text-sm text-neutral-border">
        {{ t('request.create.subtitle') }}
      </p>
    </header>

    <div class="bg-white border border-neutral-border/20 rounded-m p-xl shadow-sm flex flex-col gap-l">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.category') }}
          </span>
          <autocomplete-component
              v-model="selectedCategory"
              :options="categoryOptions"
              :placeholder="t('request.create.placeholders.select')"
              :return-object="false"
              :invalid="submitted && !selectedCategory"
              @update:model-value="onCategoryChange"
          />
          <span v-if="submitted && !selectedCategory" class="text-xs text-danger">
            {{ t('request.create.validation.category-required') }}
          </span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.specific-material') }}
          </span>
          <autocomplete-component
              v-model="selectedMaterial"
              :options="materialOptions"
              :placeholder="selectedCategory ? t('request.create.placeholders.select') : t('request.create.placeholders.select-category-first')"
              :disabled="!selectedCategory"
              :return-object="false"
              :invalid="submitted && selectedCategory && !selectedMaterial"
              @update:model-value="onMaterialChange"
          />
          <span v-if="submitted && !selectedMaterial && selectedCategory" class="text-xs text-danger">
            {{ t('request.create.validation.material-required') }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('request.create.fields.suggested-supplier') }}
        </span>
        <autocomplete-component
            v-model="selectedSupplier"
            :options="supplierOptions"
            :placeholder="selectedMaterial ? t('request.create.placeholders.select') : t('request.create.placeholders.select-material-first')"
            :disabled="!selectedMaterial"
            :return-object="false"
            :invalid="submitted && selectedMaterial && !selectedSupplier"
        />
        <span v-if="submitted && !selectedSupplier && selectedMaterial" class="text-xs text-danger">
          {{ t('request.create.validation.supplier-required') }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.quantity') }}
          </span>
          <pv-inputnumber
              v-model="quantity"
              :min="1"
              showButtons
              buttonLayout="horizontal"
              :placeholder="t('request.create.placeholders.quantity')"
              :invalid="submitted && (!quantity || quantity < 1)"
              fluid
          >
            <template #incrementbuttonicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
              <span class="pi pi-minus" />
            </template>
          </pv-inputnumber>
          <span v-if="submitted && (!quantity || quantity < 1)" class="text-xs text-danger">
            {{ t('request.create.validation.quantity-required') }}
          </span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.unit') }}</span>
          <div class="w-full min-h-[2.5rem] flex items-center gap-2 px-4 rounded-m border border-neutral-border/20 bg-white text-sm">
            <span v-if="selectedUnit" class="text-primary font-medium">{{ selectedUnit }}</span>
            <span v-else class="text-neutral-border">{{ t('request.create.placeholders.unit-empty') }}</span>
            <span v-if="selectedPrice" class="ml-auto text-accent font-bold">S/ {{ selectedPrice }} / {{ selectedUnit }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.priority') }}
          </span>
          <pv-select
              v-model="selectedPriority"
              :options="['Low', 'Medium', 'High', 'Critical']"
              fluid
          >
            <template #value="slotProps">
              <span>{{ t(`request.create.priority.${slotProps.value.toLowerCase()}`) }}</span>
            </template>
            <template #option="slotProps">
              <span>{{ t(`request.create.priority.${slotProps.option.toLowerCase()}`) }}</span>
            </template>
          </pv-select>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('request.create.fields.budget-line') }}
        </span>
        <autocomplete-component
            v-model="selectedBudgetLineName"
            :options="budgetLineAutocompleteOptions"
            :placeholder="t('request.create.placeholders.select')"
            :return-object="false"
        />
      </div>

      <div
        v-if="selectedBudgetItem"
        class="border border-neutral-border/20 rounded-xl p-5 flex flex-col gap-4 bg-slate-50"
      >
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {{ t('request.create.budget-verification.title') }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="flex flex-col items-center bg-white rounded-lg p-3 border border-neutral-border/20">
            <span class="text-[10px] font-bold text-neutral-border uppercase tracking-wider">
              {{ t('request.create.budget-verification.item-budget') }}
            </span>
            <span class="text-lg font-black text-primary">
              S/ {{ budgetAssigned.toLocaleString() }}
            </span>
          </div>
          <div class="flex flex-col items-center bg-white rounded-lg p-3 border border-neutral-border/20">
            <span class="text-[10px] font-bold text-neutral-border uppercase tracking-wider">
              {{ t('request.create.budget-verification.executed') }}
            </span>
            <span class="text-lg font-black text-warning">
              S/ {{ budgetExecuted.toLocaleString() }}
            </span>
          </div>
          <div class="flex flex-col items-center bg-white rounded-lg p-3 border border-neutral-border/20">
            <span class="text-[10px] font-bold text-neutral-border uppercase tracking-wider">
              {{ t('request.create.budget-verification.available') }}
            </span>
            <span class="text-lg font-black" :class="budgetAvailable >= 0 ? 'text-success' : 'text-danger'">
              S/ {{ budgetAvailable.toLocaleString() }}
            </span>
          </div>
        </div>

        <div v-if="totalPrice > 0" class="flex items-center justify-between px-2 py-3 bg-white rounded-lg border"
          :class="{
            'border-success/30 bg-success-soft/10': isWithinBudget === true,
            'border-danger/30 bg-danger-soft/10': isWithinBudget === false
          }"
        >
          <div class="flex items-center gap-3">
            <span v-if="isWithinBudget === true" class="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
              <i class="pi pi-check-circle text-success text-lg"></i>
            </span>
            <span v-else-if="isWithinBudget === false" class="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center">
              <i class="pi pi-times-circle text-danger text-lg"></i>
            </span>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-primary/70 uppercase tracking-wider">
                {{ t('request.create.fields.quantity') }}: {{ quantity }} {{ selectedUnit }} &times; S/ {{ selectedPrice.toFixed(2) }}
              </span>
              <span class="text-lg font-black text-primary">Total: S/ {{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
          <span
            class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
            :class="{
              'bg-success-soft text-success border-success': isWithinBudget === true,
              'bg-danger-soft text-danger border-danger': isWithinBudget === false
            }"
          >
            {{ isWithinBudget === true ? t('request.filters.within-budget') : t('request.filters.exceed-budget') }}
          </span>
        </div>
      </div>

      <div v-if="totalPrice > 0" class="border-t pt-4 flex items-center justify-between px-2">
        <span class="text-sm font-bold text-primary/80 uppercase tracking-wider">Total Estimado</span>
        <span class="text-lg font-bold text-accent">S/ {{ totalPrice.toFixed(2) }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.required-date') }}
          </span>
          <pv-datepicker
              v-model="requiredDate"
              :min-date="new Date()"
              :placeholder="t('request.create.placeholders.date')"
              :invalid="submitted && !requiredDate"
              fluid
          />
          <span v-if="submitted && !requiredDate" class="text-xs text-danger">
            {{ t('request.create.validation.date-required') }}
          </span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.delivery-location') }}
          </span>
          <pv-inputtext
              v-model="deliveryLocation"
              :placeholder="t('request.create.placeholders.location')"
              :invalid="submitted && !deliveryLocation"
              fluid
          />
          <span v-if="submitted && !deliveryLocation" class="text-xs text-danger">
            {{ t('request.create.validation.location-required') }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('request.create.fields.purpose') }}
        </span>
        <pv-textarea
            v-model="purpose"
            rows="3"
            :placeholder="t('request.create.placeholders.purpose')"
            :invalid="submitted && !purpose"
        />
        <span v-if="submitted && !purpose" class="text-xs text-danger">
          {{ t('request.create.validation.purpose-required') }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('request.create.fields.additional-notes') }}
        </span>
        <pv-textarea
            v-model="additionalNotes"
            rows="2"
            :placeholder="t('request.create.placeholders.additional-notes')"
        />
      </div>
    </div>

    <div class="flex justify-end gap-m">
      <pv-button
          type="button"
          :label="t('request.create.actions.cancel')"
          severity="secondary"
          variant="outlined"
          @click="router.push({ name: 'requests-list' })"
      />
      <pv-button
          type="submit"
          :label="t('request.create.actions.submit')"
          icon="pi pi-send"
      />
    </div>
  </form>
</template>
