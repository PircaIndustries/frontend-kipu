<script setup>
import { reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAdvanceStore } from '@/domains/progress-monitoring/application/advancesStore.js';
import { useTeamUserStore } from '@/domains/team/application/team-user.store.js';
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from 'primevue/confirmdialog';
import DatePicker from 'primevue/datepicker';

const { t } = useI18n();
const router = useRouter();
const store = useAdvanceStore();
const teamStore = useTeamUserStore();
const confirm = useConfirm();

// Static options mapping to execution keys
const specialtiesOptions = computed(() => [
  t('execution.advances.specialties.structures'),
  t('execution.advances.specialties.installations'),
  t('execution.advances.specialties.architecture')
]);

const operationalManagers = computed(() => {
  if (teamStore && teamStore.teamUsers) {
    return teamStore.teamUsers.filter(u =>
        u.isActive &&
        (String(u.role).toLowerCase().includes('gestor') ||
            String(u.role).toLowerCase().includes('manager'))
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
  description: '',
  responsible: '',
  workers: 0,
  weather: 'sunny'
});

onMounted(() => {
  if (teamStore.fetchUsers) {
    teamStore.fetchUsers();
  }
});

const saveProgress = async () => {
  const newEntry = {
    ...form,
    status: form.percentage >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
    lastUpdate: form.date ? new Date(form.date) : new Date(),
    date: form.date ? new Date(form.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  };

  await store.addAdvance(newEntry);
  router.push('/advances/registry');
};

const cancelCreation = () => {
  if (form.activityName || form.percentage > 0 || form.description) {
    confirm.require({
      message: t('execution.create.discardMessage'),
      header: t('execution.create.discardHeader'),
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
      acceptProps: { label: t('common.yes'), severity: 'danger' },
      accept: () => router.push('/advances/registry')
    });
  } else {
    router.push('/advances/registry');
  }
};
</script>

<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <ConfirmDialog />

    <div class="flex gap-6">
      <div class="flex-grow bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ t('execution.create.title') }}</h2>

        <form @submit.prevent="saveProgress" class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.date') }}</label>
            <DatePicker v-model="form.date" showIcon iconDisplay="input" fluid class="!rounded-lg" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.specialty') }}</label>
            <select v-model="form.specialty" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none cursor-pointer">
              <option value="" disabled>Seleccione especialidad</option>
              <option v-for="opt in specialtiesOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="col-span-2 flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.activity') }}</label>
            <input type="text" v-model="form.activityName" :placeholder="t('execution.create.placeholders.activity')" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none">
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.location') }}</label>
            <input type="text" v-model="form.location" :placeholder="t('execution.create.placeholders.location')" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none">
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.progress') }}</label>
            <div class="relative">
              <input type="number" v-model="form.percentage" min="0" max="100" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none w-full pr-10">
              <span class="absolute right-4 top-3 text-gray-400 font-bold">%</span>
            </div>
          </div>

          <div class="col-span-2 flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.description') }}</label>
            <textarea v-model="form.description" rows="4" placeholder="Describa el trabajo..." class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none resize-none"></textarea>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.responsible') }}</label>
            <select v-model="form.responsible" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none cursor-pointer">
              <option value="" disabled>Seleccione un Gestor</option>
              <option v-for="user in operationalManagers" :key="user.id" :value="user.fullName">{{ user.fullName }}</option>
              <option v-if="operationalManagers.length === 0" value="Juan Pérez">Juan Pérez (Gestor de Obra)</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.crewSize') }}</label>
            <input type="number" v-model="form.workers" min="0" class="bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none">
          </div>

          <div class="col-span-2 flex flex-col gap-2 mt-2">
            <label class="text-xs font-bold text-gray-400 uppercase">{{ t('execution.create.fields.weather') }}</label>
            <div class="flex gap-2">
              <button type="button" @click="form.weather = 'sunny'" :class="form.weather === 'sunny' ? 'bg-gray-800 text-white' : 'border border-gray-200 text-gray-600'" class="px-6 py-2 rounded-md text-sm font-medium transition-colors">{{ t('execution.weather.sunny') }}</button>
              <button type="button" @click="form.weather = 'cloudy'" :class="form.weather === 'cloudy' ? 'bg-gray-800 text-white' : 'border border-gray-200 text-gray-600'" class="px-6 py-2 rounded-md text-sm font-medium transition-colors">{{ t('execution.weather.cloudy') }}</button>
              <button type="button" @click="form.weather = 'rainy'" :class="form.weather === 'rainy' ? 'bg-gray-800 text-white' : 'border border-gray-200 text-gray-600'" class="px-6 py-2 rounded-md text-sm font-medium transition-colors">{{ t('execution.weather.rainy') }}</button>
            </div>
          </div>
        </form>

        <div class="mt-10 flex gap-4">
          <button @click="saveProgress" class="bg-gray-800 text-white py-6 flex-grow rounded-lg text-lg font-bold hover:bg-gray-900 transition-colors">
            {{ t('execution.submitBtn') }}
          </button>
          <button @click="cancelCreation" class="w-1/4 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>

      <div class="w-[350px] flex flex-col gap-6">
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 class="font-bold text-gray-800 text-sm mb-4">Estadísticas del Día</h3>
          <div class="flex flex-col gap-3 text-sm text-gray-600">
            <div class="flex justify-between border-b pb-2"><span>Personal en obra:</span> <strong>{{ form.workers || 0 }}</strong></div>
            <div class="flex justify-between"><span>Clima:</span> <strong class="capitalize">{{ form.weather }}</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>