import ApiService from './ApiService'
import type {
    ApiResponse,
    TraineeDashboardData,
    TraineeDashboardMainData,
    TraineeOverviewData,
    TraineeProgressData,
    TraineeTodayData,
    TraineeStatusData,
    PlansListResponse,
    TraineePlanStatusListResponse,
    HealthMetricsListResponse,
    BodyMeasurementsListResponse,
    TraineeProgressResponse,
    TraineePlansListResponse,
    TraineeNutritionPlan,
    TraineePlanDetails,
    PlanMealsResponse,
    PlanStatusData,
    ApiListCoachesResponse,
    SelectCoachResult,
    CreateCoachTraineeDto,
    CoachTrainee,
} from '@/@types/api'

// New API endpoints for trainee dashboard
export async function apiGetTraineeDashboard() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineeDashboardMainData>
    >({
        url: '/dashboard/trainee',
        method: 'get',
    })
}

export async function apiGetTraineeOverview() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineeOverviewData>
    >({
        url: '/dashboard/trainee/overview',
        method: 'get',
    })
}

export async function apiGetTraineeDashboardProgress() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineeProgressData>
    >({
        url: '/dashboard/trainee/progress',
        method: 'get',
    })
}

export async function apiGetTraineeToday() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineeTodayData>
    >({
        url: '/dashboard/trainee/today',
        method: 'get',
    })
}

export async function apiGetTraineeStatus() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineeStatusData>
    >({
        url: '/dashboard/trainee/status',
        method: 'get',
    })
}

export async function apiGetTraineePlans(params: {
    trainee_id: string
    status?: string
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<PlansListResponse>
    >({
        url: '/nutrition-plan',
        method: 'get',
        params,
    })
}

export async function apiGetTraineePlanStatuses(params: {
    trainee_id: string
    plan_id?: string
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineePlanStatusListResponse>
    >({
        url: '/trainee-plan-status/search',
        method: 'get',
        params,
    })
}

export async function apiGetHealthMetric(params: {
    trainee_id: string
    metric_type: 'weight' | 'steps' | 'heart_rate' | 'bp'
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<HealthMetricsListResponse>
    >({
        url: '/health-metric',
        method: 'get',
        params,
    })
}

export async function apiGetBodyMeasurements(traineeId: string) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<BodyMeasurementsListResponse>
    >({
        url: '/body-measurement',
        method: 'get',
        params: { trainee_id: traineeId },
    })
}

export async function apiGetTraineeProgress(params: {
    trainee_id: string
    period_type?: string
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineeProgressResponse>
    >({
        url: '/trainee-progress',
        method: 'get',
        params,
    })
}

// Trainee Plans API endpoints
export async function apiGetTraineeMyPlans(params?: {
    status?: string
    skip?: number
    take?: number
}) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineeNutritionPlan[]>
    >({
        url: '/plans/trainee',
        method: 'get',
        params,
    })
}

export async function apiGetTraineePlanDetails(planId: string) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineePlanDetails>
    >({
        url: `/plans/trainee/${planId}`,
        method: 'get',
    })
}

export async function apiGetTraineePlanMeals(planId: string) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<PlanMealsResponse>
    >({
        url: `/plans/trainee/${planId}/meals`,
        method: 'get',
    })
}

export async function apiGetTraineePlanStatus(planId: string) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<PlanStatusData>
    >({
        url: `/plans/trainee/${planId}/status`,
        method: 'get',
    })
}

// Coach selection APIs (trainee-facing)
export async function apiGetAvailableCoaches(params?: { trainee_id?: string }) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<ApiListCoachesResponse>
    >({
        url: '/coaches/available',
        method: 'get',
        params,
    })
}

/** Trainee selects a coach (POST /coaches/select). Uses req.user.id for trainee; enforces one active coach per trainee. */
export async function apiSelectCoachForTrainee(data: { coach_id: string }) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<{ coach_id: string; trainee_id: string; status: string }>
    >({
        url: '/coaches/select',
        method: 'post',
        data,
    })
}

/** Generic create coach-trainee (POST /coach-trainee). Used by admin or when explicit trainee_id is needed. */
export async function apiSelectCoach(data: CreateCoachTraineeDto) {
    return ApiService.fetchDataWithAxios<ApiResponse<CoachTrainee>>({
        url: '/coach-trainee',
        method: 'post',
        data,
    })
}
