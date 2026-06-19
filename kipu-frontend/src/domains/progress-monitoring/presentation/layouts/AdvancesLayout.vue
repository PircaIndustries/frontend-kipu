<script setup>
/**
 * AdvancesLayout: Shared layout for progress monitoring tabs.
 */
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// Sync active tab state based on the current path
const activeTab = ref(route.path.includes('photos') ? '1' : '0');

const onTabChange = (value) => {
  if (value === '0') router.push('/advances/registry');
  else if (value === '1') router.push('/advances/photos');
  else router.push('/advances/calendar');
};
</script>

<template>
  <div class="advances-layout">
    <Tabs v-model:value="activeTab" @update:value="onTabChange">
      <TabList>
        <Tab value="0">{{ t('execution.advances.tabs.registry') }}</Tab>
        <Tab value="1">{{ t('execution.advances.tabs.photoLog') }}</Tab>
        <Tab value="2">{{ t('execution.advances.tabs.calendar') }}</Tab>
      </TabList>
    </Tabs>
    <div class="p-4">
      <router-view />
    </div>
  </div>
</template>