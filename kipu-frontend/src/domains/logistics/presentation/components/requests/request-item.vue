<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CardComponent from "@/shared/presentation/components/cardComponent.vue"

const { t } = useI18n()

const props = defineProps({
  request: {
    /** @type {import('vue').Prop<EnrichedRequest>} */
    type: Object,
    required: true
  },
  availableBudget: {
    type: Number,
    default: 0
  },
  totalBudget: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['modify', 'detail'])

const remainingDays = computed(() => {
  const diff = new Date(props.request.deadline).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const remainingDaysText = computed(() => {
  if (remainingDays.value <= 0) return t('request.card.fields.time-exceeded')
  return t('request.card.fields.in-days', { days: remainingDays.value })
})

const requestedAmount = computed(() => {
  return props.request.items.reduce((total, item) => {
    return total + Math.ceil(item.quantity * item.pricePerUnit)
  }, 0)
})

const isAmountValid = computed(() => {
  return props.availableBudget + requestedAmount.value <= props.totalBudget
})

const firstItem = computed(() => props.request.items[0] ?? {})

const requestFields = computed(() => [
  {
    label: t('request.card.fields.material'),
    value: firstItem.value.materialName ?? '---'
  },
  {
    label: t('request.card.fields.requester'),
    value: props.request.requestedBy
  },
  {
    label: t('request.card.fields.budget-line'),
    value: props.request.budgetLineId
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
      :badge-text="request.status"
      :badge-severity="
      request.status === 'APPROVED' ? 'success' :
      request.status === 'REFUSED' ? 'danger' : 'warning'
    "
      :fields="requestFields"
      :show-footer="true"
  >
    <template #content>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <!-- Propósito -->
        <div class="border border-neutral-border rounded-lg p-4 bg-neutral-bg flex flex-col gap-2">
          <p class="font-bold text-primary">{{ t('request.card.purpose.title') }}</p>
          <p class="text-sm text-primary">{{ request.purpose }}</p>
        </div>

        <!-- Presupuesto -->
        <div class="border border-neutral-border rounded-lg p-4 bg-neutral-bg flex flex-col gap-2">
          <p class="font-bold text-primary">{{ t('request.card.budget-verification.title') }}</p>
          <div class="flex justify-between text-sm text-primary">
            <span>{{ t('request.card.budget-verification.requested-amount') }}</span>
            <span class="font-bold">{{ requestedAmount }}</span>
          </div>
          <div class="flex justify-between text-sm text-primary">
            <span>{{ t('request.card.budget-verification.available-budget') }}</span>
            <span class="font-bold">{{ availableBudget }}</span>
          </div>
          <hr class="border-t-2 border-primary my-2 opacity-20" />
          <div class="flex justify-between items-center text-sm">
            <span class="text-primary">{{ t('request.card.budget-verification.status') }}</span>
            <span
                class="font-bold text-xs"
                :class="isAmountValid ? 'text-success' : 'text-danger'"
            >
              {{ isAmountValid ? t('request.card.status.within-budget') : t('request.card.status.out-budget') }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex items-center justify-between w-full gap-4">
        <button
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
<style scoped>

</style>