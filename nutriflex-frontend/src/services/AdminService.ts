import ApiService from './ApiService'
import type {
    ApiResponse,
    AdminDashboardData,
    AdminAccountsStatusData,
    AdminActivityData,
    AdminAlertsData,
    UsersListResponse,
    User,
    RolesListResponse,
    Role,
    ApiListCoachesResponse,
    SelectCoachResult,
} from '@/@types/api'

export async function apiGetAdminDashboard() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<AdminDashboardData>
    >({
        url: '/dashboard/admin',
        method: 'get',
    })
}

export async function apiGetAdminAccountsStatus() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<AdminAccountsStatusData>
    >({
        url: '/dashboard/admin/accounts-status',
        method: 'get',
    })
}

export async function apiGetAdminActivity() {
    return ApiService.fetchDataWithAxios<ApiResponse<AdminActivityData>>({
        url: '/dashboard/admin/activity',
        method: 'get',
    })
}

export async function apiGetAdminAlerts() {
    return ApiService.fetchDataWithAxios<ApiResponse<AdminAlertsData>>({
        url: '/dashboard/admin/alerts',
        method: 'get',
    })
}

export async function apiGetUsers(params?: {
    skip?: number
    take?: number
    status?: string
    search?: string
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<UsersListResponse>
    >({
        url: '/users',
        method: 'get',
        params,
    })
}

export async function apiGetUser(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<User>>({
        url: `/users/${id}`,
        method: 'get',
    })
}

export async function apiCreateUser(payload: unknown) {
    return ApiService.fetchDataWithAxios<ApiResponse<User>>({
        url: '/users',
        method: 'post',
        data: payload,
    })
}

export async function apiUpdateUser(id: string, payload: unknown) {
    return ApiService.fetchDataWithAxios<ApiResponse<User>>({
        url: `/users/${id}`,
        method: 'put',
        data: payload,
    })
}

export async function apiDeleteUser(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<{ id: string }>>({
        url: `/users/${id}`,
        method: 'delete',
    })
}

export async function apiGetRoles() {
    return ApiService.fetchDataWithAxios<ApiResponse<Role[]>>({
        url: '/roles',
        method: 'get',
    })
}

export async function apiGetRole(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<Role>>({
        url: `/roles/${id}`,
        method: 'get',
    })
}

export async function apiCreateRole(payload: unknown) {
    return ApiService.fetchDataWithAxios<ApiResponse<Role>>({
        url: '/roles',
        method: 'post',
        data: payload,
    })
}

export async function apiUpdateRole(id: string, payload: unknown) {
    return ApiService.fetchDataWithAxios<ApiResponse<Role>>({
        url: `/roles/${id}`,
        method: 'put',
        data: payload,
    })
}

export async function apiToggleRoleStatus(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<Role>>({
        url: `/roles/${id}/toggle-status`,
        method: 'put',
    })
}

export async function apiDeleteRole(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<{ id: string }>>({
        url: `/roles/${id}`,
        method: 'delete',
    })
}

// Coach assignment (admin)
export async function apiAdminGetAvailableCoaches(params?: {
    trainee_id?: string
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<ApiListCoachesResponse>
    >({
        url: '/coaches/available',
        method: 'get',
        params,
    })
}

export async function apiAdminAssignCoach(traineeId: string, coachId: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<SelectCoachResult>>({
        url: `/admin/trainees/${traineeId}/coach`,
        method: 'post',
        data: { coach_id: coachId },
    })
}
