<script setup>
import { ref, computed } from 'vue'
import AutoComplete from 'primevue/autocomplete'

const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  returnObject: { type: Boolean, default: true },
  invalid: { type: Boolean, default: false }
})

const model = defineModel()
const suggestions = ref([])

const internalValue = computed({
  get: () => {
    if (props.returnObject) return model.value
    return props.options.find(opt => opt.name === model.value) ?? null
  },
  set: (val) => {
    if (props.returnObject) {
      model.value = val
    } else {
      model.value = val?.name ?? null
    }
  }
})

const search = (event) => {
  const query = event.query?.trim().toLowerCase() || ''
  setTimeout(() => {
    suggestions.value = query
        ? props.options.filter(opt => opt.name.toLowerCase().startsWith(query))
        : [...props.options]
  }, 250)
}
</script>

<template>
  <AutoComplete
      v-model="internalValue"
      optionLabel="name"
      :suggestions="suggestions"
      @complete="search"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="invalid"
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
  </AutoComplete>
</template>