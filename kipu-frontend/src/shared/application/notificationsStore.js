import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore.js';

export const useNotificationsStore = defineStore('notifications', () => {
  const projectsStore = useProjectsStore();

  // Seed initial realistic construction notifications
  const initialNotifications = [
    {
      id: 'notif-01',
      title: 'Desviación de Presupuesto Detectada',
      description: 'El material "Acero Corrugado" en la Solicitud #102 supera el costo unitario presupuestado por $15.00 en la partida de Cimientos.',
      type: 'logistica',
      route: '/logistics',
      date: 'Hace 5 minutos',
      read: false,
      projectId: 'proj-01'
    },
    {
      id: 'notif-02',
      title: 'Firma Digital Requerida',
      description: 'El "Acta de Conformidad - Estructuras" ha sido cargada y requiere su firma para proceder con el vaciado de losa.',
      type: 'firmas',
      route: '/signatures',
      date: 'Hace 20 minutos',
      read: false,
      projectId: 'proj-01'
    },
    {
      id: 'notif-03',
      title: 'Nuevo RNC Registrado',
      description: 'Se ha reportado un RNC: "Cangrejera en columna C-4" durante la inspección del sector B.',
      type: 'rnc',
      route: '/rnc',
      date: 'Hace 1 hora',
      read: false,
      projectId: 'proj-01'
    },
    {
      id: 'notif-04',
      title: 'Alerta de Presupuesto',
      description: 'La orden de compra de "Cemento Portland" excede el presupuesto restante asignado en la partida Estructuras.',
      type: 'logistica',
      route: '/logistics',
      date: 'Hace 2 horas',
      read: false,
      projectId: 'proj-01'
    },
    {
      id: 'notif-05',
      title: 'Avance de Obra Registrado',
      description: 'El contratista registró un avance del 100% en la actividad "Excavación de Zapatas".',
      type: 'avances',
      route: '/advances',
      date: 'Ayer',
      read: true,
      projectId: 'proj-01'
    },
    {
      id: 'notif-06',
      title: 'Firma Pendiente Completada',
      description: 'Ana Torres ha firmado digitalmente el "Plano de Cimentaciones Estructurales".',
      type: 'firmas',
      route: '/signatures',
      date: 'Ayer',
      read: true,
      projectId: 'proj-01'
    },
    // Project 02 notifications
    {
      id: 'notif-07',
      title: 'RNC Crítico Reportado',
      description: 'Se reportó una fisura en la losa de cimentación en el sector de estacionamientos de Plaza Norte.',
      type: 'rnc',
      route: '/rnc',
      date: 'Hace 10 minutos',
      read: false,
      projectId: 'proj-02'
    },
    {
      id: 'notif-08',
      title: 'Solicitud de Materiales Aprobada',
      description: 'La solicitud de 50 planchas de "Triplay Fenólico" fue aprobada por gerencia de proyectos.',
      type: 'logistica',
      route: '/logistics',
      date: 'Hace 45 minutos',
      read: false,
      projectId: 'proj-02'
    },
    {
      id: 'notif-09',
      title: 'Presupuesto Ampliado',
      description: 'Se aprobó la extensión de presupuesto de $20,000 para el plan estructural adicional.',
      type: 'presupuesto',
      route: '/budget',
      date: 'Hace 3 horas',
      read: false,
      projectId: 'proj-02'
    }
  ];

  // Try to load from localStorage, otherwise use initial
  const stored = localStorage.getItem('kipu_notifications');
  const notifications = ref(stored ? JSON.parse(stored) : initialNotifications);

  // --- Computed ---
  // Filter notifications based on active project
  const projectNotifications = computed(() => {
    const activeId = projectsStore.currentProjectId;
    if (!activeId) return notifications.value;
    return notifications.value.filter(n => n.projectId === activeId);
  });

  const unreadCount = computed(() => {
    return projectNotifications.value.filter(n => !n.read).length;
  });

  const latestThree = computed(() => {
    // Show top 3 (both read and unread, but prioritize unread or simply slice first 3 from the active list)
    return projectNotifications.value.slice(0, 3);
  });

  // --- Actions ---
  function saveToStorage() {
    localStorage.setItem('kipu_notifications', JSON.stringify(notifications.value));
  }

  function dismissNotification(id) {
    notifications.value = notifications.value.filter(n => n.id !== id);
    saveToStorage();
  }

  function markAsRead(id) {
    const notif = notifications.value.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveToStorage();
    }
  }

  function addNotification(title, description, type, route, projectId) {
    notifications.value.unshift({
      id: `notif-${Date.now()}`,
      title,
      description,
      type,
      route,
      date: 'Justo ahora',
      read: false,
      projectId: projectId || projectsStore.currentProjectId || 'proj-01'
    });
    saveToStorage();
  }

  function clearAll() {
    notifications.value = [];
    saveToStorage();
  }

  return {
    notifications,
    projectNotifications,
    unreadCount,
    latestThree,
    dismissNotification,
    markAsRead,
    addNotification,
    clearAll
  };
});
