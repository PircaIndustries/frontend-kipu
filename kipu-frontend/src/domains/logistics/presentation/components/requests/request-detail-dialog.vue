<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  request: { type: Object, required: true },
  visible: { type: Boolean, default: false },
  canApprove: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'close', 'approve', 'reject'])

const { t } = useI18n()

const isPending = computed(() => props.request?.requestStatus === 'Pending')

const remainingDays = computed(() => {
  if (!props.request?.deadline) return 0
  const diff = new Date(props.request.deadline).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const firstItem = computed(() => props.request?.items?.[0] || {})

const totalAmount = computed(() => {
  if (!props.request?.items) return 0
  return props.request.items.reduce((sum, item) =>
    sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0)
})

const isOverBudget = computed(() => {
  return isPending.value && props.request.budgetStatus === false
})

const statusLabel = computed(() => t(`request.card.status.${props.request?.requestStatus?.toLowerCase()}`))

const priorityStyle = computed(() => {
  const p = props.request?.requestPriority
  return {
    'bg-danger text-danger-soft border-danger': p === 'Critical',
    'bg-warning text-neutral-bg border-warning': p === 'High',
    'bg-neutral-border text-primary border-neutral-border': p === 'Medium' || p === 'Low'
  }
})

function close() {
  emit('update:visible', false)
  emit('close')
}
function handleApprove() { emit('approve', props.request); close() }
function handleReject() { emit('reject', props.request); close() }
</script>

<template>
  <pv-dialog v-if="request" :visible="visible" @update:visible="(val) => emit('update:visible', val)" modal :header="'#' + request.id" :style="{ width: '700px' }">
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" :class="{
            'bg-success-soft text-success border-success': request.requestStatus === 'Accepted',
            'bg-warning-soft text-warning border-warning': request.requestStatus === 'Pending',
            'bg-danger-soft text-danger border-danger': request.requestStatus === 'Refused'
          }">
            {{ statusLabel }}
          </span>
          <span class="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border font-bold" :class="priorityStyle">
            {{ t(`request.create.priority.${request.requestPriority?.toLowerCase()}`) }}
          </span>
        </div>
      </div>

      <div v-if="remainingDays <= 3 && remainingDays > 0" class="flex items-center gap-2 bg-warning-soft text-warning px-3 py-1.5 rounded-lg border border-warning w-fit">
        <i class="pi pi-clock text-warning"></i>
        <span class="text-xs font-black italic">{{ t('request.detail.remaining-days', { days: remainingDays }) }}</span>
      </div>

      <section class="flex flex-col gap-4">
        <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest border-b pb-2">{{ t('request.detail.section.material-info') }}</h3>
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
              <span class="text-lg font-black text-primary">{{ firstItem.quantity }}</span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="totalAmount > 0" class="p-4 rounded-xl border" :class="{
        'bg-success-soft/5 border-success/30': !isOverBudget,
        'bg-danger-soft/5 border-danger/30': isOverBudget
      }">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black text-neutral-border uppercase tracking-widest">
            {{ t('request.create.budget-verification.title') }}
          </span>
          <span
            v-if="isPending && request.budgetLineId"
            class="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border"
            :class="{
              'bg-success-soft text-success border-success': !isOverBudget,
              'bg-danger-soft text-danger border-danger': isOverBudget
            }"
          >
            {{ isOverBudget ? t('request.filters.exceed-budget') : t('request.filters.within-budget') }}
          </span>
        </div>
        <div class="mt-3 flex items-center gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] text-neutral-border uppercase tracking-wider">{{ t('request.card.fields.budget-line') }}</span>
            <span class="text-sm font-bold text-primary">{{ request.budgetLineName || (request.budgetLineId ? `#${request.budgetLineId}` : '-') }}</span>
          </div>
          <div class="flex flex-col ml-auto">
            <span class="text-[9px] text-neutral-border uppercase tracking-wider text-right">{{ t('request.create.fields.quantity') }}</span>
            <span class="text-lg font-black" :class="isOverBudget ? 'text-danger' : 'text-accent'">
              S/ {{ totalAmount.toFixed(2) }}
            </span>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h3 class="text-[10px] font-black text-neutral-border uppercase tracking-widest border-b pb-2">{{ t('request.detail.section.logistics') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <span class="text-base font-bold text-primary">{{ request.budgetLineName || (request.budgetLineId ? `#${request.budgetLineId}` : '-') }}</span>
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
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <template v-if="isPending && canApprove">
          <pv-button :label="t('request.detail.btn-reject')" severity="danger" outlined class="w-32" @click="handleReject" />
          <pv-button :label="t('request.detail.btn-approve')" severity="success" class="w-32" :disabled="isOverBudget" @click="handleApprove" />
        </template>
        <pv-button :label="t('request.detail.btn-close')" class="w-32" severity="secondary" @click="close" />
      </div>
      <div v-if="isOverBudget && canApprove" class="w-full mt-2 text-xs text-danger italic text-right">
        {{ t('request.filters.exceed-budget') }} — {{ t('request.detail.cannot-approve-budget') }}
      </div>
    </template>
  </pv-dialog>
</template>
