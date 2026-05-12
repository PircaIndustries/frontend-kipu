import { createRouter, createWebHistory } from 'vue-router';
import teamRoutes from "../domains/team/router/team-router.js";
const routes = [
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

export default router;