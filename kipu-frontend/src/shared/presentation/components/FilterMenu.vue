<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  items: {
    type: Array,
    required: true,
    validator: (v) => v.every(item => item.key && item.label)
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-2">
    <h3
        v-if="title"
        class="text-[10px] font-black text-neutral-border uppercase tracking-widest m-0 pb-2 border-b border-neutral-border/20"
    >
      {{ title }}
    </h3>
    <ul class="flex flex-col gap-1">
      <li
          v-for="item in items"
          :key="item.key"
          :class="[
          'px-3 py-2 border border-neutral-border/20 rounded-lg text-sm font-medium cursor-pointer transition-all',
          modelValue === item.key
            ? 'bg-primary text-white border-primary'
            : 'text-primary hover:bg-neutral-bg hover:border-primary'
        ]"
          @click="emit('update:modelValue', item.key)"
      >
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>