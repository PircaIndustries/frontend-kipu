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

const routes = [
    ...logisticsRoutes,
    ...teamRoutes,
    ...signaturesRoutes,
    {
        path: '/',
        redirect: '/login'
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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

/**
 * Navigation guard: redirect to /projects if no project is selected
 * and the target route requires one.
 */
router.beforeEach((to) => {
    const routeName = to.name;

    // Allow whitelisted routes without project selection
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