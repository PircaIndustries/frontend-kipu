import { createRouter, createWebHistory } from 'vue-router';

/**
 * Application routing configuration.
 * Maps navigation paths to their respective view components.
 */
const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        // Using a simple render function as a placeholder for the view
        component: { template: '<h1>Dashboard View</h1>' }
    },
    {
        path: '/advances',
        name: 'Advances',
        component: { template: '<h1>Advances View</h1>' }
    },
    {
        path: '/rnc',
        name: 'RNC',
        component: { template: '<h1>RNC View</h1>' }
    },
    {
        path: '/materials',
        name: 'Materials',
        component: { template: '<h1>Materials View</h1>' }
    },
    {
        path: '/blueprints',
        name: 'Blueprints',
        component: { template: '<h1>Blueprints View</h1>' }
    },
    {
        path: '/signatures',
        name: 'Signatures',
        component: { template: '<h1>Signatures View</h1>' }
    },
    {
        path: '/budget',
        name: 'Budget',
        component: { template: '<h1>Budget View</h1>' }
    },
    {
        path: '/team',
        name: 'Team',
        component: { template: '<h1>Team View</h1>' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;