<script setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue';
import useRequestStore from '@/domains/logistics/application/requests.store.js';
import useSupplierStore from '@/domains/logistics/application/supplier.store.js';
import { getMeasureUnitLabel } from '@/domains/logistics/domain/model/materials/measureUnit.map.js';

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
const selectedPriority = ref('Low');

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

onMounted(() => {
  requestStore.fetchCategories();
  requestStore.fetchMaterials();
  supplierStore.fetchSuppliers();
  supplierStore.fetchSupplierOffers();
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
