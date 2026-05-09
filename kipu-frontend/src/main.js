import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura'; // Using Aura theme for a modern look
import router from './router';
import i18n from './locales/i18n';
import App from './App.vue';
import ConfirmationService from 'primevue/confirmationservice';

// Styles
import 'primeicons/primeicons.css';
import './style.css'; // Your global styles

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(ConfirmationService);
app.use(router);
app.use(i18n);

app.mount('#app');