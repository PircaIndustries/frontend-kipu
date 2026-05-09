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
  font-family: 'Inter', sans-serif;
  /* Prevent body from scrolling entirely */
  overflow: hidden;
}

.app-container {
  display: flex;
  /* Fixed height: exactly the size of the screen */
  height: 100vh;
  width: 100vw;
}

.main-content {
  flex-grow: 1;
  background-color: #f4f7f6;
  padding: 2rem;
  /* This is the magic: allow scroll only in this section */
  overflow-y: auto;
}
</style>