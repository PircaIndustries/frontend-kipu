<script setup>
/**
 * Root Application component.
 * Conditionally renders the authenticated layout (sidebar + header)
 * or a full-screen view for identity routes based on route.meta.hideSidebar.
 */
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SideNavigationBar from '@/shared/presentation/components/SideNavigationBar.vue';
import HeaderComponent from '@/shared/presentation/components/headerComponent.vue';
import Drawer from 'primevue/drawer';

const route = useRoute();
const mobileMenuOpen = ref(false);

// Close the drawer when the route changes
watch(() => route.path, () => {
  mobileMenuOpen.value = false;
});
</script>

<template>
  <Toast position="bottom-right" />

  <!-- Identity routes: full-screen, no sidebar/header -->
  <router-view v-if="route.meta.hideSidebar" />

  <!-- Authenticated routes: sidebar + header layout -->
  <div v-else class="flex h-screen w-screen overflow-hidden">
    <!-- Desktop Sidebar -->
    <div class="desktop-sidebar h-full shrink-0">
      <SideNavigationBar class="w-[260px] h-full" />
    </div>
    
    <!-- Mobile Drawer -->
    <Drawer v-model:visible="mobileMenuOpen" class="!w-[260px] !p-0 custom-drawer">
      <template #container>
         <SideNavigationBar class="w-full h-full" />
      </template>
    </Drawer>

    <main class="flex flex-col flex-1 w-full overflow-y-auto">
      <header-component @toggle-sidebar="mobileMenuOpen = true" />
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

/* Override PrimeVue Drawer styles for our mobile menu */
.custom-drawer .p-drawer-content {
  padding: 0 !important;
}
.custom-drawer .p-drawer-header {
  display: none !important;
}

@media (max-width: 1023px) {
  .desktop-sidebar {
    display: none !important;
  }
}
</style>