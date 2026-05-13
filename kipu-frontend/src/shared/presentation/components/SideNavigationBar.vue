<script setup>
/**
 * Side Navigation Bar component.
 * Displays logged-in user info, navigation menu, and logout functionality.
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

const { t } = useI18n();
const router = useRouter();

/** Read user application from localStorage (set at login). */
const currentUser = computed(() => {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : { name: 'User', role: '' };
  } catch { return { name: 'User', role: '' }; }
});

/** Navigation items definition. */
const menuItems = [
  { label: 'navigation.projects', icon: 'pi pi-folder', to: '/projects' },
  { label: 'navigation.advances', icon: 'pi pi-calendar', to: '/advances' },
  { label: 'navigation.rnc', icon: 'pi pi-exclamation-triangle', to: '/rnc' },
  { label: 'navigation.logistics', icon: 'pi pi-box', to: '/logistics' },
  { label: 'navigation.blueprints', icon: 'pi pi-map', to: '/blueprints' },
  { label: 'navigation.signatures', icon: 'pi pi-pencil', to: '/signatures' },
  { label: 'navigation.budget', icon: 'pi pi-money-bill', to: '/budget' },
  { label: 'navigation.team', icon: 'pi pi-users', to: '/team' }
];

// ── Logout ──
const showLogoutMenu = ref(false);
const showLogoutSuccess = ref(false);

function toggleLogoutMenu() {
  showLogoutMenu.value = !showLogoutMenu.value;
}

function performLogout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentProjectId');
  showLogoutMenu.value = false;
  showLogoutSuccess.value = true;
}

function goToLogin() {
  showLogoutSuccess.value = false;
  router.push('/login');
}
</script>

<template>
  <nav class="side-navigation">
    <div class="logo-container">
      <div class="logo-text">
        <span class="brand-name">Kipu</span>
        <span class="brand-subtitle">{{ t('common.management') }}</span>
      </div>
    </div>

    <ul class="menu-list">
      <li v-for="item in menuItems" :key="item.label" class="menu-item">
        <router-link :to="item.to" class="menu-link" active-class="active-link">
          <i :class="item.icon"></i>
          <span>{{ t(item.label) }}</span>
        </router-link>
      </li>
    </ul>

    <!-- User profile (clickable for logout) -->
    <div class="user-profile" @click="toggleLogoutMenu">
      <Avatar icon="pi pi-user" shape="circle" size="large" class="user-avatar" />
      <div class="user-info">
        <span class="user-name">{{ currentUser.name }}</span>
        <span class="user-role">{{ currentUser.role }}</span>
      </div>
      <i class="pi pi-chevron-up user-chevron" :class="{ 'user-chevron--open': showLogoutMenu }"></i>
    </div>

    <!-- Logout dropdown -->
    <div v-if="showLogoutMenu" class="logout-dropdown">
      <button class="logout-btn" @click="performLogout">
        <i class="pi pi-sign-out"></i>
        <span>{{ t('logout.title') }}</span>
      </button>
    </div>

    <!-- Logout success dialog -->
    <Dialog v-model:visible="showLogoutSuccess" modal :closable="false" :style="{ width: '380px' }">
      <div class="logout-success">
        <i class="pi pi-check-circle"></i>
        <h2>{{ t('logout.title') }}</h2>
        <p>{{ t('logout.description') }}</p>
        <Button :label="t('logout.continue')" @click="goToLogin" />
      </div>
    </Dialog>
  </nav>
</template>

<style scoped>
.side-navigation {
  width: 260px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: relative;
}

.logo-container {
  margin-bottom: 2.5rem;
  padding-left: 0.5rem;
}

.brand-name {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-subtitle {
  font-size: 0.8rem;
  color: #95a5a6;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.menu-item {
  margin-bottom: 0.5rem;
}

/** Link Base Styles */
.menu-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  color: #bdc3c7;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/** Hover State */
.menu-link:hover {
  background-color: rgba(52, 152, 219, 0.2);
  color: white;
}

/** Active State */
.active-link {
  background-color: #3498db !important;
  color: white !important;
}

/** User Profile Styles */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-profile:hover {
  background-color: rgba(52, 152, 219, 0.15);
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
}

.user-role {
  font-size: 0.8rem;
  color: #95a5a6;
}

.user-avatar {
  background-color: #34495e;
}

.user-chevron {
  font-size: 0.7rem;
  color: #95a5a6;
  transition: transform 0.2s;
}

.user-chevron--open {
  transform: rotate(180deg);
}

/* Logout dropdown */
.logout-dropdown {
  position: absolute;
  bottom: 5.5rem;
  left: 1rem;
  right: 1rem;
  background: #34495e;
  border-radius: 8px;
  padding: 0.25rem;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
  animation: slideUp 0.15s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: rgba(231, 76, 60, 0.15);
}

/* Logout success dialog */
.logout-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.logout-success i {
  font-size: 3.5rem;
  color: #4caf50;
}

.logout-success h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #212529;
}

.logout-success p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}
</style>