import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
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
import Card from 'primevue/card';
import { createPinia } from 'pinia';
import AutoComplete from 'primevue/autocomplete';
import Form from '@primevue/forms/form';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';
// Styles
import 'primeicons/primeicons.css';
import './style.css';
import './style.css';
import {Toast, ToastService} from "primevue";

const app = createApp(App);
const pinia = createPinia();


app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(pinia);
app.use(ConfirmationService);
app.use(router);
app.use(i18n);
app.use(ToastService);
app.component('Toast', Toast)
app.component('pv-tabs', Tabs);
app.component('pv-tablist', TabList);
app.component('pv-tab', Tab);
app.component('pv-tabpanels', TabPanels);
app.component('pv-tabpanel', TabPanel);
app.component('pv-card', Card);
app.component('pv-autocomplete', AutoComplete);
app.component('pv-form', Form);
app.component('pv-inputnumber', InputNumber);
app.component('pv-inputtext', InputText);
app.component('pv-select', Select);
app.component('pv-datepicker', DatePicker);
app.component('pv-textarea', Textarea);
app.component('pv-button', Button);
app.component('pv-toast', Toast);
app.component('pv-message', Message);
app.directive('ripple', Ripple);
app.mount('#app');