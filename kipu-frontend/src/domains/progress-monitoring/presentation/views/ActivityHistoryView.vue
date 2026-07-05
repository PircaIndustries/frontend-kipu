<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAdvanceStore } from '@/domains/progress-monitoring/application/advancesStore.js';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const store = useAdvanceStore();
const projectsStore = useProjectsStore();
const toast = useToast();
const { t } = useI18n();

const props = defineProps(['activityName']);
const activityName = decodeURIComponent(route.params.activityName);

const history = computed(() => {
  return store.advances
      .filter(a => a.activityName === activityName)
      .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
});

const editMainAdvance = () => {
  const parent = store.advances.find(a => a.activityName === activityName);
  if (parent) router.push(`/advances/edit/${parent.id}`);
};

const editVersion = (id) => router.push(`/advances/edit/${id}`);

const createNewVersion = () => {
  if (projectsStore.currentProject?.status === 'Paralizada') {
    toast.add({
      severity: 'error',
      summary: 'Proyecto Paralizado',
      detail: 'No puedes registrar avances. Debes reanudar la obra seleccionando el estado "En ejecución" desde el panel de proyecto.',
      life: 5000
    });
    return;
  }
  router.push({
    name: 'CreateAdvance',
    query: {
      activity: activityName,
      mode: 'mini-advance'
    }
  });
};
</script>

<template>
  <div class="p-8 bg-white rounded-xl shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">
        {{ t('execution.advances.activityHistory.title', { activity: activityName }) }}
      </h2>

      <div class="flex gap-3">
        <button @click="createNewVersion" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
          {{ t('execution.advances.activityHistory.addVersion') }}
        </button>
        <button @click="editMainAdvance" class="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors">
          {{ t('execution.advances.activityHistory.editMain') }}
        </button>
      </div>
    </div>

    <div class="border rounded-lg overflow-hidden">
      <div v-for="item in history" :key="item.id"
           class="p-4 border-b flex justify-between items-center hover:bg-gray-50">
        <div>
          <p class="font-bold text-gray-800">{{ new Date(item.lastUpdate).toLocaleDateString() }}</p>
          <p class="text-sm text-gray-500">{{ t('execution.advances.activityHistory.percentage') }}: {{ item.currentPercentage }}%</p>
        </div>
        <button @click="editVersion(item.id)"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
          {{ t('execution.advances.activityHistory.edit') }}
        </button>
      </div>
    </div>

    <button @click="router.back()" class="mt-6 text-gray-500 font-bold hover:text-gray-700 transition-colors">
      {{ t('common.back') }}
    </button>
  </div>
</template>