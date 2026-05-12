<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const currentRoute = computed(() => route.path);

const tabs = [
  { label: t('logistics-tabs.tab-inventory'), route: '/logistics/inventory' },
  { label: t('logistics-tabs.tab-requests'), route: '/logistics/requests' },
  { label: t('logistics-tabs.tab-suppliers'), route: '/logistics/suppliers' },
  { label: t('logistics-tabs.tab-waste'), route: '/logistics/waste' },
  { label: t('logistics-tabs.tab-machinery'), route: '/logistics/machinery' },
];
</script>

<template>
  <div class="m-0">
    <pv-tabs :value="currentRoute"
             class="m-0 p-0"
    >
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