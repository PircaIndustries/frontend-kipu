<script setup>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useAdvanceStore } from '@/domains/progress-monitoring/application/advancesStore.js';
import {computed} from "vue";
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n();

const store = useAdvanceStore();
const router = useRouter();

const handleEventClick = (info) => {
  const advanceId = info.event.id;
  router.push(`/advances/edit/${advanceId}`);
};

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  events: store.calendarEvents,
  locale: locale.value,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  buttonText: {
    today: t('execution.calendar.today')
  },
  displayEventTime: false,
  eventClick: (info) => {
    router.push(`/advances/edit/${info.event.id}`);
  }
}));
</script>

<template>
  <div class="bg-white p-6 rounded-b-xl shadow-sm">
    <div v-if="store.calendarEvents.length === 0" class="flex flex-col items-center justify-center p-12 text-gray-500">
      <i class="pi pi-calendar mb-4 text-4xl text-gray-300"></i>
      <p class="text-lg font-medium">{{ t('execution.calendar.emptyState') }}</p>
    </div>
    <FullCalendar v-else :key="locale" :options="calendarOptions" />
  </div>
</template>