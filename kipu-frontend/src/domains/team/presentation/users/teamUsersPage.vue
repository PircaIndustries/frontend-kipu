<!-- src/domains/team/presentation/pages/team-users/team-users-page.vue -->
<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">{{ $t('team.users.title') }}</h1>
      <Button
          @click="openInviteDialog"
          :label="$t('team.users.btn-invite')"
          icon="pi pi-user-plus"
          class="bg-[#3498DB] text-white border-none hover:bg-[#2980B9]"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-gray-500 text-sm">{{ $t('team.users.stats.active') }}</p>
            <h2 class="text-3xl font-bold text-[#3498DB]">{{ store.totalActiveUsers }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-gray-500 text-sm">{{ $t('team.users.stats.managers') }}</p>
            <h2 class="text-3xl font-bold text-[#2C3E50]">{{ store.totalManagers }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-gray-500 text-sm">{{ $t('team.users.stats.logistics') }}</p>
            <h2 class="text-3xl font-bold text-[#2C3E50]">{{ store.totalLogistics }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-gray-500 text-sm">{{ $t('team.users.stats.clients') }}</p>
            <h2 class="text-3xl font-bold text-[#2C3E50]">{{ store.totalClients }}</h2>
          </div>
        </template>
      </Card>
    </div>

    <!-- Users Table + Sidebar (Role Dictionary) -->
    <div class="flex gap-6">
      <!-- Tabla de usuarios -->
      <div class="flex-1">
        <Card>
          <template #title>
            <div class="flex justify-between items-center overflow-hidden">
              <span>{{ $t('team.users.assigned-roles.title') }}</span>
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <InputText
                    v-model="searchValue"
                    :placeholder="$t('team.users.assigned-roles.input-placeholder')"
                    class="pl-10! w-60!"
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
                    <Avatar :label="getInitials(data.fullName)" class="bg-[#3498DB]/10 text-[#3498DB]" size="large" />
                    <span class="text-[#212529]">{{ data.fullName }}</span>
                    <span v-if="isCurrentUser(data)" class="text-xs text-gray-400 ml-1">
                      ({{ $t('team.users.assigned-roles.user-profile-you') }})
                    </span>
                  </div>
                </template>
              </Column>

              <Column field="email" :header="$t('team.users.assigned-roles.email-tab')">
                <template #body="{ data }">
                  <span class="text-[#212529]">{{ data.email }}</span>
                </template>
              </Column>

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
                  />
                </template>
              </Column>
            </DataTable>

            <div class="text-right text-sm text-gray-400 mt-4">
              {{ store.filteredUsers.length }} / {{ store.allUsers.length }} {{ $t('team.users.assigned-roles.user-count') }}
            </div>
          </template>
        </Card>
      </div>

      <!-- Sidebar: Diccionario de Roles -->
      <div class="w-80 flex flex-col gap-4">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-book text-[#2C3E50]"></i>
              <span class="text-[#212529] font-semibold">{{ $t('team.users.role-dictionary.title') }}</span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <!-- Administrador -->
              <div>
                <h3 class="text-sm font-bold text-[#2C3E50]">{{ $t('team.users.role-dictionary.administrator') }}</h3>
                <p class="text-xs text-[#212529] mt-1 leading-relaxed">
                  {{ $t('team.users.role-dictionary.administrator-description') }}
                </p>
              </div>
              <!-- Gestor Operativo -->
              <div>
                <h3 class="text-sm font-bold text-[#2C3E50]">{{ $t('team.users.role-dictionary.manager') }}</h3>
                <p class="text-xs text-[#212529] mt-1 leading-relaxed">
                  {{ $t('team.users.role-dictionary.manager-description') }}
                </p>
              </div>
              <!-- Logística -->
              <div>
                <h3 class="text-sm font-bold text-[#2C3E50]">{{ $t('team.users.role-dictionary.logistics') }}</h3>
                <p class="text-xs text-[#212529] mt-1 leading-relaxed">
                  {{ $t('team.users.role-dictionary.logistics-description') }}
                </p>
              </div>
              <!-- Cliente (destacado) -->
              <div class="bg-[#F8F9FA] p-3 rounded-md border border-[#B0BEC5]">
                <h3 class="text-sm font-bold text-[#2C3E50]">{{ $t('team.users.role-dictionary.client') }}</h3>
                <p class="text-xs text-[#212529] mt-1 leading-relaxed">
                  {{ $t('team.users.role-dictionary.client-description-1') }}
                  <span class="font-bold">{{ $t('team.users.role-dictionary.client-description-bold') }}</span>
                  {{ $t('team.users.role-dictionary.client-description-2') }}
                </p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Invite Dialog (sin cambios) -->
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
              class="bg-[#3498DB] text-white border-none hover:bg-[#2980B9]"
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
  // Usar traducción desde el store o fallback
  return role
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
  await store.fetchUsers()
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