<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotificationsStore } from '@/shared/application/notificationsStore.js';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Card from 'primevue/card';

const { t } = useI18n();
const notifStore = useNotificationsStore();
const route = useRoute();
const router = useRouter();

// Retrieve previous page or fallback
const backPath = computed(() => {
  return route.query.from || '/projects';
});

function handleGoBack() {
  router.push(backPath.value);
}

function handleNotificationClick(item) {
  notifStore.markAsRead(item.id);
  router.push(item.route);
}

// Helpers for styled tags and icons
const formatTime = (timeString) => {
  if (!timeString) return '';
  const ts = timeString.toLowerCase();
  if (ts.includes('justo ahora')) return t('time.just_now');
  if (ts.includes('ayer')) return t('time.yesterday');
  if (ts.includes('minuto')) {
    const min = ts.replace(/\D/g, '') || 1;
    return t('time.minutes', { count: min });
  }
  if (ts.includes('hora')) {
    const hr = ts.replace(/\D/g, '') || 1;
    return t('time.hours', { count: hr });
  }
  if (ts.includes('día')) {
    const day = ts.replace(/\D/g, '') || 1;
    return t('time.days', { count: day });
  }
  return timeString;
};

function getCategoryInfo(type) {
  switch (type) {
    case 'logistica':
      return { icon: 'pi pi-box', color: '#3498db', label: t('navigation.logistics', 'Logística'), bg: '#e6f4ff' };
    case 'firmas':
      return { icon: 'pi pi-pencil', color: '#f59e0b', label: t('navigation.signatures', 'Firmas'), bg: '#fef3c7' };
    case 'rnc':
      return { icon: 'pi pi-exclamation-triangle', color: '#ef4444', label: t('navigation.rnc', 'RNC'), bg: '#fee2e2' };
    case 'presupuesto':
      return { icon: 'pi pi-money-bill', color: '#10b981', label: t('navigation.budget', 'Presupuesto'), bg: '#d1fae5' };
    default:
      return { icon: 'pi pi-calendar', color: '#6b7280', label: t('navigation.advances', 'Avances'), bg: '#f3f4f6' };
  }
}
</script>

<template>
  <div class="notifications-page-container fade-in">
    <!-- Back and Title Header -->
    <div class="notifications-header flex-row-between">
      <div class="header-left">
        <Button
          icon="pi pi-arrow-left"
          :label="t('notifications.back', 'Volver')"
          text
          plain
          @click="handleGoBack"
          class="back-btn mr-4"
        />
        <div>
          <h1 class="page-title">{{ t('notifications.title') }}</h1>
          <p class="page-subtitle">{{ t('notifications.subtitle') }}</p>
        </div>
      </div>
      <div class="header-actions" v-if="notifStore.projectNotifications.length > 0">
        <Button
          :label="t('notifications.clear_all', 'Limpiar todo')"
          icon="pi pi-trash"
          severity="danger"
          outlined
          size="small"
          @click="notifStore.clearAll"
        />
      </div>
    </div>

    <!-- Notifications List -->
    <div class="notifications-list-container">
      <div v-if="notifStore.projectNotifications.length === 0" class="empty-state-card">
        <i class="pi pi-bell-slash empty-icon"></i>
        <h3>{{ t('notifications.empty_title') }}</h3>
        <p>{{ t('notifications.empty_desc') }}</p>
        <Button :label="t('notifications.back_to_panel', 'Volver al panel')" icon="pi pi-home" size="small" class="mt-4" @click="handleGoBack" />
      </div>

      <div v-else class="notifications-grid">
        <div
          v-for="item in notifStore.projectNotifications"
          :key="item.id"
          @click="handleNotificationClick(item)"
          :class="[
            'notification-card hover-glow transition-all',
            item.read ? 'card-read' : 'card-unread'
          ]"
        >
          <!-- Unread indicator dot -->
          <div v-if="!item.read" class="unread-dot"></div>

          <!-- Type icon and category badge -->
          <div class="card-icon-wrap" :style="{ backgroundColor: getCategoryInfo(item.type).bg }">
            <i :class="getCategoryInfo(item.type).icon" :style="{ color: getCategoryInfo(item.type).color }"></i>
          </div>

          <!-- Content Details -->
          <div class="card-details">
            <div class="details-top">
              <span class="category-badge" :style="{ color: getCategoryInfo(item.type).color, borderColor: getCategoryInfo(item.type).color }">
                {{ getCategoryInfo(item.type).label }}
              </span>
              <span class="timestamp">{{ formatTime(item.date) }}</span>
            </div>
            <h4 class="notif-title">{{ item.title }}</h4>
            <p class="notif-desc">{{ item.description }}</p>
          </div>

          <!-- Dismiss Action -->
          <button
            @click.stop="notifStore.dismissNotification(item.id)"
            class="dismiss-btn-main border-none bg-transparent cursor-pointer"
            aria-label="Remove notification"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.notifications-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
}

.page-subtitle {
  font-size: var(--text-sm);
  color: #6c757d;
  margin: 0.25rem 0 0 0;
}

.back-btn {
  font-weight: 700;
  color: var(--color-accent) !important;
}

.back-btn :deep(.p-button-icon) {
  font-weight: bold;
}

.notifications-list-container {
  min-height: 400px;
}

.empty-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1.5rem;
}

.empty-state-card h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state-card p {
  color: #6c757d;
  font-size: var(--text-sm);
  margin: 0;
  max-width: 320px;
}

.notifications-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.card-unread {
  background: linear-gradient(to right, #f0f7ff 0%, #ffffff 100%);
  border-left: 4px solid var(--color-accent);
}

.card-read {
  background: white;
}

.unread-dot {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: var(--color-accent);
  border-radius: 50%;
}

.card-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.card-details {
  flex: 1;
  min-w: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.details-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid currentColor;
}

.timestamp {
  font-size: 10px;
  color: #95a5a6;
}

.notif-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.notif-desc {
  font-size: var(--text-sm);
  color: #4f5d6c;
  margin: 0;
  line-height: 1.5;
}

.dismiss-btn-main {
  padding: 0.5rem;
  border-radius: 50%;
  color: #cbd5e1;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dismiss-btn-main:hover {
  color: #ef4444;
  background-color: #fee2e2;
}

.hover-glow {
  transition: all 0.2s ease;
}

.hover-glow:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.flex-row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
