<!-- src/domains/team/presentation/pages/team-page.vue -->
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const currentRoute = computed(() => route.path);

const tabs = computed(() => [
  { label: t('team.users.tab-users'), route: '/team/users' },
  { label: t('team.workers.tab-workers'), route: '/team/workers' }
]);
</script>

<template>
  <div class="px-6">
    <div class="flex gap-6 border-b border-neutral-border">
      <router-link
          v-for="tab in tabs"
          :key="tab.route"
          :to="tab.route"
          class="px-2 py-3 text-text-main hover:text-primary transition-all duration-150 no-underline"
          :class="{ 'text-accent border-b-2 border-accent -mb-px': $route.path === tab.route }"
      >
        {{ tab.label }}
      </router-link>
    </div>
  </div>
  <router-view />
</template>