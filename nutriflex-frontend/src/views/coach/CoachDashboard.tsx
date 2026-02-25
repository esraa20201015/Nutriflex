import { useEffect, useState } from 'react'
import {
    apiGetCoachDashboard,
    apiGetCoachOverview,
    apiGetCoachTraineesProgress,
    apiGetCoachAlerts,
    apiGetCoachRecentActivity,
} from '@/services/CoachService'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Progress from '@/components/ui/Progress/Progress'
import {
    PiUsersThreeDuotone,
    PiUserCircleDuotone,
    PiClipboardTextDuotone,
    PiCheckCircleDuotone,
    PiChartLineUpDuotone,
    PiWarningDuotone,
    PiPlayCircleDuotone,
    PiTrendDownDuotone,
    PiTrendUpDuotone,
    PiRulerDuotone,
    PiCalendarCheckDuotone,
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
                    err instanceof Error
                        ? err.message
                        : 'Failed to load dashboard',
                )
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [])

    // Format date helper
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    // Get relative date (e.g., "3 days ago")
    const getRelativeDate = (dateString: string | null) => {
        if (!dateString) return 'No activity'
        const date = new Date(dateString)
        const today = new Date()
        const diffTime = today.getTime() - date.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return `${Math.floor(diffDays / 30)} months ago`
    }

    const getInitials = (name: string) => {
        if (!name) return '?'
        const parts = name.split(' ').filter(Boolean)
        const first = parts[0]?.[0] ?? ''
        const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
        const letters = `${first}${last}`.toUpperCase()
        return letters || '?'
    }

    const totalAssigned =
        data?.assignedTrainees ?? overview?.assignedTrainees ?? 0
    const activeCount =
        data?.activeTrainees ?? overview?.activeTrainees ?? 0
    const inactiveCount =
        data?.inactiveTrainees ?? overview?.inactiveTrainees ?? 0
    const totalPlans = overview?.plansCreated ?? data?.plansCreated ?? 0
    const activePlans = overview?.activePlans ?? 0
    const draftPlans = overview?.draftPlans ?? 0
    const archivedPlans = overview?.archivedPlans ?? 0

    const percent = (value: number, total: number) =>
        total > 0 ? Math.round((value / total) * 100) : 0

    const activeTraineesPercent = percent(activeCount, totalAssigned)
    const inactiveTraineesPercent = percent(inactiveCount, totalAssigned)
    const activePlansPercent = percent(activePlans, totalPlans)
    const draftPlansPercent = percent(draftPlans, totalPlans)
    const archivedPlansPercent = percent(archivedPlans, totalPlans)

    if (loading) {
        return <CustomIndicator />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-lg text-red-500 mb-2">Error</p>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
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

            {/* Summary Cards – two columns on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Plans Created & Status Distribution (with circular summary) */}
                {totalPlans > 0 && (
                    <Card className="h-full">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            Plans Created
                                        </h3>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {totalPlans}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <PiClipboardTextDuotone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Distribution of your plans by status
                                </p>
                                <div className="mt-2 space-y-2">
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <PiPlayCircleDuotone className="w-3 h-3 text-green-500" />
                                                Active
                                            </span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {activePlansPercent}%
                                            </span>
                                        </div>
                                        <Progress
                                            percent={activePlansPercent}
                                            variant="line"
                                            customColorClass="bg-green-500"
                                            showInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <PiClipboardTextDuotone className="w-3 h-3 text-yellow-500" />
                                                Draft
                                            </span>
                                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                                {draftPlansPercent}%
                                            </span>
                                        </div>
                                        <Progress
                                            percent={draftPlansPercent}
                                            variant="line"
                                            customColorClass="bg-yellow-500"
                                            showInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <PiChartLineUpDuotone className="w-3 h-3 text-gray-500" />
                                                Inactive
                                            </span>
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                                                {archivedPlansPercent}%
                                            </span>
                                        </div>
                                        <Progress
                                            percent={archivedPlansPercent}
                                            variant="line"
                                            customColorClass="bg-gray-400"
                                            showInfo={false}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <Progress
                                    variant="circle"
                                    percent={activePlansPercent}
                                    customColorClass="text-green-500"
                                    width={140}
                                    customInfo={
                                        <div className="flex flex-col items-center text-xs font-semibold text-gray-900 dark:text-gray-100">
                                            <span className="text-lg">
                                                {activePlansPercent}%
                                            </span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                Active Plans
                                            </span>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    </Card>
                )}

                {/* Trainees Status (Active vs Inactive) */}
                {totalAssigned > 0 && (
                    <Card className="h-full">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            Trainees Status
                                        </h3>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {totalAssigned}{' '}
                                            <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                                                total
                                            </span>
                                        </p>
                                    </div>
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <PiUsersThreeDuotone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Breakdown of active vs inactive trainees
                                </p>
                                <div className="mt-2 space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <PiUserCircleDuotone className="w-3 h-3 text-green-500" />
                                                Active ({activeCount})
                                            </span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {activeTraineesPercent}%
                                            </span>
                                        </div>
                                        <Progress
                                            percent={activeTraineesPercent}
                                            variant="line"
                                            customColorClass="bg-green-500"
                                            showInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <PiUserCircleDuotone className="w-3 h-3 text-gray-400" />
                                                Inactive ({inactiveCount})
                                            </span>
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                                                {inactiveTraineesPercent}%
                                            </span>
                                        </div>
                                        <Progress
                                            percent={inactiveTraineesPercent}
                                            variant="line"
                                            customColorClass="bg-gray-400"
                                            showInfo={false}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <Progress
                                    variant="circle"
                                    percent={activeTraineesPercent}
                                    customColorClass="text-green-500"
                                    width={140}
                                    customInfo={
                                        <div className="flex flex-col items-center text-xs font-semibold text-gray-900 dark:text-gray-100">
                                            <span className="text-lg">
                                                {activeTraineesPercent}%
                                            </span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                Active Trainees
                                            </span>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Alerts Section */}
            {coachAlerts && (
                <Card>
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <PiWarningDuotone className="w-5 h-5 text-yellow-500" />
                            <h3 className="text-lg font-semibold">
                                Trainees Needing Attention
                                {coachAlerts.alerts.length > 0 && (
                                    <span className="ml-2 text-base">
                                        ({coachAlerts.alerts.length})
                                    </span>
                                )}
                            </h3>
                        </div>
                        {coachAlerts.alerts.length > 0 ? (
                            <div className="space-y-2">
                                {coachAlerts.alerts.map((alert, index) => {
                                    // Find trainee name from progress data
                                    const trainee = traineesProgress?.trainees.find(
                                        (t) => t.traineeId === alert.traineeId,
                                    )
                                    return (
                                        <div
                                            key={`${alert.traineeId}-${index}`}
                                            className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                                        >
                                            <div className="flex items-start gap-3">
                                                <PiWarningDuotone className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {trainee?.name || 'Unknown trainee'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {alert.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <PiCheckCircleDuotone className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    ✅ No alerts
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    All trainees are active and up to date!
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Trainees Progress Table */}
            {traineesProgress && (
                <Card>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">
                            My Trainees Progress
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Track progress and activity of your trainees
                        </p>
                    </div>
                    {traineesProgress.trainees.length > 0 ? (
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
                                            30-Day Change
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Completion Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Completed Plans
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Last Activity
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {traineesProgress.trainees.map((trainee) => {
                                        const isWeightLoss =
                                            trainee.weightChange30Days !== null &&
                                            trainee.weightChange30Days < 0
                                        const isWeightGain =
                                            trainee.weightChange30Days !== null &&
                                            trainee.weightChange30Days > 0

                                        return (
                                            <tr
                                                key={trainee.traineeId}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                {/* Trainee Name */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {trainee.avatarUrl ? (
                                                            <img
                                                                src={trainee.avatarUrl}
                                                                alt={trainee.name}
                                                                className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">
                                                                {getInitials(trainee.name)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {trainee.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Current Weight */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {trainee.currentWeight !== null ? (
                                                        <div className="flex items-center gap-2">
                                                            <PiRulerDuotone className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {trainee.currentWeight} kg
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            N/A
                                                        </span>
                                                    )}
                                                </td>

                                                {/* 30-Day Weight Change */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {trainee.weightChange30Days !== null ? (
                                                        <div className="flex items-center gap-2">
                                                            {isWeightLoss ? (
                                                                <PiTrendDownDuotone className="w-4 h-4 text-green-500" />
                                                            ) : isWeightGain ? (
                                                                <PiTrendUpDuotone className="w-4 h-4 text-red-500" />
                                                            ) : (
                                                                <PiChartLineUpDuotone className="w-4 h-4 text-gray-400" />
                                                            )}
                                                            <span
                                                                className={`text-sm font-semibold ${
                                                                    isWeightLoss
                                                                        ? 'text-green-600 dark:text-green-400'
                                                                        : isWeightGain
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : 'text-gray-600 dark:text-gray-400'
                                                                }`}
                                                            >
                                                                {isWeightGain ? '+' : ''}
                                                                {trainee.weightChange30Days} kg
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            N/A
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Completion Rate */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 min-w-[100px]">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs text-gray-500">
                                                                    {trainee.completionRate}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all ${
                                                                        trainee.completionRate >= 75
                                                                            ? 'bg-green-500'
                                                                            : trainee.completionRate >= 50
                                                                            ? 'bg-yellow-500'
                                                                            : 'bg-red-500'
                                                                    }`}
                                                                    style={{
                                                                        width: `${trainee.completionRate}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Completed plans count */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {trainee.completedPlansCount ?? 0}
                                                    </span>
                                                </td>

                                                {/* Last Activity */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                                            {formatDate(trainee.lastActivity)}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {getRelativeDate(
                                                                trainee.lastActivity,
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <PiUsersThreeDuotone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No trainees assigned yet
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Start by assigning trainees to track their progress and activity here.
                            </p>
                        </div>
                    )}
                </Card>
            )}

            {/* Recent Activity Feed */}
            {recentActivity && (
                <Card>
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <PiCalendarCheckDuotone className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-semibold">
                                Recent Activity
                            </h3>
                        </div>
                        {recentActivity.activities.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {recentActivity.activities.map(
                                    (activity, index) => (
                                        <div
                                            key={`${activity.type}-${activity.trainee}-${activity.date}-${index}`}
                                            className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                        >
                                            <div className="flex items-start gap-3 flex-1">
                                                {activity.type ===
                                                'WEIGHT_UPDATE' ? (
                                                    <PiRulerDuotone className="w-5 h-5 text-blue-500 mt-0.5" />
                                                ) : (
                                                    <PiCheckCircleDuotone className="w-5 h-5 text-green-500 mt-0.5" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {activity.trainee}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {activity.type ===
                                                        'WEIGHT_UPDATE'
                                                            ? `Updated weight: ${activity.value || 'N/A'}`
                                                            : 'Completed a nutrition plan'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(activity.date)}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {getRelativeDate(
                                                        activity.date,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <PiCalendarCheckDuotone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    No recent activity
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Activity from your trainees will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

        </div>
    )
}

export default CoachDashboard
