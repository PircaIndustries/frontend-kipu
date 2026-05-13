<script setup>
/**
 * Side Navigation Bar component.
 * Refined version with user profile layout and updated interaction states.
 */
import { useI18n } from 'vue-i18n';
import Avatar from 'primevue/avatar';

const { t } = useI18n();

/** * Mock user data for testing purposes.
 * To be replaced by auth store data later.
 */
const currentUser = {
  name: 'Usuario Demo',
  role: t('roles.resident')
};

/** * Navigation items definition.
 */
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

    <div class="user-profile">
      <Avatar icon="pi pi-user" shape="circle" size="large" class="user-avatar" />
      <div class="user-info">
        <span class="user-name">{{ currentUser.name }}</span>
        <span class="user-role">{{ currentUser.role }}</span>
      </div>
    </div>
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

/** Hover State: More subtle as requested */
.menu-link:hover {
  background-color: rgba(52, 152, 219, 0.2);
  color: white;
}

/** Active State: Solid color to stand out */
.active-link {
  background-color: #3498db !important;
  color: white !important;
}

/** User Profile Styles (Image 3 Reference) */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: transparent; /* Changed from previous version */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
}

.user-role {
  font-size: 0.8rem;
  color: #95a5a6; /* Subtle color for the role */
}

.user-avatar {
  background-color: #34495e;
}
</style>