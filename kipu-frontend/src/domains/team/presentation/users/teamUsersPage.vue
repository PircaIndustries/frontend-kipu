<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">{{ $t('team.users.title') }}</h1>
      <Button
          @click="openInviteDialog"
          :label="$t('team.users.btn-invite')"
          icon="pi pi-user-plus"
          class="bg-pink-500 text-white border-none hover:bg-pink-600"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-gray-500 text-sm">{{ $t('team.users.stats.active') }}</p>
            <h2 class="text-3xl font-bold text-pink-600">{{ store.totalActiveUsers }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-gray-500 text-sm">{{ $t('team.users.stats.managers') }}</p>
            <h2 class="text-3xl font-bold text-blue-600">{{ store.totalManagers }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-gray-500 text-sm">{{ $t('team.users.stats.logistics') }}</p>
            <h2 class="text-3xl font-bold text-purple-600">{{ store.totalLogistics }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-gray-500 text-sm">{{ $t('team.users.stats.clients') }}</p>
            <h2 class="text-3xl font-bold text-gray-600">{{ store.totalClients }}</h2>
          </div>
        </template>
      </Card>
    </div>

    <!-- Users Table -->
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <span>{{ $t('team.users.assigned-roles.title') }}</span>
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <InputText
                v-model="searchValue"
                :placeholder="$t('team.users.assigned-roles.input-placeholder')"
                class="pl-8 w-64"
            />
            <i
                v-if="searchValue"
                @click="clearSearch"
                class="pi pi-times absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
            ></i>
          </div>
        </div>
      </template>
      <template #content>
        <DataTable :value="store.filteredUsers" class="w-full">
          <Column field="fullName" :header="$t('team.users.assigned-roles.user-tab')">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <Avatar :label="getInitials(data.fullName)" class="bg-pink-100 text-pink-600" size="large" />
                <span>{{ data.fullName }}</span>
                <span v-if="isCurrentUser(data)" class="text-xs text-gray-400 ml-1">
                  ({{ $t('team.users.assigned-roles.user-profile-you') }})
                </span>
              </div>
            </template>
          </Column>

          <Column field="email" :header="$t('team.users.assigned-roles.email-tab')" />

          <Column field="role" :header="$t('team.users.assigned-roles.assigned-role-tab')">
            <template #body="{ data }">
              <Badge :value="formatRole(data.role)" :severity="getRoleSeverity(data.role)" />
            </template>
          </Column>

          <Column :header="$t('team.users.assigned-roles.action-tab')">
            <template #body="{ data }">
              <Button
                  v-if="data.isActive && !isCurrentUser(data)"
                  @click="toggleStatus(data)"
                  :label="$t('team.users.assigned-roles.btn-action')"
                  severity="danger"
                  text
                  size="small"
              />
              <Button
                  v-else-if="!data.isActive && !isCurrentUser(data)"
                  @click="toggleStatus(data)"
                  :label="$t('team.users.assigned-roles.btn-action-done')"
                  text
                  size="small"
                  disabled
              />
            </template>
          </Column>
        </DataTable>

        <div class="text-right text-sm text-gray-400 mt-4">
          {{ store.filteredUsers.length }} / {{ store.allUsers.length }} {{ $t('team.users.assigned-roles.user-count') }}
        </div>
      </template>
    </Card>

    <!-- Invite Dialog -->
    <Dialog
        v-model:visible="dialogVisible"
        :header="$t('team.users.send-invitation.title')"
        :modal="true"
        class="w-[550px]"
    >
      <form @submit.prevent="inviteUser" class="flex flex-col gap-4">
        <p class="text-gray-500 text-sm">{{ $t('team.users.send-invitation.credentials') }}</p>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">{{ $t('team.users.send-invitation.email') }}</label>
          <InputText
              v-model="inviteForm.email"
              type="email"
              :placeholder="$t('team.users.send-invitation.email-placeholder')"
              required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold">{{ $t('team.users.send-invitation.name') }}</label>
            <InputText
                v-model="inviteForm.firstName"
                :placeholder="$t('team.users.send-invitation.name-placeholder')"
                required
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold">{{ $t('team.users.send-invitation.lastname') }}</label>
            <InputText
                v-model="inviteForm.lastName"
                :placeholder="$t('team.users.send-invitation.lastname-placeholder')"
                required
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">{{ $t('team.users.send-invitation.rol') }}</label>
          <Select
              v-model="inviteForm.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar rol"
              required
          />
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeDialog" :label="$t('team.users.send-invitation.btn-cancel')" text />
          <Button
              @click="inviteUser"
              :label="$t('team.users.send-invitation.btn-invite')"
              :disabled="!isInviteFormValid"
              class="bg-pink-500 text-white border-none"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTeamUserStore } from '../../application/team-user.store.js'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'

const store = useTeamUserStore()

// Local state
const searchValue = ref('')
const dialogVisible = ref(false)
const inviteForm = ref({
  email: '',
  firstName: '',
  lastName: '',
  role: ''
})

const roleOptions = [
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Gestor', value: 'Gestor' },
  { label: 'Logística', value: 'Logistica' },
  { label: 'Cliente', value: 'Cliente' }
]

const isInviteFormValid = computed(() => {
  return inviteForm.value.email &&
      inviteForm.value.firstName &&
      inviteForm.value.lastName &&
      inviteForm.value.role
})

// Methods
const getInitials = (fullName) => {
  if (!fullName) return '?'
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const formatRole = (role) => {
  const key = store.getRoleTranslationKey(role)
  return store.$t ? store.$t(`team.users.role-dictionary.${key}`) : role
}

const getRoleSeverity = (role) => {
  const severityMap = {
    'Administrador': 'danger',
    'Gestor': 'warn',
    'Gestor Operativo': 'warn',
    'Logistica': 'info',
    'Cliente': 'secondary',
    'Ingeniero': 'success'
  }
  return severityMap[role] || 'secondary'
}

const isCurrentUser = (user) => {
  return store.currentUser?.id === user.id
}

const toggleStatus = async (user) => {
  await store.toggleUserStatus(user)
}

const openInviteDialog = () => {
  inviteForm.value = { email: '', firstName: '', lastName: '', role: '' }
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const inviteUser = async () => {
  if (!isInviteFormValid.value) return
  await store.inviteUser(inviteForm.value)
  closeDialog()
}

const clearSearch = () => {
  searchValue.value = ''
  store.updateSearchTerm('')
}

watch(searchValue, (newVal) => {
  store.updateSearchTerm(newVal)
})

onMounted(() => {
  store.fetchUsers()
  store.loadCurrentUser()
})
</script>