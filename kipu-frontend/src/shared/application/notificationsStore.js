import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';
import { notificationsApi } from '@/shared/infrastructure/notifications.api.js';

export const useNotificationsStore = defineStore('notifications', () => {
  const projectsStore = useProjectsStore();

  const notifications = ref([]);
  const isLoading = ref(false);

  const activeProjectNotifications = computed(() => {
    return notifications.value.filter(
      n => String(n.relatedProjectId) === String(projectsStore.currentProjectId)
    );
  });

  const projectNotifications = computed(() => notifications.value); // Just show all for now
  
  const latestThree = computed(() => notifications.value.slice(0, 3));

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length;
  });

  const loadNotifications = async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      isLoading.value = true;
      const data = await notificationsApi.getByUser(user.id);
      notifications.value = data.map(n => ({
        ...n,
        title: n.message,
        description: n.message,
        date: n.createdAt,
        read: n.isRead
      }));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const markAsRead = (id) => {
    const notif = notifications.value.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
  };

  const clearAll = () => {
    notifications.value = [];
  };

  const dismissNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.isRead = true);
  };

  const acceptInvitation = async (id) => {
    try {
      await notificationsApi.accept(id);
      await loadNotifications();
      await projectsStore.loadProjects(); // Reload projects to show the new one
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const rejectInvitation = async (id) => {
    try {
      await notificationsApi.reject(id);
      await loadNotifications();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    }
  };

  return {
    notifications,
    activeProjectNotifications,
    projectNotifications,
    latestThree,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    dismissNotification,
    clearAll,
    markAllAsRead,
    acceptInvitation,
    rejectInvitation
  };
});

