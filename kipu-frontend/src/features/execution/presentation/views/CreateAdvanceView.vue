<script setup>
/**
 * CreateAdvanceView Component
 * Form for registering new daily work progress.
 * Includes dirty-state checking for discard confirmation.
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from "primevue/useconfirm";
import { allAdvances } from '../../data/advancesStore';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import FileUpload from 'primevue/fileupload';
import ConfirmDialog from 'primevue/confirmdialog';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();

/** * Define the empty state to compare against */
const initialFormState = {
  specialty: null,
  activity: '',
  location: '',
  progress: null,
  description: '',
  responsible: '',
  crewSize: null,
  weather: 'sunny'
};

const form = ref({
  date: new Date(),
  ...initialFormState
});

/** * Options for Specialty Dropdown */
const specialties = ref([
  { name: t('execution.advances.specialties.structures'), value: 'structures' },
  { name: t('execution.advances.specialties.installations'), value: 'installations' },
  { name: t('execution.advances.specialties.architecture'), value: 'architecture' }
]);

/** * Weather condition options */
const weatherOptions = [
  { label: 'execution.weather.sunny', icon: 'pi pi-sun', value: 'sunny' },
  { label: 'execution.weather.cloudy', icon: 'pi pi-cloud', value: 'cloudy' },
  { label: 'execution.weather.rainy', icon: 'pi pi-cloud-drizzle', value: 'rainy' },
  { label: 'execution.weather.storm', icon: 'pi pi-bolt', value: 'storm' }
];

/** * Logic to detect if the user has changed any field */
const isDirty = computed(() => {
  return form.value.activity !== initialFormState.activity ||
      form.value.location !== initialFormState.location ||
      form.value.description !== initialFormState.description ||
      form.value.progress !== initialFormState.progress ||
      form.value.specialty !== initialFormState.specialty ||
      form.value.responsible !== initialFormState.responsible ||
      form.value.crewSize !== initialFormState.crewSize ||
      form.value.weather !== initialFormState.weather;
});

/** * Safe navigation back with confirmation */
const goBack = () => {
  if (isDirty.value) {
    confirm.require({
      message: t('execution.create.discardMessage'),
      header: t('execution.create.discardHeader'),
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: t('common.cancel'),
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: t('common.yes'),
        severity: 'danger'
      },
      accept: () => router.push('/advances')
    });
  } else {
    router.push('/advances');
  }
};

/** * Save logic */
const submitForm = () => {
  if (!form.value.activity) return;

  const newEntry = {
    id: String(Date.now()),
    date: form.value.date.toISOString().split('T')[0],
    activity: form.value.activity,
    sector: form.value.location,
    specialty: form.value.specialty?.name || 'General',
    progress: form.value.progress || 0,
    status: 'IN_PROGRESS'
  };

  allAdvances.value.unshift(newEntry);
  router.push('/advances');
};
</script>

<template>
  <div class="create-advance-container">
    <ConfirmDialog />

    <header class="form-header">
      <div class="title-group">
        <h1>{{ t('execution.create.title') }}</h1>
      </div>
      <Button icon="pi pi-times" severity="secondary" text @click="goBack" />
    </header>

    <div class="form-grid">
      <section class="form-section main-fields">
        <div class="field-row">
          <div class="field">
            <label>{{ t('execution.create.fields.date') }}</label>
            <DatePicker v-model="form.date" showIcon iconDisplay="input" fluid />
          </div>
          <div class="field">
            <label>{{ t('execution.create.fields.specialty') }}</label>
            <Select v-model="form.specialty" :options="specialties" optionLabel="name" fluid />
          </div>
        </div>

        <div class="field">
          <label>{{ t('execution.create.fields.activity') }}</label>
          <InputText v-model="form.activity" :placeholder="t('execution.create.placeholders.activity')" fluid />
        </div>

        <div class="field-row">
          <div class="field">
            <label>{{ t('execution.create.fields.location') }}</label>
            <InputText v-model="form.location" :placeholder="t('execution.create.placeholders.location')" fluid />
          </div>
          <div class="field">
            <label>{{ t('execution.create.fields.progress') }}</label>
            <InputText v-model="form.progress" type="number" suffix="%" fluid />
          </div>
        </div>

        <div class="field">
          <label>{{ t('execution.create.fields.description') }}</label>
          <Textarea v-model="form.description" rows="4" fluid autoResize />
        </div>

        <div class="field-row">
          <div class="field">
            <label>{{ t('execution.create.fields.responsible') }}</label>
            <InputText v-model="form.responsible" fluid />
          </div>
          <div class="field">
            <label>{{ t('execution.create.fields.crewSize') }}</label>
            <InputText v-model="form.crewSize" type="number" fluid />
          </div>
        </div>

        <div class="field">
          <label>{{ t('execution.create.fields.weather') }}</label>
          <div class="weather-selector">
            <Button
                v-for="option in weatherOptions"
                :key="option.value"
                :label="t(option.label)"
                :icon="option.icon"
                :class="['weather-btn', { 'weather-active': form.weather === option.value }]"
                outlined
                @click="form.weather = option.value"
            />
          </div>
        </div>
      </section>

      <aside class="form-section photo-section">
        <label>{{ t('execution.create.fields.photos') }}</label>
        <FileUpload name="demo[]" multiple accept="image/*" maxFileSize="1000000" :chooseLabel="t('execution.create.photos.add')" mode="advanced">
          <template #empty>
            <div class="upload-placeholder">
              <i class="pi pi-images" />
              <p>{{ t('execution.create.photos.empty') }}</p>
            </div>
          </template>
        </FileUpload>
      </aside>
    </div>

    <footer class="form-footer">
      <Button :label="t('common.cancel')" severity="secondary" text @click="goBack" />
      <Button :label="t('execution.create.submitBtn')" class="submit-btn" @click="submitForm" />
    </footer>
  </div>
</template>

<style scoped>
.create-advance-container { max-width: 1000px; margin: 0 auto; padding: 2rem; background: white; border-radius: 12px; }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #f1f1f1; padding-bottom: 1rem; }
.form-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2.5rem; }
.field { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.field label { font-weight: 600; color: #34495e; font-size: 0.9rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.weather-selector { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.weather-btn { font-size: 0.85rem; color: #2c3e50; border-color: #dee2e6; }
.weather-active { background-color: #2c3e50 !important; color: white !important; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; padding: 3rem; border: 2px dashed #dee2e6; border-radius: 8px; color: #95a5a6; }
.form-footer { margin-top: 3rem; display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f1f1; }
.submit-btn { background-color: #2c3e50; border: none; padding: 0.75rem 2rem; }
</style>