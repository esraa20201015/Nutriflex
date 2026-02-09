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
