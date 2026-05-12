const LogisticsPage = () => import('@/domains/logistics/presentation/pages/logistics-page.vue');
const MachineryPage = () => import('@/domains/logistics/presentation/pages/machinery/machinery-page.vue');
const InventoryPage = () => import('@/domains/logistics/presentation/pages/materials/inventory-page.vue');
const RequestsPage = () => import('@/domains/logistics/presentation/pages/requests/request-page.vue');
const SuppliersPage = () => import('@/domains/logistics/presentation/pages/suppliers/suppliers-page.vue');
const WastePage = () => import('@/domains/logistics/presentation/pages/waste/waste-page.vue');

const logisticsRoutes = [
    {
        path: '/logistics',
        component: LogisticsPage,
        children: [
            { path: '', redirect: '/logistics/inventory' },
            {
                path: 'machinery',
                name: 'machinery-list',
                component: MachineryPage,
                meta: { title: 'Machinery page' }
            },
            {
                path: 'inventory',
                name: 'inventory-list',
                component: InventoryPage,
                meta: { title: 'Inventory page' }
            },
            {
                path: 'requests',
                name: 'requests-list',
                component: RequestsPage,
                meta: { title: 'Requests page' }
            },
            {
                path: 'suppliers',
                name: 'suppliers-list',
                component: SuppliersPage,
                meta: { title: 'Suppliers page' }
            },
            {
                path: 'waste',
                name: 'waste-list',
                component: WastePage,
                meta: { title: 'Waste page' }
            }
        ]
    }
];

export default logisticsRoutes;