<script setup>
import { ref } from 'vue'
import Select from 'primevue/select'

const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  optionLabel: { type: String, default: 'name' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  addLabel: { type: String, default: 'Añadir' },
  addPlaceholder: { type: String, default: 'Nuevo nombre...' },
})

const emit = defineEmits(['add'])
const model = defineModel()

const adding = ref(false)
const newName = ref('')

function startAdd() {
  newName.value = ''
  adding.value = true
}

function confirmAdd() {
  const name = newName.value.trim()
  if (name) emit('add', name)
  cancelAdd()
}

function cancelAdd() {
  newName.value = ''
  adding.value = false
}
</script>

<template>
  <Select
    v-model="model"
    :options="options"
    :optionLabel="optionLabel"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    class="w-full"
    :pt="{
      root: { class: 'w-full' },
      overlay: { class: 'mt-1 border border-neutral-border/20 rounded-lg shadow-lg' },
    }"
  >
    <template #dropdownicon>
      <i class="pi pi-chevron-down text-neutral-border text-xs" />
    </template>
    <template #option="slotProps">
      <div class="flex items-center gap-2 px-1 py-1">
        <i class="pi pi-tag text-neutral-border text-xs" />
        <span class="text-sm">{{ slotProps.option[optionLabel] }}</span>
      </div>
    </template>
    <template #footer>
      <div v-if="!adding" class="px-3 py-2 border-t border-neutral-border/10">
        <button
          type="button"
          class="w-full flex items-center gap-2 text-xs text-accent font-medium hover:bg-accent/5 rounded px-2 py-1.5 transition-colors"
          @click="startAdd"
        >
          <i class="pi pi-plus text-xs" />
          {{ addLabel }}
        </button>
      </div>
      <div v-else class="px-3 py-2 border-t border-neutral-border/10 flex items-center gap-2">
        <input
          v-model="newName"
          :placeholder="addPlaceholder"
          class="flex-1 border border-neutral-border/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
          @keyup.enter="confirmAdd"
          @keyup.escape="cancelAdd"
        />
        <button type="button" class="text-accent hover:text-accent/80 p-1" @click="confirmAdd" :disabled="!newName.trim()">
          <i class="pi pi-check text-xs" />
        </button>
        <button type="button" class="text-neutral-border hover:text-primary p-1" @click="cancelAdd">
          <i class="pi pi-times text-xs" />
        </button>
      </div>
    </template>
  </Select>
</template>
