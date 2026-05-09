import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: { template: '<h1>Dashboard View</h1>' }
    },
    {
        path: '/advances',
        // CRITICAL: The parent MUST be the Layout to show the Tabs
        component: () => import('@/features/execution/presentation/layouts/AdvancesLayout.vue'),
        children: [
            {
                path: '',
                redirect: '/advances/registry'
            },
            {
                path: 'registry',
                name: 'AdvancesRegistry',
                component: () => import('@/features/execution/presentation/views/AdvancesView.vue')
            },
            {
                path: 'photos',
                name: 'PhotoLog',
                component: () => import('@/features/execution/presentation/views/PhotoLogView.vue')
            }
        ]
    },
    {
        path: '/advances/new',
        name: 'CreateAdvance',
        component: () => import('@/features/execution/presentation/views/CreateAdvanceView.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;