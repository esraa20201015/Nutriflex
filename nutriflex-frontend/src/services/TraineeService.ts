import ApiService from './ApiService'
import type {
    ApiResponse,
    TraineeDashboardData,
    PlansListResponse,
    TraineePlanStatusListResponse,
    HealthMetricsListResponse,
    BodyMeasurementsListResponse,
    TraineeProgressResponse,
} from '@/@types/api'

export async function apiGetTraineeDashboard() {
    return ApiService.fetchDataWithAxios<
        ApiResponse<TraineeDashboardData>
    >({
        url: '/dashboard/trainee',
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
