<script setup>
import {onMounted, computed, ref} from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import InventoryStore from "@/domains/logistics/application/inventory.store.js";
import InventoryList from "@/domains/logistics/presentation/components/materials/inventory-list.vue";
import AutocompleteComponent from "@/shared/presentation/components/autocompleteComponent.vue";
import SummaryComponent from "@/shared/presentation/components/summaryComponent.vue";

 const { t } = useI18n()
  const inventoryStore = InventoryStore()
  const {
    filteredInventory,
    criticalCount,
    criticalStockFilter,
    categories,
    selectedInventoryId,
    selectedCategory,
    inventoryView,
  } = storeToRefs(inventoryStore)

  const materialsCount = computed(() => filteredInventory.value.length)
  const categoriesList = computed(() => categories.value)

  const inventoryIdOptions = computed(() =>
      inventoryView.value.map(item => ({
        id: item.id,
        name: `${item.id} - ${item.materialName}`
      }))
  )
  const selectedInventoryModel = computed({
    get: () => {
      if (!selectedInventoryId.value) return null
      return inventoryIdOptions.value.find(opt => opt.id === selectedInventoryId.value) ?? null
    },
    set: (inv) => inventoryStore.filterById(inv?.id ?? '')
  })

  const selectedCategoryModel = computed({
    get: () => categoriesList.value.find(c => c.name === selectedCategory.value) ?? null,
    set: (cat) => inventoryStore.filterByCategory(cat?.name ?? '')
  })

  onMounted(() => {
    inventoryStore.fetchCategories()
    inventoryStore.fetchMaterials()
    inventoryStore.fetchInventory()
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
        <autocomplete-component
            v-model="selectedInventoryModel"
            :options="inventoryIdOptions"
            :placeholder="t('inventory.search.placeholder')"
        />
        <InventoryList :inventory-materials="filteredInventory" />
        <div v-if="filteredInventory.length === 0" class="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div class="w-14 h-14 rounded-full bg-neutral-bg flex items-center justify-center">
            <i class="pi pi-inbox text-2xl text-neutral-border"></i>
          </div>
          <p class="text-sm font-medium text-primary m-0">{{ t('inventory.empty.title') }}</p>
          <p class="text-xs text-neutral-border m-0">{{ t('inventory.empty.description') }}</p>
        </div>
      </div>

      <aside class="w-60 flex flex-col gap-6 shrink-0">
        <div class="flex flex-col gap-2">
          <SummaryComponent
              :label="t('inventory.summary.registered-materials')"
              :value="materialsCount"
              icon="pi-box"
              variant="neutral"
              clickable
              @click="inventoryStore.resetAllFilters"
          />
          <SummaryComponent
              :label="t('inventory.summary.critical-stock-alert')"
              :value="criticalCount"
              icon="pi-exclamation-triangle"
              variant="danger"
              :active="criticalStockFilter"
              clickable
              @click="inventoryStore.toggleCriticalFilter()"
          />
        </div>
        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20">
            {{ t('inventory.filters.category') }}
          </h3>
          <div class="flex flex-col gap-1">
            <autocomplete-component
                v-model="selectedCategoryModel"
                :options="categoriesList"
                :placeholder="t('inventory.category.placeholder')"
            />
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
<style scoped>

</style>