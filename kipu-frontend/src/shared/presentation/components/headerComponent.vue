<script setup>
/**
 * Header component.
 * Shows the current project name (or a prompt to select one),
 * language switcher, and action icons.
 */
import { useI18n } from 'vue-i18n';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore';

const { t, locale, availableLocales } = useI18n();
const projectsStore = useProjectsStore();
</script>

<template>
  <header class="flex items-center justify-between px-8 h-16 bg-white border-b border-neutral-border/40 w-full">
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
        <router-link
            to="/notifications"
            class="relative flex items-center justify-center text-primary cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 w-10 h-10 rounded-full hover:bg-neutral-bg/50"
            aria-label="Notifications"
        >
          <i class="pi pi-bell text-2xl leading-none"></i>
        </router-link>
        <router-link
            to="/settings"
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
</style>