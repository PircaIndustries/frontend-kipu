<script setup>
import {ref} from "vue";
import {AutoComplete as PvAutocomplete} from "primevue";

const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

const model = defineModel()
const suggestions = ref([])

const search = (event) => {
  const query = event.query?.trim().toLowerCase() || ''
  setTimeout(() => {
    suggestions.value = query
        ? props.options.filter(c => c.name.toLowerCase().startsWith(query))
        : [...props.options]
  }, 250)
}
</script>

<template>
  <pv-autocomplete
      v-model="model"
      optionLabel="name"
      :suggestions="suggestions"
      @complete="search"
      :placeholder="placeholder"
      :disabled="disabled"
      inputClass="w-full bg-white border border-neutral-border/30 rounded-lg px-3 py-2.5
                text-sm text-primary placeholder:text-neutral-border/70
                focus:border-accent/60 focus:shadow-sm transition-all duration-200"
      panelClass="mt-1 border border-neutral-border/20 rounded-lg shadow-lg"
  >
    <template #option="slotProps">
      <div class="flex items-center">
        <i class="pi pi-tag mr-2 text-neutral-border"></i>
        <span>{{ slotProps.option.name }}</span>
      </div>
    </template>
  </pv-autocomplete>
</template>

<style scoped>

</style>