<script setup>
import { computed } from 'vue'
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: String, required: true },
  variant: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'danger', 'success', 'warning', 'info'].includes(v)
  },
  active: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
const iconClass = computed(() => `pi ${props.icon}`)
function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}
const variantClasses = computed(() => {
  const map = {
    neutral: {
      border: 'border-neutral-border/30',
      bg: 'bg-white',
      text: 'text-neutral-border',
      ring: 'bg-neutral-bg',
      iconColor: 'text-neutral-border',
      valueColor: 'text-primary',
      hover: 'hover:border-neutral-border/50'
    },
    danger: {
      border: 'border-danger/30',
      bg: 'bg-white',
      text: 'text-danger',
      ring: 'bg-danger/10',
      iconColor: 'text-danger',
      valueColor: 'text-danger',
      hover: 'hover:border-danger/50'
    },
    success: {
      border: 'border-success/30',
      bg: 'bg-white',
      text: 'text-success',
      ring: 'bg-success/10',
      iconColor: 'text-success',
      valueColor: 'text-success',
      hover: 'hover:border-success/50'
    },
    warning: {
      border: 'border-warning/30',
      bg: 'bg-white',
      text: 'text-warning',
      ring: 'bg-warning/10',
      iconColor: 'text-warning',
      valueColor: 'text-warning',
      hover: 'hover:border-warning/50'
    },
    info: {
      border: 'border-info/30',
      bg: 'bg-white',
      text: 'text-info',
      ring: 'bg-info/10',
      iconColor: 'text-info',
      valueColor: 'text-info',
      hover: 'hover:border-info/50'
    }
  }
  return map[props.variant] || map.neutral
})
const activeOverride = computed(() => {
  if (!props.active) return {}
  const activeMap = {
    neutral: {
      border: 'border-neutral-border/50',
      bg: 'bg-neutral-bg',
      ring: 'bg-neutral-border/20',
      iconColor: 'text-primary',
      valueColor: 'text-primary',
      text: 'text-primary'
    },
    danger: {
      border: 'border-danger/60',
      bg: 'bg-danger-soft',
      ring: 'bg-danger/20',
    },
    success: {
      border: 'border-success/60',
      bg: 'bg-success-soft',
      ring: 'bg-success/20',
    },
    warning: {
      border: 'border-warning/60',
      bg: 'bg-warning-soft',
      ring: 'bg-warning/20',
    },
    info: {
      border: 'border-info/60',
      bg: 'bg-info-soft',
      ring: 'bg-info/20',
    }
  }
  return activeMap[props.variant] || {}
})
const classes = computed(() => {
  const v = variantClasses.value
  const ov = activeOverride.value
  return {
    card: [
      'flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200',
      props.clickable ? 'cursor-pointer select-none' : '',
      ov.border || v.border,
      ov.bg || v.bg,
      v.hover
    ],
    label: [
      'text-[10px] font-semibold uppercase tracking-wide m-0',
      ov.text || v.text
    ],
    value: [
      'text-xl font-bold m-0',
      ov.valueColor || v.valueColor
    ],
    ring: [
      'w-9 h-9 rounded-full flex items-center justify-center transition-all',
      ov.ring || v.ring
    ],
    icon: [
      iconClass.value,
      'text-sm',
      ov.iconColor || v.iconColor
    ]
  }
})
</script>

<template>
  <div :class="classes.card" @click="handleClick">
    <div class="flex flex-col gap-0.5">
      <p :class="classes.label">{{ label }}</p>
      <p :class="classes.value">{{ value }}</p>
    </div>
    <div :class="classes.ring">
      <i :class="classes.icon"></i>
    </div>
  </div>
</template>