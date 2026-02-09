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
    CoachNutritionPlan,
    CoachMeal,
    MealsListResponse,
    CreatePlanDto,
    UpdatePlanDto,
    CreateMealDto,
    UpdateMealDto,
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

// Coach Plans CRUD Operations
export async function apiCreatePlan(data: CreatePlanDto) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachNutritionPlan>
    >({
        url: '/nutrition-plan',
        method: 'post',
        data,
    })
}

export async function apiUpdatePlan(id: string, data: UpdatePlanDto) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachNutritionPlan>
    >({
        url: `/nutrition-plan/${id}`,
        method: 'put',
        data,
    })
}

export async function apiTogglePlanStatus(id: string) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachNutritionPlan>
    >({
        url: `/nutrition-plan/${id}/toggle-status`,
        method: 'put',
    })
}

export async function apiDeletePlan(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<null>>({
        url: `/nutrition-plan/${id}`,
        method: 'delete',
    })
}

export async function apiSearchPlans(params: {
    coach_id: string
    search?: string
    trainee_id?: string
    status?: string
    skip?: number
    take?: number
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachNutritionPlan[]>
    >({
        url: '/nutrition-plan/search',
        method: 'get',
        params,
    })
}

// Meal CRUD Operations
export async function apiGetPlanMeals(params: {
    nutrition_plan_id: string
    meal_type?: string
    skip?: number
    take?: number
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<CoachMeal[]>
    >({
        url: '/meal',
        method: 'get',
        params,
    })
}

export async function apiCreateMeal(data: CreateMealDto) {
    return ApiService.fetchDataWithAxios<ApiResponse<CoachMeal>>({
        url: '/meal',
        method: 'post',
        data,
    })
}

export async function apiUpdateMeal(id: string, data: UpdateMealDto) {
    return ApiService.fetchDataWithAxios<ApiResponse<CoachMeal>>({
        url: `/meal/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteMeal(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<null>>({
        url: `/meal/${id}`,
        method: 'delete',
    })
}
