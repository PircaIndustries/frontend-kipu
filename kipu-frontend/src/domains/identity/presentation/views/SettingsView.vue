<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAccessibilityStore } from '@/shared/application/accessibilityStore.js';
import { useI18n } from 'vue-i18n';
import SelectButton from 'primevue/selectbutton';
import ToggleButton from 'primevue/togglebutton';
import Select from 'primevue/select';
import Card from 'primevue/card';
import Button from 'primevue/button';

const { t } = useI18n();
const accessStore = useAccessibilityStore();
const route = useRoute();
const router = useRouter();

// Retrieve previous page or fallback
const backPath = computed(() => {
  return route.query.from || '/projects';
});

function handleGoBack() {
  router.push(backPath.value);
}

// Option labels with computed reactivity for dynamic translation switching
const contrastOptions = computed(() => [
  { label: t('settings.contrast_normal', 'Normal'), value: 'normal', icon: 'pi pi-sun' },
  { label: t('settings.contrast_high', 'Alto Contraste'), value: 'high', icon: 'pi pi-eye' }
]);

const fontSizeOptions = computed(() => [
  { label: t('settings.fontSize_normal', 'Normal'), value: 'normal' },
  { label: t('settings.fontSize_large', 'Grande (Large)'), value: 'large' },
  { label: t('settings.fontSize_xlarge', 'Extra Grande (XL)'), value: 'xlarge' }
]);

const colorBlindnessOptions = computed(() => [
  { label: t('settings.color_off', 'Desactivado (Off)'), value: 'off' },
  { label: t('settings.color_protanopia', 'Protanopía (Rojo-Verde)'), value: 'protanopia' },
  { label: t('settings.color_deuteranopia', 'Deuteranopía (Verde-Rojo)'), value: 'deuteranopia' },
  { label: t('settings.color_tritanopia', 'Tritanopía (Azul-Amarillo)'), value: 'tritanopia' }
]);

const languageOptions = [
  { label: 'Español (ES)', value: 'es' },
  { label: 'English (EN)', value: 'en' }
];

const toggleLabelOn = computed(() => t('settings.toggle_on', 'Activado'));
const toggleLabelOff = computed(() => t('settings.toggle_off', 'Desactivado'));
</script>

<template>
  <div class="settings-page-container fade-in">
    <!-- Header with Back Button -->
    <div class="settings-header">
      <Button
        icon="pi pi-arrow-left"
        :label="t('settings.back', 'Volver')"
        text
        plain
        @click="handleGoBack"
        class="back-btn mr-4"
      />
      <div class="header-icon-wrap">
        <i class="pi pi-cog spin-hover"></i>
      </div>
      <div>
        <h1 class="settings-title">{{ t('settings.title') }}</h1>
        <p class="settings-subtitle">{{ t('settings.subtitle') }}</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="settings-grid">
      <!-- Section 1: Visual Accessibility -->
      <pv-card class="settings-card shadow-premium hover-scale">
        <template #title>
          <div class="card-title-container">
            <i class="pi pi-image text-accent"></i>
            <span>{{ t('settings.visual_accessibility') }}</span>
          </div>
        </template>
        <template #content>
          <div class="settings-fields">
            <!-- Contrast -->
            <div class="settings-field-row">
              <div class="field-desc">
                <span class="field-label">{{ t('settings.contrast') }}</span>
                <span class="field-hint">{{ t('settings.contrast_hint') }}</span>
              </div>
              <div class="field-control">
                <SelectButton
                  v-model="accessStore.contrast"
                  :options="contrastOptions"
                  optionLabel="label"
                  optionValue="value"
                  @change="accessStore.setContrast($event.value)"
                  class="custom-select-button"
                />
              </div>
            </div>

            <hr class="separator" />

            <!-- Font Size -->
            <div class="settings-field-row">
              <div class="field-desc">
                <span class="field-label">{{ t('settings.font_size') }}</span>
                <span class="field-hint">{{ t('settings.font_size_hint') }}</span>
              </div>
              <div class="field-control">
                <pv-select
                  v-model="accessStore.fontSize"
                  :options="fontSizeOptions"
                  optionLabel="label"
                  optionValue="value"
                  @change="accessStore.setFontSize($event.value)"
                  class="custom-select w-48"
                />
              </div>
            </div>

            <hr class="separator" />

            <!-- Dyslexic Font -->
            <div class="settings-field-row">
              <div class="field-desc">
                <span class="field-label">{{ t('settings.dyslexic_font') }}</span>
                <span class="field-hint">{{ t('settings.dyslexic_hint') }}</span>
              </div>
              <div class="field-control">
                <ToggleButton
                  v-model="accessStore.dyslexicFont"
                  :onLabel="toggleLabelOn"
                  :offLabel="toggleLabelOff"
                  @change="accessStore.setDyslexicFont($event.value)"
                  class="custom-toggle"
                />
              </div>
            </div>
          </div>
        </template>
      </pv-card>

      <!-- Section 2: Cognitive & Motor Accessibility -->
      <pv-card class="settings-card shadow-premium hover-scale">
        <template #title>
          <div class="card-title-container">
            <i class="pi pi-sliders-h text-accent"></i>
            <span>{{ t('settings.cognitive_motor') }}</span>
          </div>
        </template>
        <template #content>
          <div class="settings-fields">
            <!-- Colorblind Modes -->
            <div class="settings-field-row">
              <div class="field-desc">
                <span class="field-label">{{ t('settings.colorblindness') }}</span>
                <span class="field-hint">{{ t('settings.colorblindness_hint') }}</span>
              </div>
              <div class="field-control">
                <pv-select
                  v-model="accessStore.colorBlindness"
                  :options="colorBlindnessOptions"
                  optionLabel="label"
                  optionValue="value"
                  @change="accessStore.setColorBlindness($event.value)"
                  class="custom-select w-48"
                />
              </div>
            </div>

            <hr class="separator" />

            <!-- Reduced Motion -->
            <div class="settings-field-row">
              <div class="field-desc">
                <span class="field-label">{{ t('settings.reduced_motion') }}</span>
                <span class="field-hint">{{ t('settings.reduced_motion_hint') }}</span>
              </div>
              <div class="field-control">
                <ToggleButton
                  v-model="accessStore.reducedMotion"
                  :onLabel="toggleLabelOn"
                  :offLabel="toggleLabelOff"
                  @change="accessStore.setReducedMotion($event.value)"
                  class="custom-toggle"
                />
              </div>
            </div>
          </div>
        </template>
      </pv-card>

      <!-- Section 3: Inclusivity & Layout Preferences -->
      <pv-card class="settings-card shadow-premium hover-scale">
        <template #title>
          <div class="card-title-container">
            <i class="pi pi-globe text-accent"></i>
            <span>{{ t('settings.inclusivity_layout') }}</span>
          </div>
        </template>
        <template #content>
          <div class="settings-fields">
            <!-- Language Selector -->
            <div class="settings-field-row">
              <div class="field-desc">
                <span class="field-label">{{ t('settings.language') }}</span>
                <span class="field-hint">{{ t('settings.language_hint') }}</span>
              </div>
              <div class="field-control">
                <pv-select
                  v-model="accessStore.language"
                  :options="languageOptions"
                  optionLabel="label"
                  optionValue="value"
                  @change="accessStore.setLanguage($event.value)"
                  class="custom-select w-48"
                />
              </div>
            </div>

            <hr class="separator" />

            <!-- Simplified UI Mode -->
            <div class="settings-field-row">
              <div class="field-desc">
                <span class="field-label">{{ t('settings.simplified_ui') }}</span>
                <span class="field-hint">{{ t('settings.simplified_hint') }}</span>
              </div>
              <div class="field-control">
                <ToggleButton
                  v-model="accessStore.simplifiedUI"
                  :onLabel="toggleLabelOn"
                  :offLabel="toggleLabelOff"
                  @change="accessStore.setSimplifiedUI($event.value)"
                  class="custom-toggle"
                />
              </div>
            </div>
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.settings-page-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.back-btn {
  font-weight: 700;
  color: var(--color-accent) !important;
}

.back-btn :deep(.p-button-icon) {
  font-weight: bold;
}

.header-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
  flex-shrink: 0;
}

.spin-hover:hover {
  transform: rotate(45deg);
  transition: transform 0.3s ease;
}

.settings-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
}

.settings-subtitle {
  font-size: var(--text-sm);
  color: #6c757d;
  margin: 0.25rem 0 0 0;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-card {
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.card-title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
}

.settings-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.5rem 0;
}

.settings-field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.field-desc {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.field-label {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-main);
}

.field-hint {
  font-size: var(--text-xs);
  color: #6c757d;
}

.field-control {
  display: flex;
  align-items: center;
}

.separator {
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin: 0.5rem 0;
}

.shadow-premium {
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-scale:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .settings-field-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .field-control {
    width: 100%;
  }
  .w-48 {
    width: 100% !important;
  }
}
</style>
