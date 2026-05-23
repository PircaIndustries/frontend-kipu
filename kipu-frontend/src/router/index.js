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
            }
        ]
    },
    {
        path: '/advances/new',
        name: 'CreateAdvance',
        component: () => import('@/domains/progress-monitoring/presentation/views/CreateAdvanceView.vue')
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
            {
                path: 'edit/:id',
                name: 'EditBudget',
                component: () => import('@/domains/budget/presentation/views/EditBudgetView.vue'),
                props: true
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

    // 1. Authentication guard: if not authenticated and trying to access a protected route, redirect to login
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(routeName)) {
        return { name: 'Login' };
    }

    // 2. Prevent authenticated users from going back to public identity routes
    if (isAuthenticated && PUBLIC_ROUTES.includes(routeName)) {
        return { name: 'Projects' };
    }

    // 3. Project selection guard: allow whitelisted routes without project selection
    if (PROJECT_WHITELIST.includes(routeName)) return true;

    // Check if a project is selected (read directly from localStorage for SSR-safe check
    // before Pinia might be initialized)
    const hasProject = !!localStorage.getItem('currentProjectId');
    if (!hasProject) {
        return { name: 'Projects' };
    }

    return true;
});

export default router;