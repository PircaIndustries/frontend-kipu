<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  request: { type: Object, required: true },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'close'])

const { t } = useI18n()

const remainingDays = computed(() => {
  if (!props.request.deadline) return 0
  const diff = new Date(props.request.deadline).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const totalRequested = computed(() => {
  return props.request.totalAmount ?? 0
})

const isWithinBudget = computed(() => {
  return props.request.isWithinBudget ?? true
})

const budgetStatusLabel = computed(() => {
  return isWithinBudget.value
    ? t('request.card.status.within-budget')
    : t('request.card.status.out-budget')
})

const firstItem = computed(() => props.request.items?.[0] || {})

const statusLabel = computed(() => t(`request.card.status.${props.request.status?.toLowerCase()}`))

const priorityStyle = computed(() => {
  const p = props.request.priority
  return {
    'bg-danger text-danger-soft border-danger': p === 'CRITICAL',
    'bg-warning text-neutral-bg border-warning': p === 'HIGH',
    'bg-neutral-border text-primary border-neutral-border': p === 'MEDIUM' || p === 'LOW'
  }
})

function close() {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <pv-dialog
      :visible="visible"
      @update:visible="(val) => emit('update:visible', val)"
      modal
      :header="request ? '#' + request.id : ''"
      :style="{ width: '700px' }"
  >
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
              :class="{
              'bg-success-soft text-success border-success': request.status === 'APPROVED',
              'bg-warning-soft text-warning border-warning': request.status === 'PENDING',
              'bg-danger-soft text-danger border-danger': request.status === 'REFUSED'
            }"
          >
            {{ statusLabel }}
          </span>
          <span
              class="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border font-bold"
              :class="priorityStyle"
          >
            {{ t(`request.create.priority.${request.priority?.toLowerCase()}`) }}
          </span>
        </div>
        <span class="text-xs text-primary font-semibold flex items-center gap-1 opacity-70">
          <i class="pi pi-calendar text-sm"></i>
          {{ t('request.card.header.request-date') }} {{ request.requestDate }}
        </span>
      </div>

      <div v-if="remainingDays <= 3 && remainingDays > 0" class="flex items-center gap-2 bg-warning-soft text-warning px-3 py-1.5 rounded-lg border border-warning w-fit">
        <i class="pi pi-clock text-warning"></i>
        <span class="text-xs font-black italic">{{ t('request.detail.remaining-days', { days: remainingDays }) }}</span>
      </div>

      <section class="flex flex-col gap-4">
        <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest border-b pb-2">
          {{ t('request.detail.section.material-info') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-6 border border-neutral-border/30 rounded-xl flex items-center gap-4">
            <div class="p-3 bg-neutral-bg rounded-lg">
              <i class="pi pi-box text-accent text-2xl"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-neutral-border font-bold uppercase tracking-tighter">{{ t('request.card.fields.material') }}</span>
              <span class="text-lg font-black text-primary leading-tight">{{ firstItem.materialName || '-' }}</span>
              <span class="text-xs text-primary opacity-60">{{ firstItem.categoryName }}</span>
            </div>
          </div>
          <div class="p-6 border border-neutral-border/30 rounded-xl flex items-center gap-4">
            <div class="p-3 bg-neutral-bg rounded-lg">
              <i class="pi pi-shopping-cart text-accent text-2xl"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-neutral-border font-bold uppercase tracking-tighter">{{ t('request.create.fields.quantity') }}</span>
              <span class="text-lg font-black text-primary">{{ firstItem.quantity }} {{ firstItem.materialUnit }}</span>
              <span class="text-xs text-primary opacity-60">S/ {{ firstItem.pricePerUnit?.toFixed(2) }} {{ t('request.detail.per-unit') }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest border-b pb-2">{{ t('request.detail.section.logistics') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-neutral-border uppercase tracking-wider">{{ t('request.card.fields.requester') }}</span>
            <span class="text-base font-bold text-primary">{{ request.requestedBy }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-neutral-border uppercase tracking-wider">{{ t('request.create.fields.delivery-location') }}</span>
            <span class="text-base font-bold text-primary">{{ request.deliveryLocation || '-' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-neutral-border uppercase tracking-wider">{{ t('request.card.fields.required-date') }}</span>
            <span class="text-base font-bold text-primary">{{ new Date(request.deadline).toLocaleDateString() }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-neutral-border uppercase tracking-wider">{{ t('request.card.fields.budget-line') }}</span>
            <span class="text-base font-bold text-primary">{{ request.budgetLineId || '-' }}</span>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-6 bg-neutral-bg p-6 rounded-xl border border-neutral-border/30">
        <div class="flex flex-col gap-2">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest">{{ t('request.card.purpose.title') }}</h3>
          <p class="text-sm text-primary leading-relaxed italic">"{{ request.purpose || '-' }}"</p>
        </div>
        <div v-if="request.additionalNotes" class="flex flex-col gap-2 border-t border-neutral-border/30 pt-4">
          <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest">{{ t('request.create.fields.additional-notes') }}</h3>
          <p class="text-sm text-primary opacity-80">{{ request.additionalNotes }}</p>
        </div>
      </section>

      <section>
        <div class="bg-primary rounded-xl p-8 flex flex-row justify-between items-center">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] text-neutral-border uppercase font-black tracking-widest">{{ t('request.detail.total-investment') }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-xs text-success font-bold">S/</span>
              <span class="text-4xl font-black text-white tracking-tighter">{{ totalRequested.toFixed(2) }}</span>
            </div>
          </div>
          <div
            class="px-4 py-2 rounded-lg flex items-center justify-center border"
            :class="{
              'bg-success-soft border-success': isWithinBudget,
              'bg-danger-soft border-danger': !isWithinBudget
            }"
          >
            <span
              class="text-xs font-bold flex items-center gap-2 leading-none"
              :class="{
                'text-success': isWithinBudget,
                'text-danger': !isWithinBudget
              }"
            >
              <i
                class="text-sm"
                :class="{
                  'pi pi-check-circle': isWithinBudget,
                  'pi pi-times-circle': !isWithinBudget
                }"
              ></i>
              {{ budgetStatusLabel }}
            </span>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <pv-button
          :label="t('request.detail.btn-close')"
          class="w-40"
          severity="secondary"
          @click="close"
      />
    </template>
  </pv-dialog>
</template>
