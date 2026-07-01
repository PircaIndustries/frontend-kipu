<template>
  <div class="p-4 md:p-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 class="text-2xl font-bold text-text-main">{{ $t('team.users.title') }}</h1>
      <Button
          @click="openInviteDialog"
          :label="$t('team.users.btn-invite')"
          icon="pi pi-user-plus"
          class="bg-accent! text-white border-none! hover:bg-primary! w-full md:w-auto justify-center"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-neutral-border text-sm">{{ $t('team.users.stats.active') }}</p>
            <h2 class="text-3xl font-bold text-accent">{{ store.totalActiveUsers }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-neutral-border text-sm">{{ $t('team.users.stats.managers') }}</p>
            <h2 class="text-3xl font-bold text-primary">{{ store.totalManagers }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-neutral-border text-sm">{{ $t('team.users.stats.logistics') }}</p>
            <h2 class="text-3xl font-bold text-primary">{{ store.totalLogistics }}</h2>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <p class="text-neutral-border text-sm">{{ $t('team.users.stats.clients') }}</p>
            <h2 class="text-3xl font-bold text-primary">{{ store.totalClients }}</h2>
          </div>
        </template>
      </Card>
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
                <i
                    v-if="searchValue"
                    @click="clearSearch"
                    class="pi pi-times absolute right-3 top-1/2 -translate-y-1/2 text-neutral-border cursor-pointer hover:text-text-main"
                ></i>
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
                    <span v-if="isCurrentUser(data)" class="text-xs text-neutral-border ml-1 font-semibold italic">
                      ({{ $t('team.users.assigned-roles.user-profile-you') }})
                    </span>
                  </div>
                </template>
              </Column>

              <Column field="email" :header="$t('team.users.assigned-roles.email-tab')">
                <template #body="{ data }">
                  <span class="text-text-main">{{ data.email }}</span>
                </template>
              </Column>

              <Column field="role" :header="$t('team.users.assigned-roles.assigned-role-tab')">
                <template #body="{ data }">
                  <Badge :value="formatRole(data.role)" :severity="getRoleSeverity(data.role)" />
                </template>
              </Column>

              <Column :header="$t('team.users.assigned-roles.action-tab')">
                <template #body="{ data }">
                  <div v-if="isCurrentUser(data)" class="text-neutral-border text-xs italic p-2">
                    -
                  </div>
                  <div v-else-if="data.isPending" class="text-warning text-xs font-semibold px-2 py-1 bg-warning/10 rounded inline-block">
                    Pendiente
                  </div>
                  <div v-else>
                    <Button
                        v-if="data.isActive"
                        @click="toggleStatus(data)"
                        :label="$t('team.users.assigned-roles.btn-action')"
                        severity="danger"
                        text
                        size="small"
                    />
                    <Button
                        v-else
                        @click="toggleStatus(data)"
                        :label="$t('team.users.assigned-roles.btn-action-done')"
                        text
                        size="small"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
            </div>

            <div class="text-right text-sm text-neutral-border mt-4">
              {{ sortedUsers.length }} / {{ store.allUsers.length }} {{ $t('team.users.assigned-roles.user-count') }}
            </div>
          </template>
        </Card>
      </div>

      <div class="w-full md:w-80 flex flex-col gap-4">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-book text-primary"></i>
              <span class="text-text-main font-semibold">{{ $t('team.users.role-dictionary.title') }}</span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <div>
                <h3 class="text-base font-bold text-primary">{{ $t('team.users.role-dictionary.administrator') }}</h3>
                <p class="text-sm text-text-main mt-1 leading-relaxed">
                  {{ $t('team.users.role-dictionary.administrator-description') }}
                </p>
              </div>
              <div>
                <h3 class="text-base font-bold text-primary">{{ $t('team.users.role-dictionary.manager') }}</h3>
                <p class="text-sm text-text-main mt-1 leading-relaxed">
                  {{ $t('team.users.role-dictionary.manager-description') }}
                </p>
              </div>
              <div>
                <h3 class="text-base font-bold text-primary">{{ $t('team.users.role-dictionary.logistics') }}</h3>
                <p class="text-sm text-text-main mt-1 leading-relaxed">
                  {{ $t('team.users.role-dictionary.logistics-description') }}
                </p>
              </div>
              <div class="bg-neutral-bg p-3 rounded-md border border-neutral-border">
                <h3 class="text-base font-bold text-primary">{{ $t('team.users.role-dictionary.client') }}</h3>
                <p class="text-sm text-text-main mt-1 leading-relaxed">
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

    <Dialog
        v-model:visible="dialogVisible"
        :header="$t('team.users.send-invitation.title')"
        :modal="true"
        class="w-[550px]"
        :style="{ borderRadius: 'var(--radius-m)' }"
    >
      <form @submit.prevent="inviteUser" class="flex flex-col gap-4">
        <p class="text-neutral-border text-sm">{{ $t('team.users.send-invitation.select-user') }}</p>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-text-main">{{ $t('team.users.send-invitation.user-label') }}</label>
          <Select
              v-model="inviteForm.selectedUser"
              :options="iamUsers"
              optionLabel="label"
              placeholder="Seleccionar usuario"
              required
              class="border-neutral-border"
          >
            <template #option="slotProps">
              <span>{{ slotProps.option.name || slotProps.option.email }} ({{ slotProps.option.email }})</span>
            </template>
          </Select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-text-main">{{ $t('team.users.send-invitation.rol') }}</label>
          <Select
              v-model="inviteForm.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar rol"
              required
              class="border-neutral-border"
          />
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeDialog" :label="$t('team.users.send-invitation.btn-cancel')" text class="text-text-main! hover:text-primary!" />
          <Button
              @click="inviteUser"
              :label="$t('team.users.send-invitation.btn-invite')"
              :disabled="!isInviteFormValid"
              class="bg-accent! text-white border-none! hover:bg-primary"
          />
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

const store = useTeamUserStore()

const searchValue = ref('')
const dialogVisible = ref(false)
const iamUsers = ref([])
const inviteForm = ref({
  selectedUser: null,
  role: ''
})

const roleOptions = [
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Gestor', value: 'Gestor Operativo' },
  { label: 'Logística', value: 'Logistica' },
  { label: 'Cliente', value: 'Cliente' }
]

const isInviteFormValid = computed(() => {
  return inviteForm.value.selectedUser && inviteForm.value.role
})

/**
 * REGLA VISUAL DE ORDENAMIENTO:
 * Toma la lista ya filtrada por el buscador y fuerza a que el usuario actual aparezca en la posición [0] (primero)
 */
const sortedUsers = computed(() => {
  const users = [...store.filteredUsers]
  if (!store.currentUser) return users

  // Buscamos si el usuario actual ya está en el arreglo
  const currentIndex = users.findIndex(u => u.id === store.currentUser.id || u.email === store.currentUser.email)

  if (currentIndex > -1) {
    // Si ya existe, lo sacamos de su posición actual y lo empujamos al principio de la lista
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

const formatRole = (role) => {
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
  return store.currentUser?.id === user.id || store.currentUser?.email === user.email
}

const toggleStatus = async (user) => {
  await store.toggleUserStatus(user)
}

const openInviteDialog = async () => {
  inviteForm.value = { selectedUser: null, role: '' }
  try {
    const users = await identityApi.getAllUsers()
    iamUsers.value = users.map(u => ({
      ...u,
      label: `${u.name || u.email} (${u.email})`
    }))
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
    closeDialog()
    await store.fetchUsers()
  } catch (error) {
    alert('Ocurrió un error al enviar la invitación.');
  }
}

const clearSearch = () => {
  searchValue.value = ''
  store.updateSearchTerm('')
}

watch(searchValue, (newVal) => {
  store.updateSearchTerm(newVal)
})

/**
 * REGLA DE NEGOCIO EN EL CICLO DE VIDA (ON MOUNTED)
 * 1. Carga el estado del usuario logueado localmente.
 * 2. Carga todos los usuarios asignados al proyecto desde el backend (.NET).
 * 3. Verifica si el usuario actual falta en la base de datos de este proyecto; de ser así, lo registra en caliente.
 */
onMounted(async () => {
  // Primero cargamos los datos locales de sesión
  store.loadCurrentUser()

  // Traemos los usuarios existentes de la base de datos
  await store.fetchUsers()

  // Verificamos si el usuario actual ya se encuentra en el listado de este proyecto
  if (store.currentUser) {
    const userExists = store.teamUsers.some(
        u => u.email === store.currentUser.email &&
            String(u.projectId) === String(localStorage.getItem('currentProjectId'))
    )

    // Si no está registrado en el proyecto actual, hacemos la auto-suscripción
    if (!userExists) {
      console.log("El usuario actual no está registrado en este proyecto. Registrando automáticamente...")

      // Separamos el nombre completo de Pepe para cumplir con la firma del formulario de invitación
      const nameParts = store.currentUser.fullName.split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.slice(1).join(' ') || 'Kipu'

      const registrationData = {
        userId: Number(store.currentUser.userId) || 0,
        fullName: store.currentUser.fullName,
        email: store.currentUser.email,
        role: store.currentUser.role || 'Gestor Operativo'
      }

      await store.inviteUser(registrationData)

      // Volvemos a refrescar la tabla para traer el ID definitivo asignado por el Agregado DDD
      await store.fetchUsers()
    }
  }
})
</script>