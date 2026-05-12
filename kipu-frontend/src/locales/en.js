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
            subtitle: 'Daily records and progress-monitoring status history.',
            newBtn: 'New Daily Progress',
            filterSpecialty: 'Filter by: Specialty',
            filterProject: 'Filter by: Project',
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
            project: 'PROJECT',
            status: 'STATUS'
        },
        status: {
            COMPLETED: 'COMPLETED',
            IN_PROGRESS: 'IN PROGRESS',
            DELAYED: 'DELAYED'
        },
        /** Moved inside progress-monitoring to match component calls */
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
                project: 'Assigned Project',
                photos: 'Progress Photos'
            },
            placeholders: {
                activity: 'e.g., Pouring second level slab',
                project: 'Select a project',
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
    projects: {
        title: 'My Projects',
        newProject: 'New Project',
        searchPlaceholder: 'Search project...',
        stats: {
            active: 'Active Projects',
            average: 'Average Progress',
            rnc: 'Open RNC',
            total: 'Collaborators'
        },
        create: {
            header: 'Enter project details',
            name: 'Name',
            location: 'Location',
            start: 'Start date',
            end: 'End date',
            budget: 'Estimated budget',
            cancel: 'Cancel',
            submit: 'Create Project',
            successHeader: 'Project created successfully',
            goToProject: 'Go to project',
            errors: {
                dateLogic: 'The end date cannot be earlier than the start date.'
            },
            imageUrl: 'Image URL',
            status: 'Status',
            statusOptions: {
                planning: 'Planning',
                execution: 'In progress-monitoring',
                paused: 'Paused'
            },
            discard: {
                title: 'Discard changes?',
                message: 'You have unsaved data. Are you sure you want to leave?',
                continue: 'Continue editing',
                confirm: 'Discard'
            }
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
    },
    "logistics-tabs": {
    "tab-inventory": "Inventory",
        "tab-requests": "Requests",
        "tab-suppliers": "Suppliers",
        "tab-waste": "Waste"
    },
    "team": {
        "users": {
            "title": "User Management",
            "btn-invite": "Send Invitation",
            "tab-users": "System Users",
            "stats": {
                "active": "ACTIVE USERS",
                "managers": "MANAGERS",
                "logistics": "LOGISTICS TEAM",
                "clients": "CLIENTS"
            },
            "assigned-roles": {
                "title": "Role Assignment",
                "user-tab": "User",
                "email-tab": "Email",
                "assigned-role-tab": "Assigned Role",
                "action-tab": "Action",
                "user-profile-you": "You",
                "btn-action": "Disable",
                "btn-action-done": "Disabled",
                "input-placeholder": "Name, email or role...",
                "user-count": "users"
            },
            "role-dictionary": {
                "administrator": "Administrator",
                "manager": "Operations Manager",
                "logistics": "Logistics",
                "client": "Client",
                "engineer": "Engineer"
            },
            "send-invitation": {
                "title": "Invite new user",
                "credentials": "An email with system access credentials will be sent.",
                "email": "EMAIL ADDRESS",
                "email-placeholder": "user@company.com",
                "name": "Name",
                "name-placeholder": "e.g., 'Juan'",
                "lastname": "Lastname",
                "lastname-placeholder": "e.g., 'Perez'",
                "rol": "Role to assign",
                "btn-cancel": "Cancel",
                "btn-invite": "Send Invitation"
            }
        }
    }
};