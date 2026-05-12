<script setup>
/**
 * AdvancesLayout
 * Shared layout for Execution module tabs.
 */
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// Sync active tab with the current route
const activeTab = ref(route.path.includes('photos') ? '1' : '0');

// Navigation logic
const onTabChange = (value) => {
  if (value === '0') router.push('/advances/registry');
  else router.push('/advances/photos');
};
</script>

<template>
  <div class="advances-layout">
    <Tabs v-model:value="activeTab" @update:value="onTabChange" class="custom-tabs">
      <TabList>
        <Tab value="0">{{ t('execution.advances.tabs.registry') }}</Tab>
        <Tab value="1">{{ t('execution.advances.tabs.photoLog') }}</Tab>
      </TabList>
    </Tabs>

    <div class="advances-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.advances-layout {
  padding: 0;
}

.custom-tabs {
  background: white;
  margin-bottom: 1.5rem;
  border-radius: 8px 8px 0 0;
}

:deep(.p-tablist-tab-list) {
  background: white !important;
  border-bottom: 2px solid #f1f1f1 !important;
}

:deep(.p-tab) {
  font-weight: 600 !important;
  color: #95a5a6 !important;
  padding: 1rem 2rem !important;
  transition: all 0.3s;
}

/* Kipu Blue for the active tab */
:deep(.p-tab-active) {
  color: #3498db !important;
  border-color: #3498db !important;
}

.advances-content {
  /* No padding here because children views have their own padding */
}
</style>