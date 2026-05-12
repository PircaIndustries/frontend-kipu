import { createRouter, createWebHistory } from 'vue-router';
import teamRoutes from '../domains/team/router/team-router.js';

const routes = [
    ...teamRoutes,
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
    // ── Dashboard / Projects ──
    {
        path: '/dashboard',
        name: 'Dashboard',
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

export default router;