<script setup>
import { reactive, onMounted, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
// ADDED: Import useRoute
import { useRouter, useRoute } from 'vue-router';
import { useAdvanceStore } from '@/domains/progress-monitoring/application/advancesStore.js';
import { useTeamUserStore } from '@/domains/team/application/team-user.store.js';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import Dialog from 'primevue/dialog';
import {useProjectsStore} from "@/domains/project-management/data/useProjectsStore.js";

const saveError = ref('');
const showSuccessModal = ref(false);

const { t } = useI18n();
const router = useRouter();
// ADDED: Initialize route
const route = useRoute();
const store = useAdvanceStore();
const teamStore = useTeamUserStore();

// Static options mapping to execution keys
const specialtiesOptions = computed(() => [
  t('execution.advances.specialties.structures'),
  t('execution.advances.specialties.installations'),
  t('execution.advances.specialties.architecture')
]);

const operationalManagers = computed(() => {
  if (teamStore && teamStore.teamUsers) {
    const currentProjectId = localStorage.getItem('currentProjectId')
    return teamStore.teamUsers.filter(u =>
        u.isActive && String(u.projectId) === String(currentProjectId)
    );
  }
  return [];
});

const form = reactive({
  date: null,
  specialty: '',
  activityName: '',
  location: '',
  percentage: 0,
  weight: 1,
  description: '',
  responsible: '',
  workers: 0,
  weather: 'sunny'
});

// ADDED: Check if we are in edit mode based on route params
const isEditMode = computed(() => !!route.params.id);
const isMiniAdvanceMode = computed(() => route.query.mode === 'mini-advance');

/**
 * Load existing data if in edit mode
 */
onMounted(async () => {
  if (teamStore.fetchUsers) {
    teamStore.fetchUsers();
  }

  // If in mini-advance mode, pre-fill activity name and block editing
  if (isMiniAdvanceMode.value) {
    if (store.advances.length === 0) await store.loadAdvances();

    const parent = store.advances.find(a => a.activityName === route.query.activity);

    if (parent) {
      form.activityName = parent.activityName;
      form.specialty = parent.specialty || '';
      form.responsible = parent.responsible || '';
      form.weight = Number(parent.weight) || 1;
      form.workers = Number(parent.workers) || 0;
    }
  } else if (isEditMode.value) {
    if (store.advances.length === 0) {
      await store.loadAdvances();
    }

    const existingData = store.getAdvanceById(route.params.id);

    if (existingData) {
      // Mapping values, providing fallbacks for undefined properties
      form.date = existingData.date ? new Date(existingData.date) : null;
      form.specialty = existingData.specialty || '';
      form.activityName = existingData.activityName || '';

      // Check if location exists, otherwise fallback to details
      form.location = existingData.location || existingData.details || '';

      // Ensure description maps specifically to details
      form.description = existingData.description || existingData.details || '';

      form.percentage = Number(existingData.currentPercentage) || 0;
      form.weight = Number(existingData.weight) || 1;
      form.responsible = existingData.responsible || '';
      form.workers = Number(existingData.workers) || 0;
      form.weather = existingData.weather || 'sunny';
    } else {
      router.push('/advances/registry');
    }
  }


});


/**
 * Update the existing record or create a new one
 */
const saveProgress = async () => {

  saveError.value = '';

  const projectStore = useProjectsStore();
  if (projectStore.currentProject?.status?.toLowerCase() === 'paralizada') {
     saveError.value = "No puedes registrar avances. Debes reanudar la obra seleccionando el estado 'En ejecución' desde el panel de proyecto.";
     return;
  }

  // Form Validation
  if (!form.date || !form.specialty || !form.activityName || form.percentage === '' || form.weight === '' || !form.responsible || form.workers === '') {
    saveError.value = "Por favor, complete todos los campos obligatorios (*).";
    return;
  }

  const payload = {
    ...form,
    isMiniAdvance: isMiniAdvanceMode.value,
    currentPercentage: Number(form.percentage),
    weight: Number(form.weight),
    location: form.location, // Ensure this maps correctly
    details: form.description, // Mapping description to details
    status: form.percentage >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
    lastUpdate: form.date ? new Date(form.date) : new Date(),
    startDate: form.date ? new Date(form.date).toISOString() : new Date().toISOString()
  };

  if (isMiniAdvanceMode.value) {
    const activityAdvances = store.advances.filter(a => a.activityName === form.activityName);

    const currentSum = activityAdvances.reduce((sum, a) => {
      if (isEditMode.value && String(a.id) === String(route.params.id)) return sum;
      return sum + (Number(a.currentPercentage) || 0);
    }, 0);

    if (currentSum + Number(form.percentage) > 100) {
      saveError.value = "¡Error! La suma del progreso no puede superar el 100%.";
      return;
    }
  }

  saveError.value = '';
  try {
    if (isEditMode.value) {
      await store.updateAdvance(route.params.id, payload);
    } else {
      await store.addAdvance(payload);
    }

    const projectStore = useProjectsStore();
    if (projectStore.currentProject) {
      await projectStore.updateProjectStatus(
          projectStore.currentProjectId,
          projectStore.currentProject.status,
          form.activityName || 'Registro de avance diario',
          projectStore.currentProject.progress
      );
    }

    showSuccessModal.value = true;
    setTimeout(() => {
      showSuccessModal.value = false;
      router.push('/advances/registry');
    }, 1500);
  } catch (error) {
    saveError.value = error.message || 'Error saving progress';
  }
};

const cancelCreation = () => {
  if (form.activityName || form.percentage > 0 || form.description) {
    if (window.confirm(t('execution.create.discardMessage'))) {
      router.push('/advances/registry');
    }
  } else {
    router.push('/advances/registry');
  }
};

/**
 * Triggers a confirmation dialog to delete.
 * Using a flat, safe key structure for i18n to avoid your nested errors.
 */
const deleteProgress = () => {
  if (window.confirm(t('execution.advances.create.deleteMessage'))) {
    if (route.params.id) {
      store.deleteAdvance(route.params.id).then(() => {
        router.push('/advances/registry');
      });
    }
  }
};

</script>
<template>
  <div class="p-8 bg-gray-50 min-h-screen">

    <div class="flex gap-6">
      <div class="flex-grow bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          {{ isEditMode ? t('execution.advances.create.editTitle') : t('execution.advances.create.title') }}
        </h2>

        <form @submit.prevent="saveProgress" class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.date') }}<span class="text-red-500 ml-1">*</span></label>
            <DatePicker v-model="form.date" showIcon iconDisplay="input" fluid class="!rounded-lg" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.specialty') }}<span class="text-red-500 ml-1">*</span></label>
            <select v-model="form.specialty" :disabled="isMiniAdvanceMode" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none cursor-pointer">
              <option value="" disabled>{{ t('execution.advances.create.placeholders.select_specialty') }}</option>
              <option v-for="opt in specialtiesOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="col-span-2 flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.activity') }}<span class="text-red-500 ml-1">*</span></label>
            <input type="text" v-model="form.activityName" :placeholder="t('execution.advances.create.placeholders.activity')" :disabled="isMiniAdvanceMode" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none">
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.location') }}</label>
            <input type="text" v-model="form.location" :placeholder="t('execution.advances.create.placeholders.location')" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none">
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.progress') }}<span class="text-red-500 ml-1">*</span></label>
            <div class="relative">
              <input type="number" v-model="form.percentage" min="0" max="100" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none w-full pr-10">
              <span class="absolute right-4 top-3 text-gray-400 font-bold">%</span>
            </div>
          </div>

          <div class="col-span-2 flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.description') }}</label>
            <textarea v-model="form.description" rows="4" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none resize-none"></textarea>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.weight') }}<span class="text-red-500 ml-1">*</span></label>
            <input type="number" v-model="form.weight" :disabled="isMiniAdvanceMode" min="1" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none">
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.crewSize') }}<span class="text-red-500 ml-1">*</span></label>
            <input type="number" v-model="form.workers" :disabled="isMiniAdvanceMode" min="0" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none">
          </div>

          <div class="col-span-2 flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.responsible') }}<span class="text-red-500 ml-1">*</span></label>
            <select v-model="form.responsible" :disabled="isMiniAdvanceMode" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none cursor-pointer">
              <option value="" disabled>{{ t('execution.advances.create.placeholders.select_responsible') }}</option>
              <option v-for="user in operationalManagers" :key="user.id" :value="user.fullName">{{ user.fullName }}</option>
            </select>
          </div>

          <div class="col-span-2 flex flex-col gap-2 mt-2">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.advances.create.fields.weather') }}</label>
            <div class="flex gap-2">
              <button type="button" @click="form.weather = 'sunny'" :class="form.weather === 'sunny' ? 'bg-gray-800 text-white' : 'border border-gray-200 text-gray-600'" class="px-6 py-2 rounded-md text-sm font-medium transition-colors">{{ t('execution.weather.sunny') }}</button>
              <button type="button" @click="form.weather = 'cloudy'" :class="form.weather === 'cloudy' ? 'bg-gray-800 text-white' : 'border border-gray-200 text-gray-600'" class="px-6 py-2 rounded-md text-sm font-medium transition-colors">{{ t('execution.weather.cloudy') }}</button>
              <button type="button" @click="form.weather = 'rainy'" :class="form.weather === 'rainy' ? 'bg-gray-800 text-white' : 'border border-gray-200 text-gray-600'" class="px-6 py-2 rounded-md text-sm font-medium transition-colors">{{ t('execution.weather.rainy') }}</button>
            </div>
          </div>
        </form>

        <div class="mt-10 flex flex-col gap-4">
          <Message v-if="saveError" severity="error" size="small" :closable="false">{{ saveError }}</Message>
          <div class="flex gap-4">
            <button @click="saveProgress" class="bg-gray-800 text-white py-6 flex-grow rounded-lg text-lg font-bold hover:bg-gray-900 transition-colors">
              {{ isEditMode ? t('execution.advances.create.submitBtn') : t('execution.advances.create.submitBtn') }}
            </button>
            <button v-if="isEditMode" @click="deleteProgress" class="w-1/4 text-red-600 border border-red-200 font-bold hover:bg-red-50 rounded-lg transition-colors">
              {{ t('common.delete') }}
            </button>
            <button @click="cancelCreation" class="w-1/4 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>

      <div class="w-[350px] flex flex-col gap-6">
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 class="font-bold text-gray-800 text-sm mb-4">{{ t('execution.advances.create.dailyStats.title') }}</h3>
          <div class="flex flex-col gap-3 text-sm text-gray-600">
            <div class="flex justify-between border-b pb-2"><span>{{ t('execution.advances.create.dailyStats.personnel') }}</span> <strong>{{ form.workers || 0 }}</strong></div>
            <div class="flex justify-between"><span>{{ t('execution.advances.create.dailyStats.weather') }}</span> <strong class="capitalize">{{ t(`execution.weather.${form.weather}`) }}</strong></div>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE SUCCESS DIALOG -->
    <Dialog v-model:visible="showSuccessModal" modal :style="{ width: '380px' }" :closable="false">
      <div class="text-center p-8">
        <i class="pi pi-check-circle text-[#10b981] text-8xl mb-4" />
        <h2 class="text-xl font-bold text-gray-800 mb-2">{{ t('execution.advances.create.successTitle') }}</h2>
        <p class="text-gray-500 m-0">{{ t('execution.advances.create.successMessage') }}</p>
      </div>
    </Dialog>
  </div>
</template>