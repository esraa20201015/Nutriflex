import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { RequestUser } from '../auth/types/request-user.interface';

/** Single menu item (link) */
interface MenuItem {
  id: string;
  label: string;
  labelAr: string;
  path: string;
  icon?: string;
  roles: string[];
}

/** Category group (e.g. Admin, Coach, Trainee) with items */
interface MenuCategory {
  id: string;
  label: string;
  labelAr: string;
  icon?: string;
  roles: string[]; // Roles that can see this category
  items: MenuItem[];
}

@ApiTags('Menu')
@ApiBearerAuth('access-token')
@Controller('menu')
@UseGuards(RolesGuard)
export class MenuController {
  @Get()
  @ApiOperation({
    summary: 'Get navigation menu by categories',
    description:
      'Returns navigation menu in three categories: Admin, Coach, Trainee. Each category is visible based on user role. ADMIN sees all categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu categories retrieved successfully',
    schema: {
      example: {
        status: 200,
        messageEn: 'Menu retrieved successfully',
        messageAr: 'تم جلب القائمة بنجاح',
        data: {
          categories: [
            {
              id: 'admin',
              label: 'Admin',
              labelAr: 'الإدارة',
              icon: 'admin',
              roles: ['ADMIN'],
              items: [
                { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/admin/dashboard', icon: 'dashboard', roles: ['ADMIN'] },
                { id: 'users', label: 'Users', labelAr: 'المستخدمين', path: '/admin/users', icon: 'users', roles: ['ADMIN'] },
                { id: 'roles', label: 'Roles', labelAr: 'الأدوار', path: '/admin/roles', icon: 'roles', roles: ['ADMIN'] },
              ],
            },
            {
              id: 'coach',
              label: 'Coach',
              labelAr: 'المدرب',
              icon: 'coach',
              roles: ['ADMIN', 'COACH'],
              items: [
                { id: 'coach-dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/coach/dashboard', icon: 'dashboard', roles: ['ADMIN', 'COACH'] },
                { id: 'my-trainees', label: 'My Trainees', labelAr: 'المتدربين', path: '/coach/trainees', icon: 'users', roles: ['ADMIN', 'COACH'] },
                { id: 'plans', label: 'Plans', labelAr: 'الخطط', path: '/coach/plans', icon: 'plan', roles: ['ADMIN', 'COACH'] },
              ],
            },
            {
              id: 'trainee',
              label: 'Trainee',
              labelAr: 'المتدرب',
              icon: 'trainee',
              roles: ['ADMIN', 'TRAINEE'],
              items: [
                { id: 'trainee-dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/trainee/dashboard', icon: 'dashboard', roles: ['ADMIN', 'TRAINEE'] },
                { id: 'my-plans', label: 'My Plans', labelAr: 'خططي', path: '/trainee/plans', icon: 'plan', roles: ['ADMIN', 'TRAINEE'] },
              ],
            },
          ],
          userRole: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMenu(@Request() req: { user?: RequestUser }) {
    const userRole = req.user?.role || '';

    const allCategories: MenuCategory[] = [
      {
        id: 'admin',
        label: 'Admin',
        labelAr: 'الإدارة',
        icon: 'admin',
        roles: ['ADMIN'],
        items: [
          {
            id: 'admin-dashboard',
            label: 'Admin Dashboard',
            labelAr: 'لوحة تحكم الإدارة',
            path: '/admin/dashboard',
            icon: 'dashboard',
            roles: ['ADMIN'],
          },
          {
            id: 'users',
            label: 'Users',
            labelAr: 'المستخدمين',
            path: '/admin/users',
            icon: 'users',
            roles: ['ADMIN'],
          },
          {
            id: 'roles',
            label: 'Roles',
            labelAr: 'الأدوار',
            path: '/admin/roles',
            icon: 'roles',
            roles: ['ADMIN'],
          },
        ],
      },
      {
        id: 'coach',
        label: 'Coach',
        labelAr: 'المدرب',
        icon: 'coach',
        roles: ['ADMIN', 'COACH'],
        items: [
          {
            id: 'coach-dashboard',
            label: 'Coach Dashboard',
            labelAr: 'لوحة تحكم المدرب',
            path: '/coach/dashboard',
            icon: 'dashboard',
            roles: ['ADMIN', 'COACH'],
          },
          {
            id: 'my-trainees',
            label: 'My Trainees',
            labelAr: 'المتدربين',
            path: '/coach/trainees',
            icon: 'users',
            roles: ['ADMIN', 'COACH'],
          },
          {
            id: 'coach-plans',
            label: 'Plans',
            labelAr: 'الخطط',
            path: '/coach/plans',
            icon: 'plan',
            roles: ['ADMIN', 'COACH'],
          },
          // Profile is intentionally NOT in primary sidebar; it should be accessed from the user avatar/account menu in the frontend.
        ],
      },
      {
        id: 'trainee',
        label: 'Trainee',
        labelAr: 'المتدرب',
        icon: 'trainee',
        roles: ['ADMIN', 'TRAINEE'],
        items: [
          {
            id: 'trainee-dashboard',
            label: 'Trainee Dashboard',
            labelAr: 'لوحة تحكم المتدرب',
            path: '/trainee/dashboard',
            icon: 'dashboard',
            roles: ['ADMIN', 'TRAINEE'],
          },
          {
            id: 'my-plans',
            label: 'My Plans',
            labelAr: 'خططي',
            path: '/trainee/plans',
            icon: 'plan',
            roles: ['ADMIN', 'TRAINEE'],
          },
          {
            id: 'trainee-choose-coach',
            label: 'Coaches',
            labelAr: 'المدربون',
            path: '/trainee/choose-coach',
            icon: 'users',
            roles: ['ADMIN', 'TRAINEE'],
          },
          // Progress is not in nav; its content is shown in Trainee Dashboard.
          // Profile is intentionally NOT in primary sidebar; it should be accessed from the user avatar/account menu in the frontend.
        ],
      },
    ];

    // Filter categories and their items by user role
    const filteredCategories = allCategories
      .filter((category) => userRole === 'ADMIN' || category.roles.includes(userRole))
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) => userRole === 'ADMIN' || item.roles.includes(userRole),
        ),
      }))
      .filter((category) => category.items.length > 0);

    return {
      status: 200,
      messageEn: 'Menu retrieved successfully',
      messageAr: 'تم جلب القائمة بنجاح',
      data: {
        categories: filteredCategories,
        userRole,
      },
    };
  }
}
