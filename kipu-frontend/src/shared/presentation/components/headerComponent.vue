<script setup>
</script>
<template>
  <header
      class="flex w-full items-center justify-between px-xl h-16 bg-white border-b border-red-700">
    <div class="flex items-center gap-3">
      <h1 class="text-2xl font-bold text-primary tracking-tight">
        Lorem Ipsum
      </h1>
      <router-link
          to="/projects/edit"
          class="flex items-center justify-center text-neutral-border hover:text-primary transition-colors duration-200 hover:scale-110 active:scale-90 w-8 h-8 rounded-full hover:bg-neutral-bg/50"
          aria-label="Editar proyecto"
      >
        <i class="pi pi-pencil text-xl"></i>
      </router-link>
    </div>
    <div class="flex items-center gap-6">
      <!-- <app-language-switcher /> -->
      <router-link
          to="/settings"
          class="flex items-center justify-center text-primary hover:text-accent transition-colors duration-200 hover:scale-110 active:scale-90 w-10 h-10 rounded-full hover:bg-neutral-bg/50"
          aria-label="Configuración"
      >
        <i class="pi pi-cog text-3xl"></i>
      </router-link>
    </div>
  </header>
</template>
<style scoped>
</style>