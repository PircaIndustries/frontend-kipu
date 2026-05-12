<script setup>
/**
 * Root Application component.
 * Orchestrates the main layout with the side navigation bar.
 * Sidebar is conditionally hidden for identity routes via route meta fields.
 */
import { useRoute } from 'vue-router';
import SideNavigationBar from '@/shared/presentation/components/SideNavigationBar.vue';

const route = useRoute();
</script>

<template>
    <div class="app-container" :class="{ 'app-container--no-sidebar': route.meta.hideSidebar }">
        <SideNavigationBar v-if="!route.meta.hideSidebar" />

        <main class="main-content" :class="{ 'main-content--full': route.meta.hideSidebar }">
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

/* When sidebar is hidden (identity routes), remove padding for full-bleed layout */
.main-content--full {
    padding: 0;
    background-color: transparent;
}
</style>