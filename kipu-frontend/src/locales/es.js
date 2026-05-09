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
            status: 'ESTADO'
        },
        taskLabel: "Partida",
        title: "Registro de Avance Diario",
        /** Movido dentro de execution para que t('execution.create...') funcione */
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
                photos: 'Fotos del Avance'
            },
            placeholders: {
                activity: 'Ej: Vaciado de losa del segundo nivel',
                location: 'Ej: Nivel 2 - Eje A-B'
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
    common: {
        management: 'Gestión de Obras',
        cancel: 'Cancelar',
        yes: 'Sí',
        no: 'No'
    },
    roles: {
        resident: 'Residente de Obra'
    }
};