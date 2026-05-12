<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const currentRoute = computed(() => route.path);

const tabs = [
  { label: t('logistics-tabs.tab-inventory'), route: '/logistics/inventory' },
  { label: t('logistics-tabs.tab-requests'),  route: '/logistics/requests'  },
  { label: t('logistics-tabs.tab-suppliers'), route: '/logistics/suppliers' },
  { label: t('logistics-tabs.tab-waste'),     route: '/logistics/waste'     },
  { label: t('logistics-tabs.tab-machinery'), route: '/logistics/machinery' },
];
</script>

<template>
  <div class="w-full bg-white border-b border-neutral-border/40">
    <pv-tabs :value="currentRoute" class="m-0 p-0">
      <pv-tablist class="border-b-0! bg-transparent! px-8">
        <pv-tab
            v-for="tab in tabs"
            :key="tab.route"
            :value="tab.route"
            class="bg-transparent! border-0! px-0! py-0! !mx-0"
        >
          <router-link v-slot="{ href, navigate, isActive }" :to="tab.route" custom>
            <a
                v-ripple
                :href="href"
                @click="navigate"
                :class="[
                'flex items-center px-4 py-3.5 text-sm font-medium no-underline transition-all duration-200 border-b-2 -mb-px',
                isActive
                  ? 'text-accent border-accent'
                  : 'text-neutral-border border-transparent hover:text-primary hover:border-neutral-border/60'
              ]"
            >
              {{ tab.label }}
            </a>
          </router-link>
        </pv-tab>
      </pv-tablist>
    </pv-tabs>
  </div>

  <router-view />
</template>

<style scoped>
:deep(.p-tabs) {
  background: transparent;
  border: none;
}
:deep(.p-tablist) {
  background: transparent;
  border-bottom: none;
  gap: 0;
}
:deep(.p-tab) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}
:deep(.p-tablist-active-bar) {
  display: none;
}
</style>
