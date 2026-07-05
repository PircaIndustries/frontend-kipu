<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useCatalogStore from '@/domains/logistics/application/catalog.store.js';
import { MEASURE_UNIT_LABELS, getMeasureUnitValue } from '@/domains/logistics/domain/model/materials/measureUnit.map.js';

const { t } = useI18n();
const toast = useToast();
const catalogStore = useCatalogStore();

const props = defineProps({
  visible: Boolean,
  material: { type: Object, default: null },
  categories: { type: Array, default: () => [] }
});
const emit = defineEmits(['saved', 'update:visible']);

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const name = ref('');
const categoryId = ref(null);
const measureUnit = ref(null);
const saving = ref(false);
const dialogKey = ref(0);

const activeCategories = computed(() =>
    props.categories.filter(c => c.isActive !== false)
);

const measureUnitOptions = Object.entries(MEASURE_UNIT_LABELS).map(([value, label]) => ({
  value: parseInt(value),
  label
}));

function resetForm() {
  name.value = '';
  categoryId.value = null;
  measureUnit.value = null;
  saving.value = false;
}

function initForm() {
  if (props.material) {
    name.value = props.material.name ?? '';
    categoryId.value = props.material.categoryId != null ? Number(props.material.categoryId) : null;
    measureUnit.value = getMeasureUnitValue(props.material.measureUnit);
  } else {
    resetForm();
  }
  dialogKey.value++;
}

const isEdit = computed(() => !!props.material);

const isValid = computed(() =>
    name.value.trim() &&
    categoryId.value != null &&
    measureUnit.value != null
);

async function save() {
  if (!isValid.value || saving.value) return;
  saving.value = true;

  const payload = {
    name: name.value.trim(),
    categoryId: categoryId.value,
    measureUnit: measureUnit.value,
  };

  if (isEdit.value) {
    catalogStore.updateMaterialCatalog(props.material.id, payload, () => {
      toast.add({ severity: 'success', summary: t('catalog.materials.edit.success.summary'), detail: t('catalog.materials.edit.success.message'), life: 3000 });
      emit('saved');
      emit('update:visible', false);
      saving.value = false;
    }, () => {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('catalog.materials.edit.error.message'), life: 4000 });
      saving.value = false;
    });
  } else {
    catalogStore.addMaterialCatalog(payload, () => {
      toast.add({ severity: 'success', summary: t('catalog.materials.create.success.summary'), detail: t('catalog.materials.create.success.message'), life: 3000 });
      emit('saved');
      emit('update:visible', false);
      saving.value = false;
    }, () => {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('catalog.materials.create.error.message'), life: 4000 });
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
      :style="{ width: '500px' }"
      :header="isEdit ? t('catalog.materials.edit.title') : t('catalog.materials.create.title')"
      @show="initForm"
  >
    <div class="flex flex-col gap-5" :key="dialogKey">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('catalog.materials.form.name') }}</span>
        <pv-inputtext v-model="name" :placeholder="t('catalog.materials.form.name-placeholder')" class="w-full" />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('catalog.materials.form.category') }}</span>
        <pv-select
            v-model="categoryId"
            :options="activeCategories"
            optionLabel="name"
            optionValue="id"
            :placeholder="t('catalog.materials.form.category-placeholder')"
            class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">{{ t('catalog.materials.form.measure-unit') }}</span>
        <pv-select
            v-model="measureUnit"
            :options="measureUnitOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('catalog.materials.form.measure-unit-placeholder')"
            class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <pv-button :label="t('common.cancel')" severity="secondary" variant="outlined" :disabled="saving" @click="emit('update:visible', false)" />
      <pv-button :label="isEdit ? t('catalog.materials.edit.submit') : t('catalog.materials.create.submit')" icon="pi pi-save" severity="info" :disabled="saving || !isValid" @click="save" />
    </template>
  </pv-dialog>
</template>
