import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import { ADMIN, COACH, TRAINEE } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const landingRoutes: Routes = [
    {
        key: 'landing',
        path: '/',
        component: lazy(() => import('@/pages/LandingPage')),
        authority: [],
    },
]

export const publicRoutes: Routes = [...landingRoutes, ...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'profile',
        path: '/profile',
        component: lazy(() => import('@/views/profile/Profile')),
        authority: [ADMIN, COACH, TRAINEE],
    },
    // Admin routes
    {
        key: 'admin-dashboard',
        path: '/admin/dashboard',
        component: lazy(() => import('@/views/admin/AdminDashboard')),
        authority: [ADMIN],
    },
    {
        key: 'users',
        path: '/admin/users',
        component: lazy(() => import('@/views/users')),
        authority: [ADMIN],
    },
    {
        key: 'roles',
        path: '/admin/roles',
        component: lazy(() => import('@/views/admin/Roles')),
        authority: [ADMIN],
    },
    // Coach routes
    {
        key: 'coach-dashboard',
        path: '/coach/dashboard',
        component: lazy(() => import('@/views/coach/CoachDashboard')),
        authority: [ADMIN, COACH],
    },
    {
        key: 'my-trainees',
        path: '/coach/trainees',
        component: lazy(() => import('@/views/coach/MyTrainees')),
        authority: [ADMIN, COACH],
    },
    {
        key: 'coach-plans',
        path: '/coach/plans',
        component: lazy(() => import('@/views/coach/Plans')),
        authority: [ADMIN, COACH],
    },
    // Trainee routes
    {
        key: 'trainee-dashboard',
        path: '/trainee/dashboard',
        component: lazy(() => import('@/views/trainee/TraineeDashboard')),
        authority: [ADMIN, TRAINEE],
    },
    {
        key: 'my-plans',
        path: '/trainee/plans',
        component: lazy(() => import('@/views/trainee/MyPlans')),
        authority: [ADMIN, TRAINEE],
    },
    {
        key: 'plan-details',
        path: '/trainee/plans/:id',
        component: lazy(() => import('@/views/trainee/PlanDetails')),
        authority: [ADMIN, TRAINEE],
    },
    {
        key: 'progress',
        path: '/trainee/progress',
        component: lazy(() => import('@/views/trainee/Progress')),
        authority: [ADMIN, TRAINEE],
    },
    /** Example purpose only, please remove */
    {
        key: 'singleMenuItem',
        path: '/single-menu-view',
        component: lazy(() => import('@/views/demo/SingleMenuView')),
        authority: [],
    },
    {
        key: 'collapseMenu.item1',
        path: '/collapse-menu-item-view-1',
        component: lazy(() => import('@/views/demo/CollapseMenuItemView1')),
        authority: [],
    },
    {
        key: 'collapseMenu.item2',
        path: '/collapse-menu-item-view-2',
        component: lazy(() => import('@/views/demo/CollapseMenuItemView2')),
        authority: [],
    },
    {
        key: 'groupMenu.single',
        path: '/group-single-menu-item-view',
        component: lazy(() => import('@/views/demo/GroupSingleMenuItemView')),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item1',
        path: '/group-collapse-menu-item-view-1',
        component: lazy(
            () => import('@/views/demo/GroupCollapseMenuItemView1'),
        ),
        authority: [],
    },
    {
        key: 'groupMenu.collapse.item2',
        path: '/group-collapse-menu-item-view-2',
        component: lazy(
            () => import('@/views/demo/GroupCollapseMenuItemView2'),
        ),
        authority: [],
    },
    ...othersRoute,
]
