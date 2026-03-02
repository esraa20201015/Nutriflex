import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    CreateUserRequest,
    UpdateUserRequest,
    UserResponse,
    UsersListResponse,
    ToggleUserStatusRequest,
} from '@/@types/user'

/**
 * Create a new user (Admin only)
 */
export async function apiCreateUser(data: CreateUserRequest) {
    return ApiService.fetchDataWithAxios<UserResponse, CreateUserRequest>({
        url: endpointConfig.users,
        method: 'post',
        data,
    })
}

/**
 * Get all users with pagination (Admin only)
 */
export async function apiGetUsers(params?: {
    skip?: number
    take?: number
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}) {
    return ApiService.fetchDataWithAxios<UsersListResponse>({
        url: endpointConfig.users,
        method: 'get',
        params,
    })
}

/**
 * Search users by keyword (Admin only). Backend expects query param "search".
 */
export async function apiSearchUsers(keyword: string) {
    return ApiService.fetchDataWithAxios<UsersListResponse>({
        url: endpointConfig.usersSearch,
        method: 'get',
        params: { search: keyword },
    })
}

/**
 * Get user by ID (Admin only)
 */
export async function apiGetUserById(id: string) {
    return ApiService.fetchDataWithAxios<UserResponse>({
        url: `${endpointConfig.users}/${id}`,
        method: 'get',
    })
}

/**
 * Update user (Admin only)
 */
export async function apiUpdateUser(id: string, data: UpdateUserRequest) {
    return ApiService.fetchDataWithAxios<UserResponse, UpdateUserRequest>({
        url: `${endpointConfig.users}/${id}`,
        method: 'put',
        data,
    })
}

/**
 * Toggle user status (ACTIVE/INACTIVE) (Admin only)
 */
export async function apiToggleUserStatus(
    id: string,
    data: ToggleUserStatusRequest,
) {
    return ApiService.fetchDataWithAxios<UserResponse, ToggleUserStatusRequest>({
        url: `${endpointConfig.users}/${id}/toggle-status`,
        method: 'put',
        data,
    })
}

/**
 * Delete user (Admin only)
 */
export async function apiDeleteUser(id: string) {
    return ApiService.fetchDataWithAxios<{
        status: number
        messageEn: string
        messageAr: string
        data: null
    }>({
        url: `${endpointConfig.users}/${id}`,
        method: 'delete',
    })
}
