import { useEffect, useState } from 'react'
import {
    apiGetCoachDashboard,
    apiGetCoachOverview,
    apiGetCoachTraineesProgress,
    apiGetCoachAlerts,
    apiGetCoachRecentActivity,
} from '@/services/CoachService'
import Badge from '@/components/ui/Badge'
import {
    PiUsersThreeDuotone,
    PiUserCircleDuotone,
    PiClipboardTextDuotone,
    PiCheckCircleDuotone,
    PiChartLineUpDuotone,
    PiWarningDuotone,
    PiInfoDuotone,
    PiXCircleDuotone,
    PiPlayCircleDuotone,
} from 'react-icons/pi'
import type {
    CoachDashboardData,
    CoachOverviewData,
    CoachTraineesProgressData,
    CoachAlertsData,
    CoachRecentActivityData,
} from '@/@types/api'

const CoachDashboard = () => {
    const [data, setData] = useState<CoachDashboardData | null>(null)
    const [overview, setOverview] = useState<CoachOverviewData | null>(null)
    const [traineesProgress, setTraineesProgress] =
        useState<CoachTraineesProgressData | null>(null)
    const [coachAlerts, setCoachAlerts] = useState<CoachAlertsData | null>(null)
    const [recentActivity, setRecentActivity] =
        useState<CoachRecentActivityData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true)
                setError(null)
                const [
                    dashboardResponse,
                    overviewResponse,
                    traineesProgressResponse,
                    alertsResponse,
                    recentActivityResponse,
                ] = await Promise.all([
                    apiGetCoachDashboard(),
                    apiGetCoachOverview(),
                    apiGetCoachTraineesProgress(),
                    apiGetCoachAlerts(),
                    apiGetCoachRecentActivity(),
                ])
                setData(dashboardResponse.data)
                setOverview(overviewResponse.data)
                setTraineesProgress(traineesProgressResponse.data)
                setCoachAlerts(alertsResponse.data)
                setRecentActivity(recentActivityResponse.data)
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load dashboard',
                )
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [])

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <PiWarningDuotone className="w-5 h-5 text-yellow-600" />
            case 'error':
                return <PiXCircleDuotone className="w-5 h-5 text-red-600" />
            case 'success':
                return <PiCheckCircleDuotone className="w-5 h-5 text-green-600" />
            default:
                return <PiInfoDuotone className="w-5 h-5 text-blue-600" />
        }
    }

    const getAlertBgColor = (type: string) => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            default:
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-500">Error: {error}</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Coach Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Overview of your coaching activities
                </p>
            </div>

            {/* Assigned Trainees Count - Prominent Card */}
            {(overview?.assignedTrainees !== undefined ||
                data?.assignedTrainees !== undefined) && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-blue-100 mb-2">
                                Assigned Trainees
                            </h3>
                            <p className="text-4xl font-bold text-white">
                                {overview?.assignedTrainees ?? data?.assignedTrainees ?? 0}
                            </p>
                            {(overview?.activeTrainees !== undefined ||
                                data?.activeTrainees !== undefined) && (
                                <p className="text-sm text-blue-100 mt-2">
                                    {overview?.activeTrainees ?? data?.activeTrainees ?? 0}{' '}
                                    active
                                </p>
                            )}
                        </div>
                        <div className="p-4 bg-white/20 rounded-full">
                            <PiUsersThreeDuotone className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {(overview?.activeTrainees !== undefined ||
                    data?.activeTrainees !== undefined) && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Active Trainees
                            </h3>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <PiUserCircleDuotone className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">
                            {overview?.activeTrainees ?? data?.activeTrainees ?? 0}
                        </p>
                        {(overview?.inactiveTrainees !== undefined ||
                            data?.inactiveTrainees !== undefined) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {overview?.inactiveTrainees ?? data?.inactiveTrainees ?? 0}{' '}
                                inactive
                            </p>
                        )}
                    </div>
                )}

                {(overview?.plansCreated !== undefined ||
                    data?.plansCreated !== undefined) && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Plans Created
                            </h3>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <PiClipboardTextDuotone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">
                            {overview?.plansCreated ?? data?.plansCreated ?? 0}
                        </p>
                        {(overview?.completedPlans !== undefined ||
                            data?.completedPlans !== undefined) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {overview?.completedPlans ?? data?.completedPlans ?? 0}{' '}
                                completed
                            </p>
                        )}
                    </div>
                )}

                {overview?.activePlans !== undefined && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Active Plans
                            </h3>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <PiPlayCircleDuotone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">{overview.activePlans}</p>
                        {overview.plansCreated !== undefined &&
                            overview.plansCreated > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {Math.round(
                                        (overview.activePlans / overview.plansCreated) *
                                            100,
                                    )}
                                    % of total plans
                                </p>
                            )}
                    </div>
                )}

                {(overview?.completedPlans !== undefined ||
                    data?.completedPlans !== undefined) && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Completed Plans
                            </h3>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <PiCheckCircleDuotone className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">
                            {overview?.completedPlans ?? data?.completedPlans ?? 0}
                        </p>
                        {(overview?.plansCreated !== undefined ||
                            data?.plansCreated !== undefined) &&
                            (overview?.plansCreated ?? data?.plansCreated ?? 0) > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {Math.round(
                                        ((overview?.completedPlans ??
                                            data?.completedPlans ??
                                            0) /
                                            (overview?.plansCreated ??
                                                data?.plansCreated ??
                                                1)) *
                                            100,
                                    )}
                                    % completion rate
                                </p>
                            )}
                    </div>
                )}

                {data?.averageCompletionRate !== undefined && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Avg. Completion
                            </h3>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <PiChartLineUpDuotone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">
                            {data.averageCompletionRate}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Average across all plans
                        </p>
                    </div>
                )}
            </div>

            {/* Trainee Table */}
            {data?.trainees && data.trainees.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Trainees Overview</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Track progress and activity of your trainees
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Trainee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Active Plan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Last Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.trainees.map((trainee) => (
                                    <tr key={trainee.traineeId}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {trainee.traineeName}
                                            </div>
                                            {trainee.traineeEmail && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {trainee.traineeEmail}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                                {trainee.activePlan || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {trainee.completionPercentage !==
                                                undefined && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${trainee.completionPercentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {trainee.completionPercentage}%
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {trainee.lastActivity
                                                ? new Date(
                                                      trainee.lastActivity,
                                                  ).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                className={
                                                    trainee.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : trainee.status === 'INACTIVE'
                                                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }
                                            >
                                                {trainee.status || 'N/A'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Trainee Progress Summary (last 30 days) */}
            {traineesProgress?.trainees &&
                traineesProgress.trainees.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold">
                                Trainee Progress (Last 30 Days)
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Weight changes and completion rates for your trainees
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Trainee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Current Weight
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            30-day Change
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Completion Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Last Activity
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {traineesProgress.trainees.map((tp) => (
                                        <tr key={tp.traineeId}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {tp.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {tp.currentWeight !== undefined
                                                    ? `${tp.currentWeight} kg`
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {tp.weightChange30Days !== undefined ? (
                                                    <span
                                                        className={
                                                            tp.weightChange30Days < 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : tp.weightChange30Days > 0
                                                                  ? 'text-red-600 dark:text-red-400'
                                                                  : 'text-gray-600 dark:text-gray-300'
                                                        }
                                                    >
                                                        {tp.weightChange30Days > 0 ? '+' : ''}
                                                        {tp.weightChange30Days} kg
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {tp.completionRate !== undefined
                                                    ? `${tp.completionRate}%`
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {tp.lastActivity
                                                    ? new Date(
                                                          tp.lastActivity,
                                                      ).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            {/* Alerts, Attention Needed & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data?.alerts && data.alerts.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold">
                                Alerts & Notifications
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Important updates and reminders
                            </p>
                        </div>
                        <div className="p-6 space-y-3">
                            {data.alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border ${getAlertBgColor(
                                        alert.type || 'info',
                                    )}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getAlertIcon(alert.type || 'info')}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {alert.message}
                                            </p>
                                            {alert.createdAt && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(
                                                        alert.createdAt,
                                                    ).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(coachAlerts?.alerts && coachAlerts.alerts.length > 0) ||
                (recentActivity?.activities &&
                    recentActivity.activities.length > 0) ? (
                    <div className="space-y-4">
                        {coachAlerts?.alerts && coachAlerts.alerts.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold">
                                        Trainees Needing Attention
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Focus on trainees with potential issues
                                    </p>
                                </div>
                                <div className="p-6 space-y-2">
                                    {coachAlerts.alerts.map((alert) => (
                                        <div
                                            key={`${alert.traineeId}-${alert.reason}`}
                                            className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-gray-800 dark:text-gray-100"
                                        >
                                            <span className="font-semibold">
                                                Trainee:
                                            </span>{' '}
                                            {alert.traineeId}{' '}
                                            <span className="mx-1">•</span>
                                            <span>{alert.reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recentActivity?.activities &&
                            recentActivity.activities.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold">
                                            Recent Activity
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Latest updates from your trainees
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
                                        {recentActivity.activities.map(
                                            (activity, index) => (
                                                <div
                                                    key={`${activity.type}-${activity.trainee}-${activity.date}-${index}`}
                                                    className="flex items-start justify-between text-sm"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {activity.type ===
                                                            'WEIGHT_UPDATE'
                                                                ? 'Weight Update'
                                                                : activity.type ===
                                                                    'PLAN_COMPLETED'
                                                                  ? 'Plan Completed'
                                                                  : activity.type}
                                                        </p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {activity.trainee}
                                                            {activity.value
                                                                ? ` • ${activity.value}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(
                                                            activity.date,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default CoachDashboard
