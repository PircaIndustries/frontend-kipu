export default {
    /** Navigation labels for the sidebar */
    navigation: {
        dashboard: 'Dashboard',
        advances: 'Advances',
        rnc: 'RNC',
        materials: 'Materials',
        blueprints: 'Blueprints',
        signatures: 'Signatures',
        budget: 'Budget',
        team: 'Team'
    },
    execution: {
        title: "Daily Progress Registration",
        taskLabel: "Task (Partida)",
        statusLabel: "Status",
        impedimentLabel: "Impediment Reason",
        submitBtn: "Register Progress",
        statusOptions: {
            progress: "In Progress",
            blocked: "Blocked"
        },
        advances: {
            title: 'Work Progress Control',
            subtitle: 'Daily records and execution status history.',
            newBtn: 'New Daily Progress',
            filterSpecialty: 'Filter by: Specialty',
            filterWeek: 'Week: Apr 13 - Apr 19',
            weeklyReport: 'You have registered {count} advances this week. Remember to attach photos to each report.',
            specialties: {
                structures: 'Structures',
                installations: 'Installations',
                architecture: 'Architecture'
            },
            tabs: {
                registry: 'Progress Registry (PPC)',
                photoLog: 'Photo Log'
            },
            photoLog: {
                title: 'Evidence Gallery',
                noPhotos: 'No photos registered for this period.',
                viewFull: 'View full screen',
                filterBy: 'Specialty:'
            }
        },
        table: {
            date: 'DATE',
            activity: 'ACTIVITY PERFORMED',
            specialty: 'SPECIALTY',
            progress: 'PROGRESS (%)',
            status: 'STATUS'
        },
        status: {
            COMPLETED: 'COMPLETED',
            IN_PROGRESS: 'IN PROGRESS',
            DELAYED: 'DELAYED'
        },
        /** Moved inside execution to match component calls */
        create: {
            title: 'New Daily Progress',
            submitBtn: 'Save Progress',
            discardHeader: 'Confirm Discard',
            discardMessage: 'You have unsaved changes. Are you sure you want to leave?',
            fields: {
                date: 'Progress Date',
                specialty: 'Specialty',
                activity: 'Activity Performed',
                location: 'Location/Sector',
                progress: 'Progress Percentage',
                description: 'Detailed Description',
                responsible: 'Responsible',
                crewSize: 'Crew Size',
                weather: 'Weather Conditions',
                photos: 'Progress Photos'
            },
            placeholders: {
                activity: 'e.g., Pouring second level slab',
                location: 'e.g., Level 2 - Axis A-B'
            },
            photos: {
                add: 'Add photo',
                empty: 'Drag images here to upload'
            }
        },
        weather: {
            sunny: 'Sunny',
            cloudy: 'Cloudy',
            rainy: 'Rainy',
            storm: 'Storm'
        }
    },
    /** Common UI labels */
    common: {
        management: 'Works Management',
        cancel: 'Cancel',
        yes: 'Yes',
        no: 'No'
    },
    /** User role labels */
    roles: {
        resident: 'Works Resident'
    }
};