<script setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue';
import useRequestStore from '@/domains/logistics/application/requests.store.js';
import useSupplierStore from '@/domains/logistics/application/supplier.store.js';

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const requestStore = useRequestStore();
const supplierStore = useSupplierStore();

const categoryOptions = computed(() =>
    requestStore.categories.map(c => ({ name: c.name }))
);

const selectedCategory = ref('');
const selectedMaterial = ref('');
const selectedSupplier = ref('');
const selectedBudgetLine = ref('');
const selectedPriority = ref('LOW');

const quantity = ref(1);
const requiredDate = ref(null);
const deliveryLocation = ref('');
const purpose = ref('');
const additionalNotes = ref('');

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
const selectedUnit = computed(() => materialSelected.value?.measureUnit ?? '');
const selectedPrice = computed(() => selectedSupplierOffer.value?.unitPrice ?? 0);
const totalPrice = computed(() => quantity.value * selectedPrice.value);

const budgetLineOptions = computed(() => []);

const filteredSuppliers = computed(() => {
  if (!materialSelected.value) return [];
  return supplierStore.getSuppliersByMaterialId(materialSelected.value.id);
});
const supplierOptions = computed(() =>
    filteredSuppliers.value.map(s => ({ name: s.socialReason }))
);

const selectedSupplierOffer = computed(() => {
  if (!materialSelected.value || !selectedSupplier.value) return null;
  return supplierStore.getSupplierOffer(materialSelected.value.id, selectedSupplier.value);
});

function onCategoryChange() {
  selectedMaterial.value = '';
  selectedSupplier.value = '';
}

function onMaterialChange() {
  selectedSupplier.value = '';
}

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

  const request = {
    items: [{
      supplierOfferId: selectedSupplierOffer.value?.id ?? '',
      quantity: quantity.value
    }],
    suggestedSupplierId: filteredSuppliers.value.find(s => s.socialReason === selectedSupplier.value)?.id ?? '',
    budgetLineId: selectedBudgetLine.value,
    priority: selectedPriority.value,
    deliveryLocation: deliveryLocation.value,
    purpose: purpose.value,
    additionalNotes: additionalNotes.value,
    requestDate: new Date().toISOString().split('T')[0],
    deadline: requiredDate.value ? new Date(requiredDate.value).toISOString().split('T')[0] : '',
    requestedBy: t('request.create.placeholders.requested-by'),
    status: 'PENDING'
  };

  requestStore.createRequest(request, () => {
    toast.add({ severity: 'success', summary: t('request.create.success.summary'), detail: t('request.create.success.message'), life: 3000 });
    router.push({ name: 'requests-list' });
  });
  setTimeout(() => { submitting.value = false; }, 8000);
};

onMounted(() => {
  requestStore.fetchCategories();
  requestStore.fetchMaterials();
  requestStore.fetchSupplierOffers();
  supplierStore.fetchSupplierOffers();
  supplierStore.fetchSuppliers();
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
              :min="0"
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
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.unit') }}
          </span>
          <div class="w-full min-h-[2.5rem] flex items-center gap-2 px-4 rounded-m border border-neutral-border/20 bg-white text-sm">
            <span v-if="selectedUnit" class="text-primary font-medium">{{ selectedUnit }}</span>
            <span v-else class="text-neutral-border">{{ t('request.create.placeholders.unit-empty') }}</span>
            <span v-if="selectedPrice" class="ml-auto text-accent font-bold">
              S/ {{ selectedPrice.toFixed(2) }} / {{ selectedUnit }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.budget-line') }}
          </span>
          <autocomplete-component
              v-model="selectedBudgetLine"
              :options="budgetLineOptions"
              :placeholder="t('request.create.placeholders.select')"
              :return-object="false"
              :invalid="submitted && !selectedBudgetLine"
          />
          <span v-if="submitted && !selectedBudgetLine" class="text-xs text-danger">
            {{ t('request.create.validation.budget-line-required') }}
          </span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.priority') }}
          </span>
          <pv-select
              v-model="selectedPriority"
              :options="['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']"
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
            {{ t('request.create.fields.required-date') }}
          </span>
          <pv-datepicker
              v-model="requiredDate"
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

    <div class="bg-white border border-neutral-border/20 rounded-m p-xl shadow-sm flex flex-col gap-l">
      <h3 class="text-xs font-black text-primary uppercase tracking-widest">
        {{ t('request.create.budget-verification.title') }}
      </h3>
      <div class="grid grid-cols-3 gap-l">
        <div class="flex flex-col items-center p-m bg-neutral-bg rounded-s border border-neutral-border/20">
          <span class="text-xs text-neutral-border uppercase font-bold">
            {{ t('request.create.budget-verification.item-budget') }}
          </span>
          <span class="text-xl font-bold text-primary">S/ {{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="flex flex-col items-center p-m bg-neutral-bg rounded-s border border-neutral-border/20">
          <span class="text-xs text-neutral-border uppercase font-bold">
            {{ t('request.create.budget-verification.executed') }}
          </span>
          <span class="text-xl font-bold text-warning">S/ 0.00</span>
        </div>
        <div class="flex flex-col items-center p-m bg-neutral-bg rounded-s border border-neutral-border/20">
          <span class="text-xs text-neutral-border uppercase font-bold">
            {{ t('request.create.budget-verification.available') }}
          </span>
          <span class="text-xl font-bold text-success">S/ 0.00</span>
        </div>
      </div>
    </div>

    <div class="bg-white border border-neutral-border/20 rounded-m p-xl shadow-sm flex flex-col gap-l">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
          {{ t('request.create.fields.attachments') }}
        </span>
        <div class="border-2 border-dashed border-neutral-border/30 rounded-m p-xl flex flex-col items-center gap-m text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
          <i class="pi pi-cloud-upload text-3xl text-neutral-border"></i>
          <span class="text-sm font-bold text-primary">{{ t('request.create.placeholders.dropzone') }}</span>
          <span class="text-xs text-neutral-border">{{ t('request.create.placeholders.dropzone-hint') }}</span>
        </div>
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