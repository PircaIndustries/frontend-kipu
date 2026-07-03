<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import useMachineryStore from '@/domains/logistics/application/machinery.store.js'

const { t } = useI18n()
const toast = useToast()
const machineryStore = useMachineryStore()

const emit = defineEmits(['saved', 'close'])

const visible = ref(true)
const saving = ref(false)

const form = reactive({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    acquisitionDate: null
})

const fieldErrors = reactive({
    name: '',
    brand: '',
    model: '',
    serialNumber: ''
})

function validate() {
    let valid = true
    fieldErrors.name = ''
    fieldErrors.brand = ''
    fieldErrors.model = ''
    fieldErrors.serialNumber = ''

    if (!form.name.trim()) {
        fieldErrors.name = t('machinery.catalog.errors.name-required')
        valid = false
    }
    if (!form.brand.trim()) {
        fieldErrors.brand = t('machinery.catalog.errors.brand-required')
        valid = false
    }
    if (!form.model.trim()) {
        fieldErrors.model = t('machinery.catalog.errors.model-required')
        valid = false
    }
    if (!form.serialNumber.trim()) {
        fieldErrors.serialNumber = t('machinery.catalog.errors.serial-number-required')
        valid = false
    }
    return valid
}

function close() {
    visible.value = false
    emit('close')
}

function save() {
    if (!validate()) return
    saving.value = true
    const payload = {
        ...form,
        acquisitionDate: form.acquisitionDate instanceof Date
            ? form.acquisitionDate.toISOString().slice(0, 10)
            : form.acquisitionDate || null
    }
    machineryStore.addCatalogItem(payload, (newItem) => {
        toast.add({
            severity: 'success',
            summary: t('machinery.catalog.success.summary'),
            detail: t('machinery.catalog.success.detail'),
            life: 3000
        })
        emit('saved', newItem)
        close()
    }, () => {
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: t('machinery.catalog.errors.save-failed'),
            life: 4000
        })
        saving.value = false
    })
}
</script>

<template>
    <pv-dialog
        v-model:visible="visible"
        modal
        :style="{ width: '500px' }"
        :header="t('machinery.catalog.dialog-title')"
        @hide="close"
    >
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
                    {{ t('machinery.catalog.fields.name') }} *
                </span>
                <pv-inputtext v-model="form.name" :placeholder="t('machinery.catalog.placeholders.name')" :invalid="!!fieldErrors.name" fluid />
                <small v-if="fieldErrors.name" class="text-red-500 text-xs">{{ fieldErrors.name }}</small>
            </div>
            <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
                    {{ t('machinery.catalog.fields.brand') }} *
                </span>
                <pv-inputtext v-model="form.brand" :placeholder="t('machinery.catalog.placeholders.brand')" :invalid="!!fieldErrors.brand" fluid />
                <small v-if="fieldErrors.brand" class="text-red-500 text-xs">{{ fieldErrors.brand }}</small>
            </div>
            <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
                    {{ t('machinery.catalog.fields.model') }} *
                </span>
                <pv-inputtext v-model="form.model" :placeholder="t('machinery.catalog.placeholders.model')" :invalid="!!fieldErrors.model" fluid />
                <small v-if="fieldErrors.model" class="text-red-500 text-xs">{{ fieldErrors.model }}</small>
            </div>
            <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
                    {{ t('machinery.catalog.fields.serial-number') }} *
                </span>
                <pv-inputtext v-model="form.serialNumber" :placeholder="t('machinery.catalog.placeholders.serial-number')" :invalid="!!fieldErrors.serialNumber" fluid />
                <small v-if="fieldErrors.serialNumber" class="text-red-500 text-xs">{{ fieldErrors.serialNumber }}</small>
            </div>
            <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-primary/80 uppercase tracking-wider">
                    {{ t('machinery.catalog.fields.acquisition-date') }}
                </span>
                <pv-datepicker
                    v-model="form.acquisitionDate"
                    dateFormat="yy-mm-dd"
                    :placeholder="t('machinery.catalog.placeholders.acquisition-date')"
                    class="w-full"
                    showButtonBar
                    :manualInput="false"
                />
            </div>
        </div>

        <template #footer>
            <pv-button
                :label="t('machinery.catalog.actions.cancel')"
                severity="secondary"
                variant="outlined"
                :disabled="saving"
                @click="close"
            />
            <pv-button
                :label="t('machinery.catalog.actions.submit')"
                icon="pi pi-save"
                severity="info"
                :disabled="saving"
                @click="save"
            />
        </template>
    </pv-dialog>
</template>
