import { createI18n } from 'vue-i18n';
import en from './en.js';
import es from './es.js';

const i18n = createI18n({
    legacy: false, // Set false for Composition API
    locale: 'es', // Default language
    messages: { en, es }
});

export default i18n;