import { createRouter, createWebHistory } from 'vue-router';
import logisticsRoutes from '@/domains/logistics/router/logistics-router.js';
import teamRoutes from "../domains/team/router/team-router.js";
import signaturesRoutes from "../domains/signatures/router/signatures-router.js";
import { useProjectsStore } from '@/domains/project-management/data/useProjectsStore';

/**
 * Routes that do NOT require a project to be selected.
 * Used by the navigation guard to avoid infinite redirects.
 */
const PROJECT_WHITELIST = [
    'Login', 'Register', 'ForgotPassword', 'ResetPassword', 'Verification', 'Projects'
];

const PUBLIC_ROUTES = [
    'Login', 'Register', 'ForgotPassword', 'ResetPassword'
];

const routes = [
    ...logisticsRoutes,
    ...teamRoutes,
    ...signaturesRoutes,
    {
        path: '/',
        redirect: '/register'
    },
    // ── Identity routes (no sidebar) ──
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/domains/identity/presentation/views/LoginView.vue'),
        meta: { hideSidebar: true, title: 'Login' }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/domains/identity/presentation/views/RegisterView.vue'),
        meta: { hideSidebar: true, title: 'Register' }
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/domains/identity/presentation/views/ForgotPasswordView.vue'),
        meta: { hideSidebar: true, title: 'Forgot Password' }
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('@/domains/identity/presentation/views/ResetPasswordView.vue'),
        meta: { hideSidebar: true, title: 'Reset Password' }
    },
    {
        path: '/verification',
        name: 'Verification',
        component: () => import('@/domains/identity/presentation/views/VerificationView.vue'),
        meta: { hideSidebar: true, title: 'Verification' }
    },
    // ── Projects (own section) ──
    {
        path: '/projects',
        name: 'Projects',
        component: () => import('@/domains/project-management/presentation/views/ProjectsView.vue')
    },
    // ── Progress Monitoring ──
    {
        path: '/advances',
        component: () => import('@/domains/progress-monitoring/presentation/layouts/AdvancesLayout.vue'),
        children: [
            {
                path: '',
                redirect: '/advances/registry'
            },
            {
                path: 'registry',
                name: 'AdvancesRegistry',
                component: () => import('@/domains/progress-monitoring/presentation/views/AdvancesView.vue')
            },
            {
                path: 'photos',
                name: 'PhotoLog',
                component: () => import('@/domains/progress-monitoring/presentation/views/PhotoLogView.vue')
            },
            {
                path: 'calendar',
                name: 'Calendar',
                component: () => import('@/domains/progress-monitoring/presentation/views/CalendarView.vue')
            }
        ]
    },
    {
        path: '/advances/new',
        name: 'CreateAdvance',
        component: () => import('@/domains/progress-monitoring/presentation/views/CreateAdvanceView.vue')
    },
    // ADDED: Route for editing existing progress records
    {
        path: '/advances/edit/:id',
        name: 'EditAdvance',
        component: () => import('@/domains/progress-monitoring/presentation/views/CreateAdvanceView.vue')
    },
    {
        path: '/advances/activity-history/:activityName',
        name: 'ActivityHistory',
        component: () => import('@/domains/progress-monitoring/presentation/views/ActivityHistoryView.vue')
    },
    {
        path: '/rnc',
        children: [
            {
                path: '',
                redirect: '/rnc/registry'
            },
            {
                path: 'registry',
                name: 'Registry',
                component: () => import('@/domains/ncr/presentation/views/NcrListView.vue')
            },
            {
                path: 'new',
                name: 'RegisterNcr',
                component: () => import('@/domains/ncr/presentation/views/register-ncr.view.vue')
            }
        ]
    },
    {
        path: '/budget',
        children: [
            {
                path: '',
                name: 'BudgetManagement',
                component: () => import('@/domains/budget/presentation/views/BudgetManagement.component.vue')
            },
            {
                path: ':id',
                name: 'BudgetDetail',
                component: () => import('@/domains/budget/presentation/views/BudgetDetailView.vue'),
                props: true
            },
            // ADDED: Route for allocating or updating funds via budget extension form
            {
                path: 'extension',
                name: 'RequestExtension',
                component: () => import('@/domains/budget/presentation/views/RequestExtensionView.vue')
            },
            {
                path: 'transaction/new',
                name: 'RegisterTransaction',
                component: () => import('@/domains/budget/presentation/views/RegisterTransactionView.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

/**
 * Navigation guard: enforces authentication and project selection rules.
 */
router.beforeEach((to) => {
    const routeName = to.name;
    const isAuthenticated = !!localStorage.getItem('currentUser');

    if (!isAuthenticated && !PUBLIC_ROUTES.includes(routeName)) {
        return { name: 'Login' };
    }

    if (isAuthenticated && PUBLIC_ROUTES.includes(routeName)) {
        return { name: 'Projects' };
    }

    if (PROJECT_WHITELIST.includes(routeName)) return true;

    const hasProject = !!localStorage.getItem('currentProjectId');
    if (!hasProject) {
        return { name: 'Projects' };
    }

    return true;
});

export default router;