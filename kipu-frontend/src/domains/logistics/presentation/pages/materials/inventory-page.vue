<script setup>
import {onMounted, computed, ref} from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import InventoryStore from "@/domains/logistics/application/inventory.store.js";
import InventoryList from "@/domains/logistics/presentation/components/materials/inventory-list.vue";

const { t } = useI18n()
const store = InventoryStore()
const {
  filteredInventory,
  criticalCount,
  criticalStockFilter,
  selectedCategory,
  categories
} = storeToRefs(store)
const materialsCount   = computed(() => filteredInventory.value.length)
const categoryNames    = computed(() => [])

const selectedCategoryAutocomplete = ref(categories.value)


onMounted(() => {
  store.fetchCategories()
  store.fetchMaterials()
  store.fetchInventory()
})
</script>

<template>
  <section class="flex flex-col gap-6 p-6 h-full">
    <header class="flex items-center justify-between">
      <div class="flex flex-col gap-0.5">
        <h1 class="text-2xl font-bold text-primary tracking-tight m-0">
          {{ t('inventory.title') }}
        </h1>
      </div>
    </header>
    <div class="flex gap-6 flex-1 min-h-0">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <div class="flex items-center gap-2 px-3 py-2.5 bg-white border border-neutral-border/30 rounded-lg
                    focus-within:border-accent/60 focus-within:shadow-sm transition-all duration-200">
          <i class="pi pi-search text-neutral-border text-sm"></i>
          <input
              type="text"
              :placeholder="t('inventory.filters.placeholder')"
              class="flex-1 text-sm text-primary bg-transparent outline-none placeholder:text-neutral-border/70"
          />
        </div>
        <InventoryList :inventory-materials="filteredInventory" />
        <div
            v-if="filteredInventory.length === 0"
            class="flex flex-col items-center justify-center gap-3 py-20 text-center"
        >
          <div class="w-14 h-14 rounded-full bg-neutral-bg flex items-center justify-center">
            <i class="pi pi-inbox text-2xl text-neutral-border"></i>
          </div>
          <p class="text-sm font-medium text-primary m-0">Sin resultados</p>
          <p class="text-xs text-neutral-border m-0">Probá ajustando los filtros</p>
        </div>
      </div>
      <aside class="w-60 flex flex-col gap-6 shrink-0">
        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
            {{ t('general.summary') }}
          </h3>
          <div class="flex items-center justify-between px-4 py-3 bg-white border border-neutral-border/20 rounded-xl">
            <div class="flex flex-col gap-0.5">
              <p class="text-[10px] font-semibold text-neutral-border uppercase tracking-wide m-0">
                {{ t('inventory.summary.registered-materials') }}
              </p>
              <p class="text-xl font-bold text-primary m-0">{{ materialsCount }}</p>
            </div>
            <div class="w-9 h-9 rounded-full bg-neutral-bg flex items-center justify-center">
              <i class="pi pi-box text-primary text-sm"></i>
            </div>
          </div>
          <button
              @click="store.toggleCriticalFilter()"
              :class="[
              'flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-left w-full',
              criticalStockFilter
                ? 'bg-danger-soft border-danger/30 shadow-sm'
                : 'bg-white border-neutral-border/20 hover:border-danger/30 hover:bg-danger-soft/50'
            ]"
          >
            <div class="flex flex-col gap-0.5">
              <p class="text-[10px] font-semibold uppercase tracking-wide m-0"
                 :class="criticalStockFilter ? 'text-danger' : 'text-neutral-border'">
                {{ t('inventory.summary.critical-stock-alert') }}
              </p>
              <p class="text-xl font-bold m-0" :class="criticalStockFilter ? 'text-danger' : 'text-primary'">
                {{ criticalCount }}
              </p>
            </div>
            <div :class="[
              'w-9 h-9 rounded-full flex items-center justify-center transition-all',
              criticalStockFilter ? 'bg-danger/10' : 'bg-neutral-bg'
            ]">
              <i class="pi pi-exclamation-triangle text-sm"
                 :class="criticalStockFilter ? 'text-danger' : 'text-neutral-border'"></i>
            </div>
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
            {{ t('inventory.filters.category') }}
          </h3>
          <div class="flex flex-col gap-1">
            <button
                @click="store.clearFilter()"
                :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-150',
                !selectedCategory ? 'bg-primary text-neutral-bg' : 'text-primary hover:bg-neutral-bg'
              ]"
            >
              <i class="pi pi-list text-[11px]"></i>
              Todas las categorías
            </button>
            <button
                v-for="category in categoryNames"
                :key="category"
                @click="store.filterByCategory(category)"
                :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-150',
                selectedCategory === category ? 'bg-primary text-neutral-bg' : 'text-primary hover:bg-neutral-bg'
              ]"
            >
              <i class="pi pi-tag text-[11px]"></i>
              {{ category }}
            </button>
          </div>
        </div>

      </aside>
    </div>

  </section>
</template>

<style scoped>
</style>