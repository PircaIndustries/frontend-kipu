<script setup>
/**
 * Root Application component.
 * Orchestrates the main layout with the side navigation bar.
 */
import SideNavigationBar from '@/shared/presentation/components/SideNavigationBar.vue';
</script>

<template>
  <div class="app-container">
    <SideNavigationBar />

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Reset and layout setup */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif; /* Recommended in your README */
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  background-color: #f4f7f6; /* Light gray background for contrast */
  padding: 2rem;
}
</style>