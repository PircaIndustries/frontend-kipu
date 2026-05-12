export default {
    navigation: {
        dashboard: 'Dashboard',
        advances: 'Avances',
        rnc: 'RNC',
        materials: 'Materiales',
        blueprints: 'Planos',
        signatures: 'Firmas',
        budget: 'Presupuesto',
        team: 'Equipo'
    },
    execution: {
        advances: {
            title: 'Control de Avances',
            subtitle: 'Historial de registros diarios y estados de ejecución.',
            newBtn: 'Nuevo Avance Diario',
            filterSpecialty: 'Filtrar por: Especialidad',
            filterWeek: 'Semana: 13 Abr - 19 Abr',
            filterProject: 'Filtrar por: Proyecto',
            weeklyReport: 'Has registrado {count} avances esta semana. Recuerda adjuntar fotos en cada reporte.',
            specialties: {
                structures: 'Estructuras',
                installations: 'Instalaciones',
                architecture: 'Arquitectura'
            },
            tabs: {
                registry: 'Registro de Avance (PPC)',
                photoLog: 'Bitácora Fotográfica'
            },
            photoLog: {
                title: 'Galería de Evidencias',
                noPhotos: 'No hay fotos registradas para este periodo.',
                viewFull: 'Ver pantalla completa',
                filterBy: 'Especialidad:'
            }
        },
        impedimentLabel: "Motivo de Impedimento",
        status: {
            COMPLETED: 'COMPLETADO',
            IN_PROGRESS: 'EN CURSO',
            DELAYED: 'DEMORADO'
        },
        statusLabel: "Estado",
        statusOptions: {
            progress: "En Avance",
            blocked: "Bloqueado"
        },
        submitBtn: "Registrar Avance",
        table: {
            date: 'FECHA',
            activity: 'ACTIVIDAD REALIZADA',
            specialty: 'ESPECIALIDAD',
            progress: 'AVANCE (%)',
            status: 'ESTADO',
            project: 'PROYECTO',
        },
        taskLabel: "Partida",
        title: "Registro de Avance Diario",
        /** Movido dentro de progress-monitoring para que t('progress-monitoring.create...') funcione */
        create: {
            title: 'Nuevo Avance Diario',
            submitBtn: 'Guardar Avance',
            discardHeader: 'Confirmar descarte',
            discardMessage: 'Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?',
            fields: {
                date: 'Fecha del Avance',
                specialty: 'Especialidad',
                activity: 'Actividad Realizada',
                location: 'Ubicación/Sector',
                progress: 'Porcentaje de Avance',
                description: 'Descripción Detallada',
                responsible: 'Responsable',
                crewSize: 'Personal de Cuadrilla',
                weather: 'Condiciones Climáticas',
                photos: 'Fotos del Avance',
                project: 'Proyecto asignado'
            },
            placeholders: {
                activity: 'Ej: Vaciado de losa del segundo nivel',
                location: 'Ej: Nivel 2 - Eje A-B',
                project: 'Seleccione un proyecto'
            },
            photos: {
                add: 'Agregar foto',
                empty: 'Arrastra imágenes aquí para subirlas'
            }
        },
        weather: {
            sunny: 'Soleado',
            cloudy: 'Nublado',
            rainy: 'Lluvia',
            storm: 'Tormenta'
        }
    },
    projects: {
        title: 'Mis Proyectos',
        newProject: 'Nuevo Proyecto',
        searchPlaceholder: 'Buscar proyecto...',
        stats: {
            active: 'Proyectos Activos',
            average: 'Avance Promedio',
            rnc: 'RNC Abiertos',
            total: 'Colaboradores'
        },
        create: {
            header: 'Ingrese los detalles del proyecto',
            name: 'Nombre',
            location: 'Ubicación',
            start: 'Fecha inicio',
            end: 'Fecha fin',
            budget: 'Presupuesto estimado',
            cancel: 'Cancelar',
            submit: 'Crear Proyecto',
            successHeader: 'Proyecto creado de manera exitosa',
            goToProject: 'Ir a proyecto',
            errors: {
                dateLogic: 'La fecha de fin no puede ser anterior al inicio.'
            },
            imageUrl: 'URL de la Imagen',
            status: 'Estado',
            statusOptions: {
                planning: 'Planificación',
                execution: 'En ejecución',
                paused: 'Pausado'
            },
            discard: {
                title: '¿Descartar cambios?',
                message: 'Tienes datos sin guardar. ¿Estás seguro de que deseas salir?',
                continue: 'Continuar editando',
                confirm: 'Descartar'
            }
        }
    },
    common: {
        management: 'Gestión de Obras',
        cancel: 'Cancelar',
        yes: 'Sí',
        no: 'No'
    },
    roles: {
        resident: 'Residente de Obra'
    },
    "logistics-tabs": {
        "tab-inventory": "Inventario",
        "tab-requests": "Solicitudes",
        "tab-suppliers": "Proveedores",
        "tab-waste": "Mermas",
        "tab-machinery": "Maquinaria",
        "tab-waste": "Mermas"
    },
    "team": {
        "users": {
            "tab-users": "Usuarios del Sistema",
            "title": "Gestión de Usuarios",
            "btn-invite": "Enviar Invitación",
            "stats": {
                "active": "USUARIOS ACTIVOS",
                "managers": "GESTORES",
                "logistics": "EQUIPO DE LOGÍSTICA",
                "clients": "CLIENTES"
            },
            "assigned-roles": {
                "title": "Asignación de Roles",
                "user-tab": "Usuario",
                "email-tab": "Correo Electrónico",
                "assigned-role-tab": "Rol Asignado",
                "action-tab": "Acción",
                "user-profile-you": "Tú",
                "btn-action": "Deshabilitar",
                "btn-action-done": "Deshabilitado",
                "input-placeholder": "Nombre, correo o rol...",
                "user-count": "usuarios"
            },
            "role-dictionary": {
                "title": "Diccionario de Roles",
                "administrator": "Administrador",
                "administrator-description": "Acceso total al sistema. Puede gestionar obras, presupuestos base y accesos.",
                "manager": "Gestor Operativo",
                "manager-description": "Enfocado en campo. Registra avances, RNCs y solicita materiales. Visualiza planos.",
                "logistics": "Logística",
                "logistics-description": "Enfocado en oficina. Aprueba pedidos, edita inventarios y gestiona proveedores.",
                "client": "Cliente",
                "client-description-1": "Nivel de acceso estricto de ",
                "client-description-bold": "Solo Lectura. ",
                "client-description-2": "Todos los botones de creación o edición se ocultan en su vista para proteger la data.",
                "engineer": "Ingeniero"
            },
            "send-invitation": {
                "title": "Invitar nuevo usuario",
                "credentials": "Se enviará un correo con las credenciales de acceso al sistema.",
                "email": "CORREO ELECTRÓNICO",
                "email-placeholder": "compania.com",
                "name": "Nombre",
                "name-placeholder": "Ejm. 'Juan'",
                "lastname": "Apellido",
                "lastname-placeholder": "Ejm. 'Perez'",
                "rol": "Rol a asignar",
                "btn-cancel": "Cancelar",
                "btn-invite": "Enviar Invitación"
            },

        },
        "workers": {
            "tab-workers": "Directorio de Obreros",
            "title": "Directorio de Obreros",
            "register": {
                "btn-add-worker": "+ Nuevo Obrero",
                "no-workers-found": "No se encontraron trabajadores registrados.",
                "description": "Directorio pasivo del personal operario. Se utiliza exclusivamente para asociar su DNI en el Módulo Logístico."
            }
        }
    }
};