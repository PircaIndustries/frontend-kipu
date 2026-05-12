<script setup>
</script>
<template>
  <header class="flex items-center justify-between px-8 h-16 bg-white border-b border-neutral-border/40 w-full">
    <div class="flex items-center gap-2">
      <h1 class="text-xl font-bold text-primary tracking-tight leading-none m-0">
        Lorem Ipsum
      </h1>
      <router-link
          to="/projects/edit"
          class="flex items-center justify-center text-neutral-border hover:text-primary cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 w-8 h-8 rounded-full hover:bg-neutral-bg/50"
          aria-label="Edit project"
      >
        <i class="pi pi-pen-to-square text-lg leading-none"></i>
      </router-link>
    </div>
    <div class="flex items-center gap-2">
      <router-link
          to="/notifications"
          class="relative flex items-center justify-center text-primary cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 w-10 h-10 rounded-full hover:bg-neutral-bg/50"
          aria-label="Notifications"
      >
        <i class="pi pi-bell text-2xl leading-none"></i>
      </router-link>
      <router-link
          to="/settings"
          class="flex items-center justify-center text-primary hover:text-accent cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 w-10 h-10 rounded-full hover:bg-neutral-bg/50"
          aria-label="Settings"
      >
        <i class="pi pi-cog text-2xl leading-none"></i>
      </router-link>
    </div>
  </header>
</template>
<style scoped>
</style>