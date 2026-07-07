<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CardComponent from "@/shared/presentation/components/cardComponent.vue"

const { t } = useI18n()

const props = defineProps({
  request: {
    type: Object,
    required: true
  },
  currentUserId: { type: [Number, String], default: null }
})

const emit = defineEmits(['modify', 'detail'])

const isOwner = computed(() =>
  String(props.currentUserId) === String(props.request?.requestedBy)
)

const remainingDays = computed(() => {
  const diff = new Date(props.request.deadline).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const remainingDaysText = computed(() => {
  if (remainingDays.value <= 0) return t('request.card.fields.time-exceeded')
  return t('request.card.fields.in-days', { days: remainingDays.value })
})

const firstItem = computed(() => props.request.items[0] ?? {})

const isPending = computed(() => props.request?.requestStatus === 'Pending')

const budgetBadge = computed(() => {
  if (!isPending.value || props.request.budgetStatus === null) return null
  return props.request.budgetStatus
    ? { label: t('request.filters.within-budget'), severity: 'success' }
    : { label: t('request.filters.exceed-budget'), severity: 'danger' }
})

const budgetLineDisplay = computed(() => {
  if (!props.request.budgetLineId) return t('request.card.fields.no-budget')
  return props.request.budgetLineName || `#${props.request.budgetLineId}`
})

const requestFields = computed(() => [
  {
    label: t('request.card.fields.material'),
    value: firstItem.value.materialName ?? '---'
  },
  {
    label: t('request.card.fields.budget-line'),
    value: budgetLineDisplay.value
  },
  {
    label: t('request.card.fields.required-date'),
    value: new Date(props.request.deadline).toLocaleDateString(),
    subtext: remainingDaysText.value
  }
])
</script>

<template>
  <card-component
      :id="request.id"
      :badge-text="request.requestStatus"
      :badge-severity="
      request.requestStatus === 'Accepted' ? 'success' :
      request.requestStatus === 'Refused' ? 'danger' : 'warning'
    "
      :fields="requestFields"
      :show-footer="true"
  >
    <template #content>
      <div class="border border-neutral-border rounded-lg p-4 bg-neutral-bg flex flex-col gap-2">
        <p class="font-bold text-primary">{{ t('request.card.purpose.title') }}</p>
        <p class="text-sm text-primary">{{ request.purpose }}</p>
      </div>
      <div
        v-if="budgetBadge"
        class="flex items-center justify-between mt-3 px-3 py-2 rounded-lg border"
        :class="{
          'bg-success-soft/10 border-success/30': budgetBadge.severity === 'success',
          'bg-danger-soft/10 border-danger/30': budgetBadge.severity === 'danger'
        }"
      >
        <span class="text-xs font-bold text-primary/70">S/ {{ (request.totalAmount || 0).toFixed(2) }}</span>
        <span
          class="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
          :class="{
            'bg-success-soft text-success border-success': budgetBadge.severity === 'success',
            'bg-danger-soft text-danger border-danger': budgetBadge.severity === 'danger'
          }"
        >
          {{ budgetBadge.label }}
        </span>
      </div>
    </template>
    <template #footer>
      <div class="flex items-center justify-between w-full gap-4">
        <button v-if="request.requestStatus === 'Pending' && isOwner"
            class="flex-1 bg-neutral-border/40 text-primary font-medium rounded-lg py-2 hover:brightness-95 transition"
            @click="emit('modify')"
        >
          {{ t('request.card.actions.modify') }}
        </button>
        <button
            class="flex-1 bg-accent text-white font-medium rounded-lg py-2 hover:brightness-110 transition"
            @click="emit('detail')"
        >
          {{ t('request.card.actions.view-details') }}
        </button>
      </div>
    </template>
  </card-component>
</template>
