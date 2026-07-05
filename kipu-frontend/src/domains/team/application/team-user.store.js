import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teamUserApi } from '../infrastructure/team-user.api.js'
import { notificationsApi } from '../infrastructure/notifications.api.js'
import { TeamUserAssembler } from '../infrastructure/team-user.assembler.js'
import { TeamUserEntity } from '../domain/model/team-user.entity.js'

export const useTeamUserStore = defineStore('teamUser', () => {

    const teamUsers = ref([])
    const searchTerm = ref('')
    const currentUser = ref(null)
    const loading = ref(false)
    const pendingInvitations = ref([])
    const invitationsLoading = ref(false)

    const allUsers = computed(() => {
        const currentId = localStorage.getItem('currentProjectId')
        if (!currentId) return []
        return teamUsers.value.filter(user => String(user.projectId) === String(currentId))
    })

    const activeUsers = computed(() => allUsers.value.filter(user => user.isActive))

    const filteredUsers = computed(() => {
        const term = searchTerm.value.toLowerCase().trim()
        if (!term) return allUsers.value
        return allUsers.value.filter(user =>
            user.fullName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term)
        )
    })

    const totalActiveUsers = computed(() => activeUsers.value.length)

    const totalManagers = computed(() =>
        allUsers.value.filter(user =>
            user.isActive && (user.role === 'Gestor' || user.role === 'Gestor Operativo')
        ).length
    )

    const totalLogistics = computed(() =>
        allUsers.value.filter(user => user.isActive && user.role === 'Logistica').length
    )

    const totalClients = computed(() =>
        allUsers.value.filter(user => user.isActive && user.role === 'Cliente').length
    )

    const fetchUsers = async () => {
        const currentProjectId = localStorage.getItem('currentProjectId')
        if (!currentProjectId) {
            console.warn("No hay un proyecto seleccionado. No se pueden traer usuarios.");
            return;
        }
        loading.value = true
        try {
            const response = await teamUserApi.getAllUsers(currentProjectId)
            const entities = TeamUserAssembler.toEntitiesFromResponse(response)
            
            const uniqueEntities = [];
            const seenEmails = new Set();
            for (const entity of entities) {
                const identifier = entity.email || entity.id;
                if (!seenEmails.has(identifier)) {
                    seenEmails.add(identifier);
                    uniqueEntities.push(entity);
                }
            }
            teamUsers.value = uniqueEntities;
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            loading.value = false
        }
    }

    const loadCurrentUser = () => {
        const stored = localStorage.getItem('currentUser')
        if (stored) {
            try {
                const userRaw = JSON.parse(stored)
                if (userRaw.name && !userRaw.fullName) {
                    userRaw.fullName = userRaw.name
                }
                if (!userRaw.projectId) {
                    userRaw.projectId = localStorage.getItem('currentProjectId') || ''
                }
                currentUser.value = TeamUserAssembler.toEntityFromResource(userRaw)
            } catch (error) {
                console.error('Error parsing current user:', error)
            }
        }
    }

    const addLocalUser = (user) => {
        teamUsers.value.push(user)
    }

    const updateLocalUser = (updatedUser) => {
        const index = teamUsers.value.findIndex(u => u.id === updatedUser.id)
        if (index !== -1) {
            teamUsers.value[index] = updatedUser
        }
    }

    const toggleUserStatus = async (user) => {
        try {
            let updatedResource;
            if (user.isActive) {
                updatedResource = await teamUserApi.deactivateUser(user.id)
            } else {
                updatedResource = await teamUserApi.activateUser(user.id)
            }
            const updatedEntity = TeamUserAssembler.toEntityFromResource(updatedResource)
            updateLocalUser(updatedEntity)
        } catch (error) {
            console.error('Error toggling user status:', error)
        }
    }

    const inviteUser = async (userData) => {
        const currentProjectId = localStorage.getItem('currentProjectId');
        if (!currentProjectId) throw new Error('No active project found');

        try {
            const createResource = {
                userId: userData.userId,
                fullName: userData.fullName,
                email: userData.email,
                role: userData.role,
                projectId: currentProjectId,
            }
            await teamUserApi.createUser(createResource)
        } catch (error) {
            console.error('Error inviting user:', error.response?.data || error.message)
            throw error
        }
    }

    const fetchPendingInvitations = async () => {
        const stored = localStorage.getItem('currentUser')
        if (!stored) return
        try {
            const user = JSON.parse(stored)
            invitationsLoading.value = true
            const all = await notificationsApi.getByUser(user.id)
            pendingInvitations.value = all.filter(n => n.status === 'Pending' && n.type === 'ProjectInvitation')
        } catch (error) {
            console.error('Error fetching pending invitations:', error)
        } finally {
            invitationsLoading.value = false
        }
    }

    const acceptInvitation = async (notificationId) => {
        try {
            await notificationsApi.acceptNotification(notificationId)
            pendingInvitations.value = pendingInvitations.value.filter(n => n.id !== notificationId)
            await fetchUsers()
        } catch (error) {
            console.error('Error accepting invitation:', error)
            throw error
        }
    }

    const rejectInvitation = async (notificationId) => {
        try {
            await notificationsApi.rejectNotification(notificationId)
            pendingInvitations.value = pendingInvitations.value.filter(n => n.id !== notificationId)
        } catch (error) {
            console.error('Error rejecting invitation:', error)
            throw error
        }
    }

    const removeUser = async (id) => {
        try {
            await teamUserApi.deleteUser(id)
            teamUsers.value = teamUsers.value.filter(u => u.id !== id)
        } catch (error) {
            console.error('Error removing user:', error)
            throw error
        }
    }

    const changeUserRole = async (id, newRole) => {
        try {
            const updated = await teamUserApi.updateUserRole(id, newRole)
            const entity = TeamUserAssembler.toEntityFromResource(updated)
            updateLocalUser(entity)
        } catch (error) {
            console.error('Error changing user role:', error)
            throw error
        }
    }

    const updateSearchTerm = (term) => {
        searchTerm.value = term
    }

    const clearSearch = () => {
        searchTerm.value = ''
    }

    const getRoleTranslationKey = (role) => {
        const roleMap = {
            'Administrador': 'administrator',
            'Gestor': 'manager',
            'Gestor Operativo': 'manager',
            'Logistica': 'logistics',
            'Cliente': 'client',
            'Ingeniero': 'engineer'
        }
        return roleMap[role] || role
    }

    return {
        teamUsers, searchTerm, currentUser, loading,
        pendingInvitations, invitationsLoading,
        allUsers, activeUsers, filteredUsers,
        totalActiveUsers, totalManagers, totalLogistics, totalClients,
        fetchUsers, loadCurrentUser, addLocalUser, updateLocalUser,
        toggleUserStatus, inviteUser,
        fetchPendingInvitations, acceptInvitation, rejectInvitation,
        removeUser, changeUserRole,
        updateSearchTerm, clearSearch, getRoleTranslationKey
    }
})
