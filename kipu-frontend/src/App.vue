<script setup>
/**
 * Root Application component.
 * Orchestrates the main layout with the side navigation bar.
 */
import SideNavigationBar from '@/shared/presentation/components/SideNavigationBar.vue';
import HeaderComponent from "@/shared/presentation/components/headerComponent.vue";
</script>

<template>
  <div class="flex h-screen w-screen">
    <SideNavigationBar/>
    <main class="flex flex-col flex-1 w-full overflow-y-auto">
      <header-component></header-component>
      <router-view/>
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