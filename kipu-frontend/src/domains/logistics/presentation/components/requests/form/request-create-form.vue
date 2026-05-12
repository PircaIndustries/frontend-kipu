<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Form } from '@primevue/forms';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import AutocompleteComponent from '@/shared/presentation/components/autocompleteComponent.vue';
import useRequestStore from '@/domains/logistics/application/requests.store.js';
import useInventoryStore from '@/domains/logistics/application/inventory.store.js';
// import useBudgetStore from '@/domains/budget/application/budget.store.js';

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const requestStore = useRequestStore();
const inventoryStore = useInventoryStore();

// Cargar datos
inventoryStore.fetchCategories();
inventoryStore.fetchMaterials();
requestStore.fetchSupplierOffers();
// requestStore.fetchSuppliers();

// ════════════════ CATÁLOGOS PARA AUTOCOMPLETE ════════════════
const categoryOptions = computed(() =>
    inventoryStore.categories.map(c => ({ name: c.name }))
);
const budgetLineOptions = computed(() =>
    [] // budgetStore.budgetItems().map(b => ({ name: `${b.code} - ${b.name}` }))
);

// ════════════════ ESTADO DE CASCADA ════════════════
const selectedCategory = ref('');
const selectedMaterial = ref('');
const selectedSupplier = ref('');

// Materiales filtrados por categoría
const filteredMaterials = computed(() => {
  if (!selectedCategory.value) return [];
  const category = inventoryStore.categories.find(c => c.name === selectedCategory.value);
  if (!category) return [];
  return inventoryStore.materials.filter(m => m.categoryId === category.id);
});
const materialOptions = computed(() =>
    filteredMaterials.value.map(m => ({ name: m.name }))
);

// Material seleccionado
const materialSelected = computed(() =>
    inventoryStore.materials.find(m => m.name === selectedMaterial.value)
);
const selectedUnit = computed(() => materialSelected.value?.measureUnit ?? '');

// Proveedores filtrados por material (requiere función en la store)
const filteredSuppliers = computed(() => {
  if (!materialSelected.value) return [];
  // Debes implementar esta lógica en la store
  return requestStore.getSuppliersByMaterialId(materialSelected.value.id);
});
const supplierOptions = computed(() =>
    filteredSuppliers.value.map(s => ({ name: s.socialReason }))
);

// Oferta del proveedor seleccionado
const selectedSupplierOffer = computed(() => {
  if (!materialSelected.value || !selectedSupplier.value) return null;
  // Implementar en store
  return requestStore.getSupplierOffer(materialSelected.value.id, selectedSupplier.value);
});

// Reset en cascada
watch(selectedCategory, () => {
  selectedMaterial.value = '';
  selectedSupplier.value = '';
});
watch(selectedMaterial, () => {
  selectedSupplier.value = '';
});

// ════════════════ FORMULARIO Y VALIDACIÓN ════════════════
const initialValues = ref({
  category: '',
  material: '',
  supplier: '',
  budgetLine: '',
  quantity: 1,
  priority: 'LOW',
  requiredDate: null,
  deliveryLocation: '',
  purpose: '',
  additionalNotes: ''
});

const resolver = ref(zodResolver(
    z.object({
      category: z.string().min(1, { message: t('request.create.validation.category-required') }),
      material: z.string().min(1, { message: t('request.create.validation.material-required') }),
      supplier: z.string().min(1, { message: t('request.create.validation.supplier-required') }),
      budgetLine: z.string().min(1, { message: t('request.create.validation.budget-line-required') }),
      quantity: z.number().min(1, { message: t('request.create.validation.quantity-required') }),
      priority: z.string().min(1),
      requiredDate: z.preprocess((val) => {
        if (!val) return null;
        return new Date(val);
      }, z.union([z.date(), z.null()]).refine(val => val !== null, { message: t('request.create.validation.date-required') })),
      deliveryLocation: z.string().min(1, { message: t('request.create.validation.location-required') }),
      purpose: z.string().min(1, { message: t('request.create.validation.purpose-required') }),
      additionalNotes: z.string().optional()
    })
));

const onFormSubmit = ({ valid, values }) => {
  if (!valid) return;

  const request = {
    items: [{
      supplierOfferId: selectedSupplierOffer.value?.id ?? '',
      quantity: values.quantity
    }],
    suggestedSupplierId: filteredSuppliers.value.find(s => s.socialReason === selectedSupplier.value)?.id ?? '',
    budgetLineId: values.budgetLine,
    priority: values.priority,
    deliveryLocation: values.deliveryLocation,
    purpose: values.purpose,
    additionalNotes: values.additionalNotes,
    requestDate: new Date().toISOString().split('T')[0],
    deadline: values.requiredDate ? new Date(values.requiredDate).toISOString().split('T')[0] : '',
    requestedBy: 'Usuario actual', // Obtener de AuthStore
    status: 'PENDING'
  };

  requestStore.createRequest(request, () => {
    toast.add({ severity: 'success', summary: 'Éxito', detail: t('request.create.success.message'), life: 3000 });
    router.push({ name: 'requests' });
  });
};
</script>

<template>
  <Toast />
  <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit" class="flex flex-col gap-6 p-6 animate-fade-in">
    <header class="flex flex-col gap-0.5">
      <h1 class="text-2xl font-bold text-primary tracking-tight">{{ t('request.create.title') }}</h1>
      <p class="text-sm text-neutral-border">{{ t('request.create.subtitle') }}</p>
    </header>

    <div class="bg-white border border-neutral-border/20 rounded-m p-xl shadow-sm flex flex-col gap-l">
      <!-- Fila: Categoría y Material -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.category') }}</span>
          <AutocompleteComponent
              v-model="selectedCategory"
              :options="categoryOptions"
              :placeholder="t('request.create.placeholders.select')"
              :return-object="false"
          />
          <Message v-if="$form.category?.invalid" severity="error" size="small" variant="simple">{{ $form.category.error?.message }}</Message>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.specific-material') }}</span>
          <AutocompleteComponent
              v-model="selectedMaterial"
              :options="materialOptions"
              :placeholder="selectedCategory ? t('request.create.placeholders.select') : t('request.create.placeholders.select-category-first')"
              :disabled="!selectedCategory"
              :return-object="false"
          />
          <Message v-if="$form.material?.invalid" severity="error" size="small" variant="simple">{{ $form.material.error?.message }}</Message>
        </div>
      </div>

      <!-- Proveedor -->
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.suggested-supplier') }}</span>
        <AutocompleteComponent
            v-model="selectedSupplier"
            :options="supplierOptions"
            :placeholder="selectedMaterial ? t('request.create.placeholders.select') : t('request.create.placeholders.select-material-first')"
            :disabled="!selectedMaterial"
            :return-object="false"
        />
        <Message v-if="$form.supplier?.invalid" severity="error" size="small" variant="simple">{{ $form.supplier.error?.message }}</Message>
      </div>

      <!-- Fila: Cantidad y Unidad -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.quantity') }}</span>
          <InputNumber v-model="$form.quantity" name="quantity" :min="1" :placeholder="t('request.create.placeholders.quantity')" fluid />
          <Message v-if="$form.quantity?.invalid" severity="error" size="small" variant="simple">{{ $form.quantity.error?.message }}</Message>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.unit') }}</span>
          <div class="w-full min-h-[2.5rem] flex items-center px-4 rounded-m border border-neutral-border/20 bg-white text-sm">
            <span v-if="selectedUnit" class="text-primary font-medium">{{ selectedUnit }}</span>
            <span v-else class="text-neutral-border">{{ t('request.create.placeholders.unit-empty') }}</span>
          </div>
        </div>
      </div>

      <!-- Fila: Línea presupuestaria y Prioridad -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.budget-line') }}</span>
          <AutocompleteComponent
              v-model="$form.budgetLine"
              :options="budgetLineOptions"
              :placeholder="t('request.create.placeholders.select')"
              :return-object="false"
              name="budgetLine"
          />
          <Message v-if="$form.budgetLine?.invalid" severity="error" size="small" variant="simple">{{ $form.budgetLine.error?.message }}</Message>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.priority') }}</span>
          <Select v-model="$form.priority" name="priority" :options="['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']" fluid>
            <template #value="slotProps">
              <span>{{ t(`request.create.priority.${slotProps.value.toLowerCase()}`) }}</span>
            </template>
            <template #option="slotProps">
              <span>{{ t(`request.create.priority.${slotProps.option.toLowerCase()}`) }}</span>
            </template>
          </Select>
        </div>
      </div>

      <!-- Fila: Fecha requerida y Ubicación -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-l">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.required-date') }}</span>
          <DatePicker v-model="$form.requiredDate" name="requiredDate" :placeholder="t('request.create.placeholders.date')" fluid />
          <Message v-if="$form.requiredDate?.invalid" severity="error" size="small" variant="simple">{{ $form.requiredDate.error?.message }}</Message>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.delivery-location') }}</span>
          <InputText v-model="$form.deliveryLocation" name="deliveryLocation" :placeholder="t('request.create.placeholders.location')" fluid />
          <Message v-if="$form.deliveryLocation?.invalid" severity="error" size="small" variant="simple">{{ $form.deliveryLocation.error?.message }}</Message>
        </div>
      </div>

      <!-- Propósito -->
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.purpose') }}</span>
        <Textarea v-model="$form.purpose" name="purpose" rows="3" :placeholder="t('request.create.placeholders.purpose')" />
        <Message v-if="$form.purpose?.invalid" severity="error" size="small" variant="simple">{{ $form.purpose.error?.message }}</Message>
      </div>

      <!-- Notas adicionales -->
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.additional-notes') }}</span>
        <Textarea v-model="$form.additionalNotes" name="additionalNotes" rows="2" :placeholder="t('request.create.placeholders.additional-notes')" />
      </div>
    </div>

    <!-- Sección de Presupuesto (Placeholder) -->
    <div class="bg-white border border-neutral-border/20 rounded-m p-xl shadow-sm flex flex-col gap-l">
      <h3 class="text-xs font-black text-primary uppercase tracking-widest">{{ t('request.create.budget-verification.title') }}</h3>
      <div class="grid grid-cols-3 gap-l">
        <div class="flex flex-col items-center p-m bg-neutral-bg rounded-s border border-neutral-border/20">
          <span class="text-xs text-neutral-border uppercase font-bold">{{ t('request.create.budget-verification.item-budget') }}</span>
          <span class="text-xl font-bold text-primary">S/ 0.00</span>
        </div>
        <div class="flex flex-col items-center p-m bg-neutral-bg rounded-s border border-neutral-border/20">
          <span class="text-xs text-neutral-border uppercase font-bold">{{ t('request.create.budget-verification.executed') }}</span>
          <span class="text-xl font-bold text-warning">S/ 0.00</span>
        </div>
        <div class="flex flex-col items-center p-m bg-neutral-bg rounded-s border border-neutral-border/20">
          <span class="text-xs text-neutral-border uppercase font-bold">{{ t('request.create.budget-verification.available') }}</span>
          <span class="text-xl font-bold text-success">S/ 0.00</span>
        </div>
      </div>
    </div>

    <!-- Sección de Archivos (Placeholder) -->
    <div class="bg-white border border-neutral-border/20 rounded-m p-xl shadow-sm flex flex-col gap-l">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('request.create.fields.attachments') }}</span>
        <div class="border-2 border-dashed border-neutral-border/30 rounded-m p-xl flex flex-col items-center gap-m text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
          <i class="pi pi-cloud-upload text-3xl text-neutral-border"></i>
          <span class="text-sm font-bold text-primary">{{ t('request.create.placeholders.dropzone') }}</span>
          <span class="text-xs text-neutral-border">{{ t('request.create.placeholders.dropzone-hint') }}</span>
        </div>
      </div>
    </div>

    <!-- Botones Finales -->
    <div class="flex justify-end gap-m">
      <Button type="button" :label="t('request.create.actions.cancel')" severity="secondary" variant="outlined" @click="router.push({ name: 'requests' })" />
      <Button type="submit" :label="t('request.create.actions.submit')" icon="pi pi-send" />
    </div>
  </Form>
</template>