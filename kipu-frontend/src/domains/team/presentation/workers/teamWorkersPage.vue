<!-- src/domains/team/presentation/pages/team-workers/team-workers-page.vue -->
<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">{{ $t('team.workers.title') }}</h1>
      <Button
          :label="$t('team.workers.register.btn-add-worker')"
          icon="pi pi-user-plus"
          class="bg-pink-500 text-white border-none hover:bg-pink-600"
      />
    </div>

    <Card>
      <template #content>
        <div class="text-center py-8 text-gray-500">
          <i class="pi pi-users text-4xl mb-2 block"></i>
          <p>{{ $t('team.workers.register.no-workers-found') }}</p>
          <p class="text-sm text-gray-400 mt-2">{{ $t('team.workers.register.description') }}</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
// ❌ Elimina esta línea incorrecta:
// import {$t} from "@primevue/themes";
</script>