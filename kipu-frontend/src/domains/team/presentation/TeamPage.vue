<!-- src/domains/team/presentation/pages/team-page.vue -->
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const currentRoute = computed(() => route.path);

const tabs = [
  { label: t('team.users.tab-users'), route: '/team/users' },
  { label: t('team.workers.tab-workers'), route: '/team/workers' }
];
</script>

<template>
  <div class="mb-6">
    <pv-tabs :value="currentRoute">
      <pv-tablist>
        <pv-tab
            v-for="tab in tabs"
            :key="tab.route"
            :value="tab.route"
        >
          <router-link v-slot="{ href, navigate }" :to="tab.route" custom>
            <a
                v-ripple
                :href="href"
                @click="navigate"
                class="flex items-center gap-2 no-underline text-inherit"
            >
              <span>{{ tab.label }}</span>
            </a>
          </router-link>
        </pv-tab>
      </pv-tablist>
    </pv-tabs>
  </div>
  <router-view />
</template>
<style scoped>
</style>