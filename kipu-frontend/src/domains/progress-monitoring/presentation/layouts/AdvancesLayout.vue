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
  else router.push('/advances/photos');
};
</script>

<template>
  <div class="advances-layout">
    <Tabs v-model:value="activeTab" @update:value="onTabChange">
      <TabList>
        <Tab value="0">{{ t('execution.advances.tabs.registry') }}</Tab>
        <Tab value="1">{{ t('execution.advances.tabs.photoLog') }}</Tab>
      </TabList>
    </Tabs>
    <router-view />
  </div>
</template>