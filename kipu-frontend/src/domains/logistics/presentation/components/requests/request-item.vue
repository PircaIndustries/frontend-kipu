<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CardComponent from "@/shared/presentation/components/cardComponent.vue"

const { t } = useI18n()

const props = defineProps({
  request: {
    type: Object,
    required: true
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

const firstItem = computed(() => props.request.items[0] ?? {})

const requestFields = computed(() => [
  {
    label: t('request.card.fields.material'),
    value: firstItem.value.materialName ?? '---'
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
    </template>
    <template #footer>
      <div class="flex items-center justify-between w-full gap-4">
        <button v-if="request.requestStatus === 'Pending'"
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
