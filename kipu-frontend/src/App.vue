<script setup>
import { useI18n } from 'vue-i18n'
console.log(import.meta.env.VITE_API_TEST);
const { t } = useI18n()
</script>

<template>
  {{ t("description") }}
</template>