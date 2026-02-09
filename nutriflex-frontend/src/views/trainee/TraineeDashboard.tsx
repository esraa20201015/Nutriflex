import { useEffect, useState, useMemo } from 'react'
import {
    apiGetTraineeDashboard,
    apiGetTraineeOverview,
    apiGetTraineeDashboardProgress,
    apiGetTraineeToday,
    apiGetTraineeStatus,
} from '@/services/TraineeService'
import Chart from '@/components/shared/Chart'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Tag from '@/components/ui/Tag'
import {
    PiChartBarDuotone,
    PiTrendDownDuotone,
    PiTrendUpDuotone,
    PiClipboardTextDuotone,
    PiFireDuotone,
    PiBarbellDuotone,
    PiForkKnifeDuotone,
    PiCheckCircleDuotone,
    PiXCircleDuotone,
    PiCalendarCheckDuotone,
    PiUserCircleDuotone,
    PiRulerDuotone,
} from 'react-icons/pi'
import type {
    TraineeDashboardMainData,
    TraineeOverviewData,
    TraineeProgressData,
    TraineeTodayData,
    TraineeStatusData,
} from '@/@types/api'

const TraineeDashboard = () => {
    const [mainData, setMainData] = useState<TraineeDashboardMainData | null>(
        null,
    )
    const [overviewData, setOverviewData] =
        useState<TraineeOverviewData | null>(null)
    const [progressData, setProgressData] =
        useState<TraineeProgressData | null>(null)
    const [todayData, setTodayData] = useState<TraineeTodayData | null>(null)
    const [statusData, setStatusData] = useState<TraineeStatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true)
                setError(null)
                const [main, overview, progress, today, status] =
                    await Promise.all([
                        apiGetTraineeDashboard(),
                        apiGetTraineeOverview(),
                        apiGetTraineeDashboardProgress(),
                        apiGetTraineeToday(),
                        apiGetTraineeStatus(),
                    ])
                setMainData(main.data)
                setOverviewData(overview.data)
                setProgressData(progress.data)
                setTodayData(today.data)
                setStatusData(status.data)
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

    // Prepare weight chart data
    const weightChartData = useMemo(() => {
        if (
            !progressData?.weightHistory ||
            progressData.weightHistory.length === 0
        ) {
            return {
                series: [{ name: 'Weight', data: [] }],
                categories: [],
            }
        }

        const sorted = [...progressData.weightHistory].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        return {
            series: [
                {
                    name: 'Weight (kg)',
                    data: sorted.map((item) => item.value),
                },
            ],
            categories: sorted.map((item) => {
                const date = new Date(item.date)
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                })
            }),
        }
    }, [progressData?.weightHistory])

    // Prepare body measurements chart data
    const bodyMeasurementsChartData = useMemo(() => {
        if (
            !progressData?.bodyMeasurements ||
            progressData.bodyMeasurements.length === 0
        ) {
            return {
                series: [],
                categories: [],
            }
        }

        const sorted = [...progressData.bodyMeasurements].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        const waistData = sorted
            .filter((item) => item.waist !== null)
            .map((item) => item.waist as number)
        const chestData = sorted
            .filter((item) => item.chest !== null)
            .map((item) => item.chest as number)

        const categories = sorted
            .filter((item) => item.waist !== null || item.chest !== null)
            .map((item) => {
                const date = new Date(item.date)
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                })
            })

        return {
            series: [
                {
                    name: 'Waist (cm)',
                    data: waistData,
                },
                {
                    name: 'Chest (cm)',
                    data: chestData,
                },
            ],
            categories,
        }
    }, [progressData?.bodyMeasurements])

    // Format date helper
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    // Format short date helper
    const formatShortDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size={40} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-lg text-red-500 mb-2">Error</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        {error}
                    </p>
                </div>
            </div>
        )
    }

    const weightChange30Days = mainData?.weightChange30Days ?? null
    const weightChange7Days = overviewData?.weightChange7Days ?? null
    const isWeightLoss30Days =
        weightChange30Days !== null && weightChange30Days < 0
    const isWeightLoss7Days =
        weightChange7Days !== null && weightChange7Days < 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Trainee Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Your fitness journey overview
                </p>
            </div>

            {/* Main Dashboard Summary - Current Weight Card */}
            {mainData?.currentWeight !== null && (
                <Card
                    className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg"
                    bordered={false}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-blue-100 mb-2">
                                    Current Weight
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-5xl font-bold text-white">
                                        {mainData.currentWeight}
                                    </p>
                                    <span className="text-xl text-blue-100">
                                        kg
                                    </span>
                                </div>
                                {weightChange30Days !== null && (
                                    <div className="flex items-center gap-2 mt-3">
                                        {isWeightLoss30Days ? (
                                            <PiTrendDownDuotone className="w-5 h-5 text-green-200" />
                                        ) : (
                                            <PiTrendUpDuotone className="w-5 h-5 text-red-200" />
                                        )}
                                        <span
                                            className={`text-sm font-semibold ${
                                                isWeightLoss30Days
                                                    ? 'text-green-200'
                                                    : 'text-red-200'
                                            }`}
                                        >
                                            {isWeightLoss30Days ? '' : '+'}
                                            {weightChange30Days} kg in 30 days
                                        </span>
                                    </div>
                                )}
                                {mainData.lastMeasurementDate && (
                                    <p className="text-xs text-blue-100 mt-2">
                                        Last measurement:{' '}
                                        {formatShortDate(
                                            mainData.lastMeasurementDate,
                                        )}
                                    </p>
                                )}
                            </div>
                            <div className="p-4 bg-white/20 rounded-full">
                                <PiChartBarDuotone className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Overview Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Weight Change 7 Days */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                7 Days Change
                            </h3>
                            {weightChange7Days !== null ? (
                                isWeightLoss7Days ? (
                                    <PiTrendDownDuotone className="w-5 h-5 text-green-500" />
                                ) : (
                                    <PiTrendUpDuotone className="w-5 h-5 text-red-500" />
                                )
                            ) : (
                                <PiChartBarDuotone className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {weightChange7Days !== null ? (
                                <>
                                    {isWeightLoss7Days ? '' : '+'}
                                    {weightChange7Days} kg
                                </>
                            ) : (
                                <span className="text-gray-400">N/A</span>
                            )}
                        </p>
                    </div>
                </Card>

                {/* Active Plan */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Active Plan
                            </h3>
                            <PiClipboardTextDuotone className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                            {mainData?.activePlan || (
                                <span className="text-gray-400">No active plan</span>
                            )}
                        </p>
                        {mainData?.completionPercentage !== null && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">
                                        Progress
                                    </span>
                                    <span className="text-xs font-semibold">
                                        {mainData.completionPercentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${mainData.completionPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Days Active This Week */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Active This Week
                            </h3>
                            <PiCalendarCheckDuotone className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {overviewData?.daysActiveThisWeek ?? 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">days</p>
                    </div>
                </Card>

                {/* Plan Completion */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Plan Completion
                            </h3>
                            <PiCheckCircleDuotone className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {overviewData?.planCompletion ?? 0}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {(overviewData?.planCompletion ?? 0) >= 100
                                ? 'Completed'
                                : 'In progress'}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Today's Focus Section */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <PiCalendarCheckDuotone className="w-5 h-5" />
                        Today's Focus
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Workout */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <PiBarbellDuotone className="w-5 h-5 text-blue-500" />
                                    <h4 className="font-semibold">Workout</h4>
                                </div>
                                {todayData?.completedWorkout ? (
                                    <Tag className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 flex items-center gap-1">
                                        <PiCheckCircleDuotone className="w-4 h-4" />
                                        Done
                                    </Tag>
                                ) : (
                                    <Tag className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0 flex items-center gap-1">
                                        <PiXCircleDuotone className="w-4 h-4" />
                                        Pending
                                    </Tag>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {todayData?.todayWorkout || 'No workout planned'}
                            </p>
                        </div>

                        {/* Meals */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <PiForkKnifeDuotone className="w-5 h-5 text-orange-500" />
                                    <h4 className="font-semibold">Meals</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {todayData?.completedMeals ?? 0}
                                </span>
                                <span className="text-gray-500">/</span>
                                <span className="text-xl text-gray-600 dark:text-gray-400">
                                    {todayData?.todayMeals ?? 0}
                                </span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            todayData?.todayMeals
                                                ? (todayData.completedMeals /
                                                      todayData.todayMeals) *
                                                  100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Motivation & Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Streak */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Streak
                            </h3>
                            <PiFireDuotone className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {statusData?.streakDays ?? 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">days</p>
                    </div>
                </Card>

                {/* Last Check-in */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Last Check-in
                            </h3>
                            <PiCalendarCheckDuotone className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatShortDate(statusData?.lastCheckIn ?? null)}
                        </p>
                        {statusData?.lastCheckIn && (
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                    statusData.lastCheckIn,
                                ).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                })}
                            </p>
                        )}
                    </div>
                </Card>

                {/* Coach */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Coach
                            </h3>
                            <PiUserCircleDuotone className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {statusData?.coachName || 'No coach assigned'}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Progress Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weight Progress Chart */}
                {weightChartData.categories.length > 0 && (
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <PiChartBarDuotone className="w-5 h-5" />
                                Weight Progress
                            </h3>
                            <Chart
                                type="line"
                                series={weightChartData.series}
                                xAxis={weightChartData.categories}
                                height={300}
                                customOptions={{
                                    colors: ['#3b82f6'],
                                    stroke: {
                                        curve: 'smooth',
                                        width: 3,
                                    },
                                    markers: {
                                        size: 5,
                                        hover: {
                                            size: 7,
                                        },
                                    },
                                    yaxis: {
                                        title: {
                                            text: 'Weight (kg)',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </Card>
                )}

                {/* Body Measurements Chart */}
                {bodyMeasurementsChartData.categories.length > 0 && (
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <PiRulerDuotone className="w-5 h-5" />
                                Body Measurements
                            </h3>
                            <Chart
                                type="line"
                                series={bodyMeasurementsChartData.series}
                                xAxis={bodyMeasurementsChartData.categories}
                                height={300}
                                customOptions={{
                                    colors: ['#8b5cf6', '#ec4899'],
                                    stroke: {
                                        curve: 'smooth',
                                        width: 3,
                                    },
                                    markers: {
                                        size: 5,
                                        hover: {
                                            size: 7,
                                        },
                                    },
                                    yaxis: {
                                        title: {
                                            text: 'Measurement (cm)',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </Card>
                )}
            </div>

            {/* Empty State Messages */}
            {weightChartData.categories.length === 0 &&
                bodyMeasurementsChartData.categories.length === 0 && (
                    <Card>
                        <div className="p-6 text-center">
                            <PiChartBarDuotone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-400">
                                No progress data available yet. Start tracking
                                your measurements to see your progress!
                            </p>
                        </div>
                    </Card>
                )}
        </div>
    )
}

export default TraineeDashboard
