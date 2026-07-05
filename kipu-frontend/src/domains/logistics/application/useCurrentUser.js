const ROLES = {
  ADMINISTRADOR: 'Administrador',
  GESTOR_OPERATIVO: 'Gestor Operativo',
  LOGISTICA: 'Logística y Administración',
  CLIENTE: 'Cliente',
  INGENIERO: 'Ingeniero',
};

export function useCurrentUser() {
  function getUser() {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getUserId() {
    const user = getUser();
    return user?.id ?? null;
  }

  function getUserRole() {
    const user = getUser();
    return user?.role ?? null;
  }

  function isLogistics() {
    return getUserRole() === ROLES.LOGISTICA || getUserRole() === ROLES.ADMINISTRADOR;
  }

  function isGestor() {
    return getUserRole() === ROLES.GESTOR_OPERATIVO || getUserRole() === ROLES.ADMINISTRADOR;
  }

  function isAdmin() {
    return getUserRole() === ROLES.ADMINISTRADOR;
  }

  function getUserName() {
    const user = getUser();
    return user?.name ?? null;
  }

  function isOwner(creatorId) {
    return String(getUserId()) === String(creatorId);
  }

  return {
    getUser,
    getUserId,
    getUserRole,
    getUserName,
    isLogistics,
    isGestor,
    isAdmin,
    isOwner,
    ROLES,
  };
}
