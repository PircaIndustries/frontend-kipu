<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useCatalogStore from '@/domains/logistics/application/catalog.store.js';

const { t } = useI18n();
const toast = useToast();
const catalogStore = useCatalogStore();

const props = defineProps({
  visible: Boolean,
  machinery: { type: Object, default: null }
});
const emit = defineEmits(['saved', 'update:visible']);

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const name = ref('');
const brand = ref('');
const model = ref('');
const serialNumber = ref('');
const acquisitionDate = ref(null);
const saving = ref(false);

function resetForm() {
  name.value = '';
  brand.value = '';
  model.value = '';
  serialNumber.value = '';
  acquisitionDate.value = null;
  saving.value = false;
}

function initForm() {
  if (props.machinery) {
    name.value = props.machinery.name ?? '';
    brand.value = props.machinery.brand ?? '';
    model.value = props.machinery.model ?? '';
    serialNumber.value = props.machinery.serialNumber ?? '';
    const raw = props.machinery.acquisitionDate;
    if (!raw) {
      acquisitionDate.value = null;
    } else if (raw instanceof Date) {
      acquisitionDate.value = raw;
    } else {
      acquisitionDate.value = new Date(raw + 'T00:00:00');
    }
  } else {
    resetForm();
  }
}

const isEdit = computed(() => !!props.machinery);

const isValid = computed(() =>
    name.value.trim() &&
    brand.value.trim() &&
    model.value.trim() &&
    serialNumber.value.trim()
);

async function save() {
  if (!isValid.value || saving.value) return;
  saving.value = true;

  const payload = {
    name: name.value.trim(),
    brand: brand.value.trim(),
    model: model.value.trim(),
    serialNumber: serialNumber.value.trim(),
    acquisitionDate: acquisitionDate.value
      ? acquisitionDate.value.toISOString().slice(0, 10)
      : null,
  };

  if (isEdit.value) {
    catalogStore.updateMachineryCatalog(props.machinery.id, payload, () => {
      toast.add({ severity: 'success', summary: t('catalog.machinery.edit.success.summary'), detail: t('catalog.machinery.edit.success.message'), life: 3000 });
      emit('saved');
      emit('update:visible', false);
      saving.value = false;
    }, () => {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('catalog.machinery.edit.error.message'), life: 4000 });
      saving.value = false;
    });
  } else {
    catalogStore.addMachineryCatalog(payload, () => {
      toast.add({ severity: 'success', summary: t('catalog.machinery.create.success.summary'), detail: t('catalog.machinery.create.success.message'), life: 3000 });
      emit('saved');
      emit('update:visible', false);
      saving.value = false;
    }, () => {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('catalog.machinery.create.error.message'), life: 4000 });
      saving.value = false;
    });
  }
}

watch(() => props.visible, (val) => {
  if (val) initForm();
});
</script>

<template>
  <pv-dialog
      v-model:visible="visibleModel"
      modal
      :style="{ width: '550px' }"
      :header="isEdit ? t('catalog.machinery.edit.title') : t('catalog.machinery.create.title')"
      @show="initForm"
  >
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('catalog.machinery.form.name') }}</span>
        <pv-inputtext v-model="name" :placeholder="t('catalog.machinery.form.name-placeholder')" class="w-full" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('catalog.machinery.form.brand') }}</span>
          <pv-inputtext v-model="brand" :placeholder="t('catalog.machinery.form.brand-placeholder')" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('catalog.machinery.form.model') }}</span>
          <pv-inputtext v-model="model" :placeholder="t('catalog.machinery.form.model-placeholder')" class="w-full" />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('catalog.machinery.form.serial-number') }}</span>
        <pv-inputtext v-model="serialNumber" :placeholder="t('catalog.machinery.form.serial-number-placeholder')" class="w-full" />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('catalog.machinery.form.acquisition-date') }}</span>
        <pv-datepicker
            v-model="acquisitionDate"
            dateFormat="yy-mm-dd"
            :placeholder="t('catalog.machinery.form.acquisition-date-placeholder')"
            class="w-full"
            showButtonBar
            :manualInput="false"
        />
      </div>
    </div>

    <template #footer>
      <pv-button :label="t('common.cancel')" severity="secondary" variant="outlined" :disabled="saving" @click="emit('update:visible', false)" />
      <pv-button :label="isEdit ? t('catalog.machinery.edit.submit') : t('catalog.machinery.create.submit')" icon="pi pi-save" severity="info" :disabled="saving || !isValid" @click="save" />
    </template>
  </pv-dialog>
</template>
