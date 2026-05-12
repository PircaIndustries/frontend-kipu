// src/domains/team/presentation/routes/team.routes.js

const TeamPage = () => import('../presentation/TeamPage.vue');
const TeamUsersPage = () => import('../presentation/users/teamUsersPage.vue');
const TeamWorkersPage = () => import('../presentation/workers/teamWorkersPage.vue');

const teamRoutes = [
    {
        path: '/team',
        component: TeamPage,
        children: [
            { path: '', redirect: '/team/users' },
            {
                path: 'users',
                name: 'team-users',
                component: TeamUsersPage,
                meta: { title: 'Team Users' }
            },
            {
                path: 'workers',
                name: 'team-workers',
                component: TeamWorkersPage,
                meta: { title: 'Team Workers' }
            }
        ]
    }
];

export default teamRoutes;