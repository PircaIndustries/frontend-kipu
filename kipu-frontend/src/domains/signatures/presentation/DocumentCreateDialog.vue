<!-- presentation/components/DocumentCreateDialog.vue -->
<template>
  <Dialog
      v-model:visible="visible"
      :header="$t('signatures.dialog.add-document-title')"
      :modal="true"
      :closable="false"
      class="w-[600px]"
  >
    <form @submit.prevent="onConfirm" class="flex flex-col gap-4">
      <!-- Tipo de documento -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {{ $t('signatures.dialog.document-type') }}
          <span class="text-red-500">*</span>
        </label>
        <InputText
            v-model="formData.documentType"
            :placeholder="$t('signatures.dialog.type-placeholder')"
            class="w-full"
            :class="{ 'border-red-500': errors.documentType }"
        />
        <p v-if="errors.documentType" class="text-xs text-red-500 mt-1">
          {{ $t('signatures.dialog.validation.type-required') }}
        </p>
      </div>

      <!-- Fecha límite -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {{ $t('signatures.dialog.deadline') }}
          <span class="text-red-500">*</span>
        </label>
        <Calendar
            v-model="formData.deadline"
            dateFormat="dd/mm/yy"
            class="w-full"
            :class="{ 'border-red-500': errors.deadline }"
        />
        <p v-if="errors.deadline" class="text-xs text-red-500 mt-1">
          {{ $t('signatures.dialog.validation.deadline-required') }}
        </p>
      </div>

      <!-- Selector de usuarios -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {{ $t('signatures.dialog.assign-users') }}
          <span class="text-red-500">*</span>
        </label>
        <MultiSelect
            v-model="formData.selectedUsers"
            :options="availableUsers"
            optionLabel="fullName"
            optionValue="id"
            :placeholder="$t('signatures.dialog.users-placeholder')"
            class="w-full"
            :class="{ 'border-red-500': errors.selectedUsers }"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold text-xs">
                {{ getInitials(slotProps.option.fullName) }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ slotProps.option.fullName }}</span>
                <span class="text-xs text-gray-500">{{ slotProps.option.email }}</span>
              </div>
            </div>
          </template>
        </MultiSelect>
        <p v-if="errors.selectedUsers" class="text-xs text-red-500 mt-1">
          {{ $t('signatures.dialog.validation.users-required') }}
        </p>
      </div>

      <!-- Dropzone -->
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {{ $t('signatures.dialog.attach-document') }}
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/30 transition-all duration-200">
          <i class="pi pi-cloud-upload text-4xl text-gray-400"></i>
          <div>
            <p class="text-sm font-semibold text-gray-700">{{ $t('signatures.dialog.dropzone') }}</p>
            <p class="text-xs text-gray-500">{{ $t('signatures.dialog.dropzone-hint') }}</p>
          </div>
        </div>
      </div>

      <!-- Resumen -->
      <div v-if="formData.selectedUsers.length > 0" class="bg-green-50 p-3 rounded-lg mt-2">
        <p class="text-sm text-green-700">
          {{ $t('signatures.dialog.selected-count') }}: {{ formData.selectedUsers.length }}
        </p>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="cancel" :label="$t('signatures.dialog.btn-cancel')" text />
        <Button
            @click="onConfirm"
            :label="$t('signatures.dialog.btn-create')"
            :disabled="!isFormValid"
            class="bg-pink-500 text-white border-none"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useTeamUsersStore } from '@/stores/teamUsersStore'
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
const teamUsersStore = useTeamUsersStore()

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

const availableUsers = computed(() => teamUsersStore.teamUsers.filter(u => u.isActive))

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

const onConfirm = () => {
  if (!validateForm()) return

  const assignedUsers = formData.value.selectedUsers.map(userId => {
    const user = teamUsersStore.teamUsers.find(u => u.id === userId)
    return {
      id: userId,
      fullName: user?.fullName || 'Usuario',
      signedAt: undefined
    }
  })

  const newDocument = documentStore.createDocument({
    type: formData.value.documentType,
    deadLine: formData.value.deadline,
    assignedTo: assignedUsers
  })

  emit('created', newDocument)
  resetForm()
  emit('update:visible', false)
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
  if (newVal && teamUsersStore.teamUsers.length === 0) {
    teamUsersStore.fetchUsers()
  }
  if (!newVal) {
    resetForm()
  }
})
</script>