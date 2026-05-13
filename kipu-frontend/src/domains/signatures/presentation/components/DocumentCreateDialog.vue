<!-- src/domains/signatures/presentation/components/DocumentCreateDialog.vue -->
<template>
  <Dialog
      :visible="visible"
      @update:visible="emit('update:visible', $event)"
      :header="$t('signatures.dialog.add-document-title')"
      :modal="true"
      :closable="false"
      class="w-[600px]"
  >
    <form @submit.prevent="onConfirm" class="flex flex-col gap-4">
      <!-- Tipo de documento -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-text-main uppercase tracking-wider">
          {{ $t('signatures.dialog.document-type') }}
          <span class="text-danger">*</span>
        </label>
        <InputText
            v-model="formData.documentType"
            :placeholder="$t('signatures.dialog.type-placeholder')"
            class="border-neutral-border focus:border-accent"
            :class="{ 'border-danger': errors.documentType }"
        />
        <p v-if="errors.documentType" class="text-xs text-danger mt-1">
          {{ $t('signatures.dialog.validation.type-required') }}
        </p>
      </div>

      <!-- Fecha límite -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-text-main uppercase tracking-wider">
          {{ $t('signatures.dialog.deadline') }}
          <span class="text-danger">*</span>
        </label>
        <Calendar
            v-model="formData.deadline"
            dateFormat="dd/mm/yy"
            class="border-neutral-border focus:border-accent"
            :class="{ 'border-danger': errors.deadline }"
        />
        <p v-if="errors.deadline" class="text-xs text-danger mt-1">
          {{ $t('signatures.dialog.validation.deadline-required') }}
        </p>
      </div>

      <!-- Selector de usuarios -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-text-main uppercase tracking-wider">
          {{ $t('signatures.dialog.assign-users') }}
          <span class="text-danger">*</span>
        </label>
        <MultiSelect
            v-model="formData.selectedUsers"
            :options="availableUsers"
            optionLabel="fullName"
            optionValue="id"
            :placeholder="$t('signatures.dialog.users-placeholder')"
            class="border-neutral-border focus:border-accent"
            :class="{ 'border-danger': errors.selectedUsers }"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-xs">
                {{ getInitials(slotProps.option.fullName) }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-text-main">{{ slotProps.option.fullName }}</span>
                <span class="text-xs text-neutral-border">{{ slotProps.option.email }}</span>
              </div>
            </div>
          </template>
        </MultiSelect>
        <p v-if="errors.selectedUsers" class="text-xs text-danger mt-1">
          {{ $t('signatures.dialog.validation.users-required') }}
        </p>
      </div>

      <!-- Dropzone (solo UI) -->
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-xs font-bold text-text-main uppercase tracking-wider">
          {{ $t('signatures.dialog.attach-document') }}
        </label>
        <div class="border-2 border-dashed border-neutral-border rounded-lg p-8 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all duration-200">
          <i class="pi pi-cloud-upload text-4xl text-neutral-border"></i>
          <div>
            <p class="text-sm font-semibold text-text-main">{{ $t('signatures.dialog.dropzone') }}</p>
            <p class="text-xs text-neutral-border">{{ $t('signatures.dialog.dropzone-hint') }}</p>
          </div>
        </div>
      </div>

      <!-- Resumen -->
      <div v-if="formData.selectedUsers.length > 0" class="bg-success-soft p-3 rounded-lg mt-2">
        <p class="text-sm text-success">
          {{ $t('signatures.dialog.selected-count') }}: {{ formData.selectedUsers.length }}
        </p>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="cancel" :label="$t('signatures.dialog.btn-cancel')" text class="text-text-main hover:text-primary" />
        <Button
            @click="onConfirm"
            :label="$t('signatures.dialog.btn-create')"
            :disabled="!isFormValid"
            class="bg-accent text-white border-none hover:bg-primary"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDocumentStore } from '../../application/document.store.js'
import { useTeamUserStore } from '../../../team/application/team-user.store.js'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import MultiSelect from 'primevue/multiselect'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'created'])

const documentStore = useDocumentStore()
const teamUsersStore = useTeamUserStore()

const formData = ref({
  documentType: '',
  deadline: null,
  selectedUsers: []
})

const errors = ref({
  documentType: false,
  deadline: false,
  selectedUsers: false
})

const availableUsers = computed(() => teamUsersStore.allUsers.filter(u => u.isActive))

const isFormValid = computed(() => {
  return formData.value.documentType &&
      formData.value.deadline &&
      formData.value.selectedUsers.length > 0
})

const getInitials = (fullName) => {
  if (!fullName) return '?'
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const validateForm = () => {
  errors.value = {
    documentType: !formData.value.documentType,
    deadline: !formData.value.deadline,
    selectedUsers: formData.value.selectedUsers.length === 0
  }
  return !Object.values(errors.value).some(Boolean)
}

const onConfirm = async () => {
  if (!validateForm()) return

  const assignedUsers = formData.value.selectedUsers.map(userId => {
    const user = teamUsersStore.allUsers.find(u => u.id === userId)
    return {
      id: userId,
      fullName: user?.fullName || 'Usuario',
      signedAt: undefined
    }
  })

  try {
    const newDocument = await documentStore.createDocument({
      type: formData.value.documentType,
      deadLine: formData.value.deadline,
      assignedTo: assignedUsers
    })

    emit('created', newDocument)
    resetForm()
    emit('update:visible', false)
  } catch (error) {
    console.error('Error creating document:', error)
    alert('Error al crear el documento')
  }
}

const cancel = () => {
  resetForm()
  emit('update:visible', false)
}

const resetForm = () => {
  formData.value = {
    documentType: '',
    deadline: null,
    selectedUsers: []
  }
  errors.value = {
    documentType: false,
    deadline: false,
    selectedUsers: false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal && teamUsersStore.allUsers.length === 0) {
    teamUsersStore.fetchUsers()
  }
  if (!newVal) {
    resetForm()
  }
})
</script>