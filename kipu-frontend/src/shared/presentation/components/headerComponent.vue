<script setup>
/**
 * Header component.
 * Shows the current project name (or a prompt to select one),
 * language switcher, and action icons with a notification dropdown.
 */
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore';
import { useNotificationsStore } from '@/shared/application/notificationsStore';

const { t, locale, availableLocales } = useI18n();
const projectsStore = useProjectsStore();
const notifStore = useNotificationsStore();
const router = useRouter();
const route = useRoute();

const showDropdown = ref(false);
const dropdownRef = ref(null);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function handleNotificationClick(item) {
  notifStore.markAsRead(item.id);
  router.push(item.route);
  showDropdown.value = false;
}

function handleDismiss(id, event) {
  event.stopPropagation(); // prevent route change
  notifStore.dismissNotification(id);
}

function handleViewAll() {
  showDropdown.value = false;
  router.push({
    name: 'Notifications',
    query: { from: route.path }
  });
}

// Click outside handler to close dropdown
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Helper for type icons
function getIconForType(type) {
  switch (type) {
    case 'logistica': return 'pi pi-box text-blue-500';
    case 'firmas': return 'pi pi-pencil text-amber-500';
    case 'rnc': return 'pi pi-exclamation-triangle text-red-500';
    case 'presupuesto': return 'pi pi-money-bill text-emerald-500';
    default: return 'pi pi-calendar text-gray-500';
  }
}
</script>

<template>
  <header class="flex items-center justify-between px-8 h-16 bg-white border-b border-neutral-border/40 w-full relative z-50">
    <div class="flex items-center gap-2">
      <h1 class="text-xl font-bold text-primary tracking-tight leading-none m-0">
        {{ projectsStore.currentProjectName || t('projects_dashboard.select_title') }}
      </h1>
    </div>

    <div class="flex items-center gap-2">
      <!-- Language switcher -->
      <div class="flex items-center gap-1 bg-neutral-bg rounded-full p-1">
        <button
            v-for="lang in availableLocales"
            :key="lang"
            @click="locale = lang"
            :class="[
            'px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer',
            locale === lang
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-main hover:bg-neutral-border/20'
          ]"
        >
          {{ lang.toUpperCase() }}
        </button>
      </div>

      <!-- Notifications & settings -->
      <div class="flex items-center gap-1">
        <!-- Notification Bell Container -->
        <div class="relative" ref="dropdownRef" style="position: relative;">
          <button
              @click="toggleDropdown"
              class="relative flex items-center justify-center text-primary cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 w-10 h-10 rounded-full hover:bg-neutral-bg/50 border-none bg-transparent"
              aria-label="Notifications"
          >
            <i class="pi pi-bell text-2xl leading-none"></i>
            <span
              v-if="notifStore.unreadCount > 0"
              class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse"
            >
              {{ notifStore.unreadCount }}
            </span>
          </button>

          <!-- Notifications Dropdown Panel -->
          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-neutral-border/20 py-2 z-50 animate-slide-up"
            style="top: 100%; right: 0; min-width: 320px; max-height: 450px; display: flex; flex-direction: column;"
          >
            <div class="flex items-center justify-between px-4 py-2 border-b border-neutral-border/10">
              <span class="font-bold text-gray-800 text-sm">{{ t('notifications.title') }}</span>
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                {{ notifStore.projectNotifications.length }} {{ t('notifications.total_suffix') }}
              </span>
            </div>

            <!-- Notifications Scrollable Area -->
            <div class="overflow-y-auto max-h-[300px] flex-1">
              <div
                v-for="item in notifStore.latestThree"
                :key="item.id"
                @click="handleNotificationClick(item)"
                :class="[
                  'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 relative group border-b border-neutral-border/5',
                  item.read ? 'hover:bg-neutral-bg/30' : 'bg-blue-50/20 hover:bg-blue-50/40'
                ]"
              >
                <!-- Indicator for unread -->
                <div v-if="!item.read" class="w-1.5 h-1.5 bg-blue-500 rounded-full absolute left-1.5 top-5"></div>

                <div class="flex-shrink-0 mt-0.5">
                  <i :class="getIconForType(item.type)"></i>
                </div>
                
                <div class="flex-1 min-w-0 pr-4">
                  <p class="text-xs font-bold text-gray-800 m-0 truncate">{{ item.title }}</p>
                  <p class="text-[11px] text-gray-500 mt-0.5 mb-0 leading-normal line-clamp-2">{{ item.description }}</p>
                  <span class="text-[9px] text-gray-400 mt-1 block">{{ item.date }}</span>
                </div>

                <!-- Dismiss Button -->
                <button
                  @click="handleDismiss(item.id, $event)"
                  class="absolute right-2 top-3 p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-gray-100 transition-all border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Dismiss notification"
                >
                  <i class="pi pi-times text-[10px]"></i>
                </button>
              </div>

              <!-- Empty State -->
              <div v-if="notifStore.projectNotifications.length === 0" class="flex flex-col items-center justify-center py-8 px-4 text-center">
                <i class="pi pi-bell-slash text-gray-300 text-3xl mb-2"></i>
                <p class="text-xs text-gray-500 font-semibold m-0">{{ t('notifications.empty_short') }}</p>
              </div>
            </div>

            <!-- Dropdown Footer -->
            <div class="border-t border-neutral-border/10 px-4 pt-2 pb-1 text-center">
              <button
                @click="handleViewAll"
                class="w-full text-xs font-bold text-accent hover:text-primary transition-all py-1.5 border-none bg-transparent cursor-pointer flex items-center justify-center gap-1"
              >
                {{ t('notifications.view_all') }}
                <i class="pi pi-chevron-right text-[9px]"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Settings Button -->
        <router-link
            :to="{ path: '/settings', query: { from: route.path } }"
            class="flex items-center justify-center text-primary hover:text-accent cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 w-10 h-10 rounded-full hover:bg-neutral-bg/50"
            aria-label="Settings"
        >
          <i class="pi pi-cog text-2xl leading-none"></i>
        </router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>