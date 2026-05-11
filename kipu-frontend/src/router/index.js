import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/features/projects/presentation/views/ProjectsView.vue')
    },
    {
        path: '/advances',
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
                name: 'NcrRegistry',
                component: () => import('@/features/ncr/presentation/views/NcrListView.vue')
            },
            {
                path: 'new',
                name: 'RegisterNcr',
                component: () => import('@/features/ncr/presentation/views/register-ncr.view.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;