import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teamUserApi } from '../infrastructure/team-user.api.js'
import { TeamUserAssembler } from '../infrastructure/team-user.assembler.js'
import { TeamUserEntity } from '../domain/model/team-user.entity.js'

/**
 * Team Users Store - Manages team user state and operations
 */
export const useTeamUserStore = defineStore('teamUser', () => {
    // ========== STATE ==========

    /** @type {import('vue').Ref<TeamUserEntity[]>} */
    const teamUsers = ref([])

    /** @type {import('vue').Ref<string>} */
    const searchTerm = ref('')

    /** @type {import('vue').Ref<TeamUserEntity|null>} */
    const currentUser = ref(null)

    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false)

    // ========== GETTERS ==========

    /**
     * All team users
     * @returns {TeamUserEntity[]}
     */
    const allUsers = computed(() => teamUsers.value)

    /**
     * Active users only
     * @returns {TeamUserEntity[]}
     */
    const activeUsers = computed(() => teamUsers.value.filter(user => user.isActive))

    /**
     * Filtered users based on search term
     * @returns {TeamUserEntity[]}
     */
    const filteredUsers = computed(() => {
        const term = searchTerm.value.toLowerCase().trim()
        if (!term) return teamUsers.value

        return teamUsers.value.filter(user =>
            user.fullName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term)
        )
    })

    /**
     * Total active users count
     * @returns {number}
     */
    const totalActiveUsers = computed(() => activeUsers.value.length)

    /**
     * Managers count (includes 'Gestor' and 'Gestor Operativo')
     * @returns {number}
     */
    const totalManagers = computed(() =>
        teamUsers.value.filter(user =>
            user.isActive && (user.role === 'Gestor' || user.role === 'Gestor Operativo')
        ).length
    )

    /**
     * Logistics team count
     * @returns {number}
     */
    const totalLogistics = computed(() =>
        teamUsers.value.filter(user => user.isActive && user.role === 'Logistica').length
    )

    /**
     * Clients count
     * @returns {number}
     */
    const totalClients = computed(() =>
        teamUsers.value.filter(user => user.isActive && user.role === 'Cliente').length
    )

    // ========== ACTIONS ==========

    /**
     * Load all team users from API
     * @returns {Promise<void>}
     */
    const fetchUsers = async () => {
        loading.value = true
        try {
            const response = await teamUserApi.getAllUsers()
            teamUsers.value = TeamUserAssembler.toEntitiesFromResponse(response)
            console.log(`Loaded ${teamUsers.value.length} team users`)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            loading.value = false
        }
    }

    /**
     * Load current user from localStorage
     * @returns {void}
     */
    const loadCurrentUser = () => {
        const stored = localStorage.getItem('currentUser')
        if (stored) {
            try {
                const user = JSON.parse(stored)
                currentUser.value = TeamUserAssembler.toEntityFromResource(user)
            } catch (error) {
                console.error('Error parsing current user:', error)
            }
        }
    }

    /**
     * Add a new user locally (for simulation)
     * @param {TeamUserEntity} user - User to add
     * @returns {void}
     */
    const addLocalUser = (user) => {
        teamUsers.value.push(user)
        console.log('User added locally:', user)
    }

    /**
     * Update user locally
     * @param {TeamUserEntity} updatedUser - Updated user
     * @returns {void}
     */
    const updateLocalUser = (updatedUser) => {
        const index = teamUsers.value.findIndex(u => u.id === updatedUser.id)
        if (index !== -1) {
            teamUsers.value[index] = updatedUser
            console.log('User updated locally:', updatedUser)
        }
    }

    /**
     * Toggle user active status
     * @param {TeamUserEntity} user - User to toggle
     * @returns {Promise<void>}
     */
    const toggleUserStatus = async (user) => {
        const updatedUser = { ...user, isActive: !user.isActive }

        try {
            await teamUserApi.updateUser(updatedUser.id, updatedUser)
            updateLocalUser(updatedUser)
        } catch (error) {
            console.error('Error toggling user status:', error)
        }
    }

    /**
     * Invite a new user
     * @param {Object} userData - User application (email, firstName, lastName, role)
     * @returns {Promise<TeamUserEntity|null>}
     */
    const inviteUser = async (userData) => {
        const newUser = new TeamUserEntity()
        newUser.id = `us-${Date.now()}`
        newUser.fullName = `${userData.firstName} ${userData.lastName}`
        newUser.email = userData.email
        newUser.isActive = true
        newUser.role = userData.role

        try {
            const created = await teamUserApi.createUser(newUser)
            const entity = TeamUserAssembler.toEntityFromResource(created)
            teamUsers.value.push(entity)
            console.log('User invited successfully:', entity)
            return entity
        } catch (error) {
            console.error('Error inviting user:', error)
            return null
        }
    }

    /**
     * Update search term for filtering
     * @param {string} term - Search term
     * @returns {void}
     */
    const updateSearchTerm = (term) => {
        searchTerm.value = term
    }

    /**
     * Clear search term
     * @returns {void}
     */
    const clearSearch = () => {
        searchTerm.value = ''
    }

    /**
     * Get role translation key
     * @param {string} role - User role
     * @returns {string} Translation key
     */
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
        // State
        teamUsers,
        searchTerm,
        currentUser,
        loading,

        // Getters
        allUsers,
        activeUsers,
        filteredUsers,
        totalActiveUsers,
        totalManagers,
        totalLogistics,
        totalClients,

        // Actions
        fetchUsers,
        loadCurrentUser,
        addLocalUser,
        updateLocalUser,
        toggleUserStatus,
        inviteUser,
        updateSearchTerm,
        clearSearch,
        getRoleTranslationKey
    }
})