<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" :header="$t('signatures.dialog.add-document-title')" :modal="true" :closable="false" class="w-[600px]">
    <form @submit.prevent="onConfirm" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-text-main uppercase tracking-wider">{{ $t('signatures.dialog.document-type') }} <span class="text-danger">*</span></label>
        <InputText v-model="formData.documentType" class="border-neutral-border focus:border-accent" :class="{ 'border-danger': errors.documentType }" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-text-main uppercase tracking-wider">{{ $t('signatures.dialog.deadline') }} <span class="text-danger">*</span></label>
        <Calendar v-model="formData.deadline" dateFormat="dd/mm/yy" class="border-neutral-border focus:border-accent" :class="{ 'border-danger': errors.deadline }" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-text-main uppercase tracking-wider">{{ $t('signatures.dialog.assign-users') }} <span class="text-danger">*</span></label>
        <MultiSelect v-model="formData.selectedUsers" :options="availableUsers" optionLabel="fullName" optionValue="id" class="border-neutral-border focus:border-accent">
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-text-main">{{ slotProps.option.fullName }}</span>
            </div>
          </template>
        </MultiSelect>
      </div>

      <div class="bg-success-soft p-3 rounded-lg mt-2">
        <p class="text-sm text-success font-medium flex items-center gap-1">
          <i class="pi pi-user-edit"></i>
          Tú firmarás este documento automáticamente como: <strong>{{ creatorTeamUser?.fullName || 'Usuario Actual' }}</strong>
        </p>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="cancel" :label="$t('signatures.dialog.btn-cancel')" text class="text-text-main" />
        <Button @click="onConfirm" :label="$t('signatures.dialog.btn-create')" :disabled="!isFormValid" class="bg-accent text-white" />
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

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['update:visible', 'created'])

const documentStore = useDocumentStore()
const teamUsersStore = useTeamUserStore()

const formData = ref({ documentType: '', deadline: null, selectedUsers: [] })
const errors = ref({ documentType: false, deadline: false })

// BUSCA TU TEAM USER REAL POR CORREO
const creatorTeamUser = computed(() => {
  const userJson = localStorage.getItem('currentUser')
  if (!userJson) return null
  const parsed = JSON.parse(userJson)
  return teamUsersStore.allUsers.find(u => u.email === parsed.email)
})

const availableUsers = computed(() => {
  const current = creatorTeamUser.value
  if (!current) return teamUsersStore.allUsers.filter(u => u.isActive)
  return teamUsersStore.allUsers.filter(u => u.isActive && u.id !== current.id)
})

const isFormValid = computed(() => formData.value.documentType && formData.value.deadline)

const onConfirm = async () => {
  const assignedUsers = []
  const current = creatorTeamUser.value

  // Aseguramos que uses TU ID DE TEAM USER
  if (current) {
    assignedUsers.push({
      id: current.id,
      fullName: current.fullName
    })
  }

  formData.value.selectedUsers.forEach(userId => {
    const user = teamUsersStore.allUsers.find(u => u.id === userId)
    assignedUsers.push({
      id: userId,
      fullName: user?.fullName || 'Usuario'
    })
  })

  try {
    const newDocument = await documentStore.createDocument({
      type: formData.value.documentType,
      deadLine: formData.value.deadline,
      assignedTo: assignedUsers
    })

    emit('created', newDocument)
    cancel()
  } catch (error) {
    console.error(error)
  }
}

const cancel = () => {
  formData.value = { documentType: '', deadline: null, selectedUsers: [] }
  emit('update:visible', false)
}

watch(() => props.visible, (newVal) => {
  if (newVal) teamUsersStore.fetchUsers()
})
</script>