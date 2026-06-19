import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import i18n from '@/locales/i18n';

export const useAccessibilityStore = defineStore('accessibility', () => {
  // --- States ---
  const contrast = ref(localStorage.getItem('access_contrast') || 'normal');
  const fontSize = ref(localStorage.getItem('access_fontSize') || 'normal');
  const dyslexicFont = ref(localStorage.getItem('access_dyslexicFont') === 'true');
  const colorBlindness = ref(localStorage.getItem('access_colorBlindness') || 'off');
  const reducedMotion = ref(localStorage.getItem('access_reducedMotion') === 'true');
  const simplifiedUI = ref(localStorage.getItem('access_simplifiedUI') === 'true');
  const language = ref(localStorage.getItem('access_language') || i18n.global.locale.value || 'es');

  // --- Actions ---
  function setContrast(value) {
    contrast.value = value;
    localStorage.setItem('access_contrast', value);
    applyStyles();
  }

  function setFontSize(value) {
    fontSize.value = value;
    localStorage.setItem('access_fontSize', value);
    applyStyles();
  }

  function setDyslexicFont(value) {
    dyslexicFont.value = value;
    localStorage.setItem('access_dyslexicFont', value ? 'true' : 'false');
    applyStyles();
  }

  function setColorBlindness(value) {
    colorBlindness.value = value;
    localStorage.setItem('access_colorBlindness', value);
    applyStyles();
  }

  function setReducedMotion(value) {
    reducedMotion.value = value;
    localStorage.setItem('access_reducedMotion', value ? 'true' : 'false');
    applyStyles();
  }

  function setSimplifiedUI(value) {
    simplifiedUI.value = value;
    localStorage.setItem('access_simplifiedUI', value ? 'true' : 'false');
  }

  function setLanguage(value) {
    language.value = value;
    localStorage.setItem('access_language', value);
    if (i18n.global.locale.value !== value) {
      i18n.global.locale.value = value;
    }
  }

  // --- Style Application ---
  function applyStyles() {
    if (typeof document === 'undefined') return;
    const body = document.body;

    // Contrast
    body.classList.remove('accessibility-high-contrast');
    if (contrast.value === 'high') {
      body.classList.add('accessibility-high-contrast');
    }

    // Font Size
    body.classList.remove('accessibility-font-large', 'accessibility-font-xlarge');
    if (fontSize.value === 'large') {
      body.classList.add('accessibility-font-large');
    } else if (fontSize.value === 'xlarge') {
      body.classList.add('accessibility-font-xlarge');
    }

    // Dyslexic Font
    body.classList.remove('accessibility-font-dyslexic');
    if (dyslexicFont.value) {
      body.classList.add('accessibility-font-dyslexic');
    }

    // Colorblind Modes
    body.classList.remove('accessibility-protanopia', 'accessibility-deuteranopia', 'accessibility-tritanopia');
    if (colorBlindness.value !== 'off') {
      body.classList.add(`accessibility-${colorBlindness.value}`);
    }

    // Reduced Motion
    body.classList.remove('accessibility-reduced-motion');
    if (reducedMotion.value) {
      body.classList.add('accessibility-reduced-motion');
    }
  }

  // --- Watch and Sync ---
  watch(language, (newLang) => {
    setLanguage(newLang);
  });

  // Run initialization
  applyStyles();
  setLanguage(language.value);

  return {
    contrast,
    fontSize,
    dyslexicFont,
    colorBlindness,
    reducedMotion,
    simplifiedUI,
    language,
    setContrast,
    setFontSize,
    setDyslexicFont,
    setColorBlindness,
    setReducedMotion,
    setSimplifiedUI,
    setLanguage,
    applyStyles
  };
});
