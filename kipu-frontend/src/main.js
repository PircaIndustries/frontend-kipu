import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura'; // Using Aura theme for a modern look
import router from './router';
import i18n from './locales/i18n';
import App from './App.vue';
import ConfirmationService from 'primevue/confirmationservice';
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Ripple from 'primevue/ripple';
import { createPinia } from 'pinia';

// Styles
import 'primeicons/primeicons.css';
import './style.css'; // Your global styles

const app = createApp(App);
const pinia = createPinia();


app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(pinia);
app.use(ConfirmationService);
app.use(router);
app.use(i18n);
app.component('pv-tabs', Tabs);
app.component('pv-tablist', TabList);
app.component('pv-tab', Tab);
app.component('pv-tabpanels', TabPanels);
app.component('pv-tabpanel', TabPanel);

app.directive('ripple', Ripple);
app.mount('#app');