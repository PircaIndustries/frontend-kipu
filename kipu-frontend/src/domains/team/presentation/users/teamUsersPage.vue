<template>
  <div class="p-4 md:p-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 class="text-2xl font-bold text-text-main">{{ $t('team.users.title') }}</h1>
      <div class="flex gap-3 items-center">
        <Button
          @click="refreshUsers"
          :disabled="refreshCooldown > 0"
          v-tooltip.bottom="'Actualizar'"
          class="relative bg-white! text-text-main! border border-neutral-border! hover:bg-neutral-bg! w-10 h-10 p-0 flex items-center justify-center"
        >
          <i class="pi pi-refresh" :class="{ 'pi-spin': refreshCooldown > 0 }"></i>
        </Button>
        <div class="relative">
          <Button
              @click="toggleInvitationsPanel"
              class="relative bg-white! text-text-main! border border-neutral-border! hover:bg-neutral-bg!"
              icon="pi pi-bell"
          >
            <span v-if="store.pendingInvitations.length > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ store.pendingInvitations.length }}
            </span>
          </Button>

          <div
            v-if="showInvitationsPanel"
            class="absolute right-0 top-full mt-2 z-50 bg-white border border-neutral-border rounded-lg shadow-lg min-w-80"
          >
            <div class="p-3 border-b border-neutral-border bg-neutral-bg rounded-t-lg">
              <span class="text-sm font-bold text-text-main">{{ $t('team.users.invitations.pending-title') }}</span>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div v-if="store.invitationsLoading" class="p-4 text-center text-sm text-neutral-border">
                Cargando...
              </div>
              <div v-else-if="store.pendingInvitations.length === 0" class="p-4 text-center text-sm text-neutral-border">
                {{ $t('team.users.invitations.no-pending') }}
              </div>
              <div
                v-for="inv in store.pendingInvitations"
                :key="inv.id"
                class="p-3 border-b border-neutral-border/50 hover:bg-neutral-bg/50"
              >
                <p class="text-sm text-text-main mb-2">{{ $t('team.users.invitations.invited-message', { role: extractRole(inv) }) }}</p>
                <div class="flex gap-2">
                  <Button
                    @click="acceptInvitation(inv.id)"
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    :loading="acceptingId === inv.id"
                  />
                  <Button
                    @click="rejectInvitation(inv.id)"
                    icon="pi pi-times"
                    severity="danger"
                    size="small"
                    text
                    :loading="rejectingId === inv.id"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
            v-if="isAdminUser"
            @click="openInviteDialog"
            :label="$t('team.users.btn-invite')"
            icon="pi pi-user-plus"
            class="bg-accent! text-white border-none! hover:bg-primary! w-full md:w-auto justify-center"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <Card><template #content><div class="text-center"><p class="text-neutral-border text-sm">{{ $t('team.users.stats.active') }}</p><h2 class="text-3xl font-bold text-accent">{{ store.totalActiveUsers }}</h2></div></template></Card>
      <Card><template #content><div class="text-center"><p class="text-neutral-border text-sm">{{ $t('team.users.stats.managers') }}</p><h2 class="text-3xl font-bold text-primary">{{ store.totalManagers }}</h2></div></template></Card>
      <Card><template #content><div class="text-center"><p class="text-neutral-border text-sm">{{ $t('team.users.stats.logistics') }}</p><h2 class="text-3xl font-bold text-primary">{{ store.totalLogistics }}</h2></div></template></Card>
      <Card><template #content><div class="text-center"><p class="text-neutral-border text-sm">{{ $t('team.users.stats.clients') }}</p><h2 class="text-3xl font-bold text-primary">{{ store.totalClients }}</h2></div></template></Card>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-1 w-full overflow-hidden">
        <Card>
          <template #title>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center overflow-hidden gap-4">
              <span class="text-text-main">{{ $t('team.users.assigned-roles.title') }}</span>
              <div class="relative w-full md:w-auto">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-border text-sm"></i>
                <InputText
                    v-model="searchValue"
                    :placeholder="$t('team.users.assigned-roles.input-placeholder')"
                    class="pl-10! w-full md:w-60!"
                />
                <i v-if="searchValue" @click="clearSearch" class="pi pi-times absolute right-3 top-1/2 -translate-y-1/2 text-neutral-border cursor-pointer hover:text-text-main"></i>
              </div>
            </div>
          </template>
          <template #content>
            <div class="overflow-x-auto w-full">
              <DataTable :value="sortedUsers" class="w-full">
                <Column field="fullName" :header="$t('team.users.assigned-roles.user-tab')">
                  <template #body="{ data }">
                    <div class="flex items-center gap-2">
                      <Avatar :label="getInitials(data.fullName)" class="bg-accent/10 text-accent" size="large" />
                      <span class="text-text-main">{{ data.fullName }}</span>
                      <span v-if="isCurrentUser(data)" class="text-xs text-neutral-border ml-1 font-semibold italic">({{ $t('team.users.assigned-roles.user-profile-you') }})</span>
                    </div>
                  </template>
                </Column>
                <Column field="email" :header="$t('team.users.assigned-roles.email-tab')">
                  <template #body="{ data }"><span class="text-text-main">{{ data.email }}</span></template>
                </Column>
                <Column field="role" :header="$t('team.users.assigned-roles.assigned-role-tab')">
                  <template #body="{ data }"><Badge :value="formatRole(data.role)" :severity="getRoleSeverity(data.role)" /></template>
                </Column>
                <Column :header="$t('team.users.assigned-roles.action-tab')">
                  <template #body="{ data }">
                    <div v-if="isCurrentUser(data)" class="text-neutral-border text-xs italic p-2">-</div>
                    <div v-else-if="data.isPending" class="text-warning text-xs font-semibold px-2 py-1 bg-warning/10 rounded inline-block">Pendiente</div>
                    <div v-else-if="isAdminUser" class="relative">
                      <Button icon="pi pi-ellipsis-v" text size="small" @click="toggleActionsMenu(data.id)" class="p-1" />
                      <div
                        v-if="openMenuId === data.id"
                        class="absolute right-0 z-50 mt-1 bg-white border border-neutral-border rounded-lg shadow-lg min-w-44"
                      >
                        <div class="py-1">
                          <button
                            v-if="data.isActive"
                            @click="toggleStatus(data); openMenuId = null"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-bg flex items-center gap-2"
                          >
                            <i class="pi pi-ban text-xs"></i> {{ $t('team.users.assigned-roles.btn-action') }}
                          </button>
                          <button
                            v-else
                            @click="toggleStatus(data); openMenuId = null"
                            class="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-neutral-bg flex items-center gap-2"
                          >
                            <i class="pi pi-check-circle text-xs"></i> {{ $t('team.users.assigned-roles.btn-action-done') }}
                          </button>
                          <button
                            @click="openRoleDialog(data); openMenuId = null"
                            class="w-full text-left px-4 py-2 text-sm text-text-main hover:bg-neutral-bg flex items-center gap-2"
                          >
                            <i class="pi pi-user-edit text-xs"></i> Cambiar Rol
                          </button>
                          <button
                            @click="confirmDeleteUser(data); openMenuId = null"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-bg flex items-center gap-2"
                          >
                            <i class="pi pi-trash text-xs"></i> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-neutral-border text-xs italic p-2">-</div>
                  </template>
                </Column>
              </DataTable>
            </div>
            <div class="text-right text-sm text-neutral-border mt-4">{{ sortedUsers.length }} / {{ store.allUsers.length }} {{ $t('team.users.assigned-roles.user-count') }}</div>
          </template>
        </Card>
      </div>

      <div class="w-full md:w-80 flex flex-col gap-4">
        <Card>
          <template #title><div class="flex items-center gap-2"><i class="pi pi-book text-primary"></i><span class="text-text-main font-semibold">{{ $t('team.users.role-dictionary.title') }}</span></div></template>
          <template #content>
            <div class="flex flex-col gap-4">
              <div><h3 class="text-base font-bold text-primary">{{ $t('team.users.role-dictionary.administrator') }}</h3><p class="text-sm text-text-main mt-1 leading-relaxed">{{ $t('team.users.role-dictionary.administrator-description') }}</p></div>
              <div><h3 class="text-base font-bold text-primary">{{ $t('team.users.role-dictionary.manager') }}</h3><p class="text-sm text-text-main mt-1 leading-relaxed">{{ $t('team.users.role-dictionary.manager-description') }}</p></div>
              <div><h3 class="text-base font-bold text-primary">{{ $t('team.users.role-dictionary.logistics') }}</h3><p class="text-sm text-text-main mt-1 leading-relaxed">{{ $t('team.users.role-dictionary.logistics-description') }}</p></div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <Dialog v-model:visible="roleDialogVisible" header="Cambiar Rol" :modal="true" class="w-[400px]" :style="{ borderRadius: 'var(--radius-m)' }">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-neutral-border">Selecciona el nuevo rol para <strong>{{ selectedUser?.fullName }}</strong></p>
        <Select v-model="selectedNewRole" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar rol" fluid />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="roleDialogVisible = false" label="Cancelar" text />
          <Button @click="saveRoleChange" label="Guardar" :disabled="!selectedNewRole" class="bg-accent! text-white" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteConfirmVisible" header="Eliminar Usuario" :modal="true" class="w-[400px]" :style="{ borderRadius: 'var(--radius-m)' }">
      <p class="text-sm text-neutral-border">¿Estás seguro de eliminar a <strong>{{ selectedUser?.fullName }}</strong> del proyecto?</p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="deleteConfirmVisible = false" label="Cancelar" text />
          <Button @click="executeDeleteUser" label="Eliminar" severity="danger" class="bg-red-600! text-white!" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="dialogVisible" :header="$t('team.users.send-invitation.title')" :modal="true" class="w-[550px]" :style="{ borderRadius: 'var(--radius-m)' }">
      <form @submit.prevent="inviteUser" class="flex flex-col gap-4">
        <p class="text-neutral-border text-sm">{{ $t('team.users.send-invitation.select-user') }}</p>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-text-main">{{ $t('team.users.send-invitation.user-label') }}</label>
          <Select v-model="inviteForm.selectedUser" :options="iamUsers" optionLabel="label" placeholder="Seleccionar usuario" required class="border-neutral-border">
            <template #option="slotProps"><span>{{ slotProps.option.name || slotProps.option.email }} ({{ slotProps.option.email }})</span></template>
          </Select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-text-main">{{ $t('team.users.send-invitation.rol') }}</label>
          <Select v-model="inviteForm.role" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar rol" required class="border-neutral-border" />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeDialog" :label="$t('team.users.send-invitation.btn-cancel')" text class="text-text-main! hover:text-primary!" />
          <Button @click="inviteUser" :label="$t('team.users.send-invitation.btn-invite')" :disabled="!isInviteFormValid" class="bg-accent! text-white border-none! hover:bg-primary" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTeamUserStore } from '../../application/team-user.store.js'
import { identityApi } from '../../../identity/infrastructure/identity.api.js'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'

const store = useTeamUserStore()
const toast = useToast()
const { t } = useI18n()

const searchValue = ref('')
const dialogVisible = ref(false)
const iamUsers = ref([])
const showInvitationsPanel = ref(false)
const acceptingId = ref(null)
const rejectingId = ref(null)
const inviteForm = ref({ selectedUser: null, role: '' })
const refreshCooldown = ref(0)
let cooldownTimer = null

const refreshUsers = async () => {
  if (refreshCooldown.value > 0) return
  
  refreshCooldown.value = 5
  await store.fetchUsers()
  await store.fetchPendingInvitations()
  
  cooldownTimer = setInterval(() => {
    refreshCooldown.value--
    if (refreshCooldown.value <= 0) {
      clearInterval(cooldownTimer)
    }
  }, 1000)
}

const roleOptions = computed(() => {
  const options = [
    { label: 'Gestor', value: 'Gestor Operativo' },
    { label: 'Logística', value: 'Logistica' }
  ]
  if (isAdminUser.value) {
    options.unshift({ label: 'Administrador', value: 'Administrador' })
  }
  return options
})

const isInviteFormValid = computed(() => {
  return inviteForm.value.selectedUser && inviteForm.value.role
})

const isAdminUser = computed(() => {
  const email = store.currentUser?.email || ''
  if (!email) return false
  const currentProjectId = localStorage.getItem('currentProjectId')
  const myTeamUser = store.teamUsers.find(
    tu => tu.email === email && String(tu.projectId) === String(currentProjectId)
  )
  return myTeamUser?.role === 'Administrador'
})

const sortedUsers = computed(() => {
  const users = [...store.filteredUsers]
  if (!store.currentUser) return users
  const currentIndex = users.findIndex(u => u.id === store.currentUser.id || u.email === store.currentUser.email)
  if (currentIndex > -1) {
    const [currentUserObj] = users.splice(currentIndex, 1)
    users.unshift(currentUserObj)
  }
  return users
})

const getInitials = (fullName) => {
  if (!fullName) return '?'
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const formatRole = (role) => role

const extractRole = (inv) => {
  try {
    const payload = JSON.parse(inv.payload)
    return payload?.Role || 'Miembro'
  } catch { return 'Miembro' }
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
  return store.currentUser?.id === user.id || store.currentUser?.email === user.email
}

const toggleStatus = async (user) => {
  await store.toggleUserStatus(user)
}

const toggleInvitationsPanel = () => {
  showInvitationsPanel.value = !showInvitationsPanel.value
  if (showInvitationsPanel.value) {
    store.fetchPendingInvitations()
  }
}

const acceptInvitation = async (id) => {
  acceptingId.value = id
  try {
    await store.acceptInvitation(id)
  } catch (error) {
    console.error('Error accepting invitation:', error)
  } finally {
    acceptingId.value = null
  }
}

const rejectInvitation = async (id) => {
  rejectingId.value = id
  try {
    await store.rejectInvitation(id)
  } catch (error) {
    console.error('Error rejecting invitation:', error)
  } finally {
    rejectingId.value = null
  }
}

const openInviteDialog = async () => {
  inviteForm.value = { selectedUser: null, role: '' }
  try {
    const users = await identityApi.getAllUsers()
    const currentProjectId = localStorage.getItem('currentProjectId')
    const teamEmails = store.teamUsers
      .filter(tu => String(tu.projectId) === String(currentProjectId))
      .map(tu => tu.email)

    iamUsers.value = users
      .filter(u => !teamEmails.includes(u.email))
      .map(u => ({ ...u, label: `${u.name || u.email} (${u.email})` }))
  } catch (error) {
    console.error('Error loading IAM users:', error)
  }
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const inviteUser = async () => {
  if (!isInviteFormValid.value) return
  const selected = inviteForm.value.selectedUser
  try {
    await store.inviteUser({
      userId: Number(selected.id),
      fullName: selected.name || selected.email,
      email: selected.email,
      role: inviteForm.value.role
    })
    toast.add({ severity: 'success', summary: t('team.users.invitations.success-title'), detail: t('team.users.invitations.success-detail'), life: 3000 })
    closeDialog()
  } catch (error) {
    toast.add({ severity: 'error', summary: t('team.users.invitations.error-title'), detail: t('team.users.invitations.error-detail'), life: 4000 })
  }
}

const openMenuId = ref(null)
const roleDialogVisible = ref(false)
const deleteConfirmVisible = ref(false)
const selectedUser = ref(null)
const selectedNewRole = ref('')

const toggleActionsMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const openRoleDialog = (user) => {
  selectedUser.value = user
  selectedNewRole.value = ''
  roleDialogVisible.value = true
}

const saveRoleChange = async () => {
  if (!selectedUser.value || !selectedNewRole.value) return
  try {
    await store.changeUserRole(selectedUser.value.id, selectedNewRole.value)
    roleDialogVisible.value = false
  } catch (error) {
    console.error('Error cambiando rol:', error)
  }
}

const confirmDeleteUser = (user) => {
  selectedUser.value = user
  deleteConfirmVisible.value = true
}

const executeDeleteUser = async () => {
  if (!selectedUser.value) return
  try {
    await store.removeUser(selectedUser.value.id)
    deleteConfirmVisible.value = false
  } catch (error) {
    console.error('Error eliminando usuario:', error)
  }
}

const clearSearch = () => {
  searchValue.value = ''
  store.updateSearchTerm('')
}

watch(searchValue, (newVal) => {
  store.updateSearchTerm(newVal)
})

onMounted(async () => {
  store.loadCurrentUser()
  await store.fetchUsers()
  await store.fetchPendingInvitations()

  // Debug: verificar si el usuario actual aparece en team_users y su estado
  const currentEmail = store.currentUser?.email
  if (currentEmail) {
    const currentProjectId = localStorage.getItem('currentProjectId')
    const me = store.teamUsers.find(tu => tu.email === currentEmail && String(tu.projectId) === String(currentProjectId))
    console.log('🔍 DEBUG teamUsersPage - Mi TeamUser:', me ? { id: me.id, isActive: me.isActive, role: me.role, userId: me.userId } : 'NO ENCONTRADO')
    console.log('🔍 DEBUG teamUsersPage - Todos los teamUsers:', store.teamUsers.map(tu => ({ id: tu.id, email: tu.email, isActive: tu.isActive, userId: tu.userId, projectId: tu.projectId })))
  }
})
</script>
