<script setup>
/**
 * Root Application component.
 * Conditionally renders the authenticated layout (sidebar + header)
 * or a full-screen view for identity routes based on route.meta.hideSidebar.
 */
import { useRoute } from 'vue-router';
import SideNavigationBar from '@/shared/presentation/components/SideNavigationBar.vue';
import HeaderComponent from '@/shared/presentation/components/headerComponent.vue';

const route = useRoute();
</script>

<template>
  <Toast position="bottom-right" />

  <!-- Identity routes: full-screen, no sidebar/header -->
  <router-view v-if="route.meta.hideSidebar" />

  <!-- Authenticated routes: sidebar + header layout -->
  <div v-else class="flex h-screen w-screen">
    <SideNavigationBar />
    <main class="flex flex-col flex-1 w-full overflow-y-auto">
      <header-component />
      <router-view />
    </main>
  </div>
</template>

<style>
/* Reset and layout setup */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}
</style>