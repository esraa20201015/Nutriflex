import ApiService from './ApiService'
import type {
    ApiResponse,
    CoachDashboardData,
    CoachOverviewData,
    CoachTraineesProgressData,
    CoachAlertsData,
    CoachRecentActivityData,
    CoachTraineesListResponse,
    PlansListResponse,
    NutritionPlan,
    TraineePlanStatusListResponse,
} from '@/@types/api'

export async function apiGetCoachDashboard() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachDashboardData>
    >({
        url: '/dashboard/coach',
        method: 'get',
    })
}

export async function apiGetCoachOverview() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachOverviewData>
    >({
        url: '/dashboard/coach/overview',
        method: 'get',
    })
}

export async function apiGetCoachTraineesProgress() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachTraineesProgressData>
    >({
        url: '/dashboard/coach/trainees-progress',
        method: 'get',
    })
}

export async function apiGetCoachAlerts() {
    return ApiService.fetchDataWithAxios<ApiResponse<CoachAlertsData>>({
        url: '/dashboard/coach/alerts',
        method: 'get',
    })
}

export async function apiGetCoachRecentActivity() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachRecentActivityData>
    >({
        url: '/dashboard/coach/recent-activity',
        method: 'get',
    })
}

export async function apiGetCoachTrainees(params?: {
    skip?: number
    take?: number
    status?: string
    coach_id?: string
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachTraineesListResponse>
    >({
        url: '/coach-trainee',
        method: 'get',
        params,
    })
}

export async function apiGetCoachPlans(params?: {
    skip?: number
    take?: number
    status?: string
    coach_id?: string
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<PlansListResponse>
    >({
        url: '/nutrition-plan',
        method: 'get',
        params,
    })
}

export async function apiGetPlan(id: string) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<NutritionPlan>
    >({
        url: `/nutrition-plan/${id}`,
        method: 'get',
    })
}

export async function apiGetPlanStatuses(planId: string) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineePlanStatusListResponse>
    >({
        url: '/trainee-plan-status/search',
        method: 'get',
        params: { plan_id: planId },
    })
}
