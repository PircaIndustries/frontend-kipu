import { createRouter, createWebHistory } from 'vue-router';
import logisticsRoutes from '@/domains/logistics/router/logistics-router.js';

import teamRoutes from "../domains/team/router/team-router.js";
const routes = [
    ...logisticsRoutes,
    ...teamRoutes,
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/domains/project-management/presentation/views/ProjectsView.vue')
    },
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