import { useEffect, useState, useMemo } from 'react'
import { apiGetTraineeDashboard } from '@/services/TraineeService'
import Chart from '@/components/shared/Chart'
import {
    PiChartBarDuotone,
    PiTrendDownDuotone,
    PiTrendUpDuotone,
    PiClipboardTextDuotone,
    PiHeartDuotone,
    PiBarbellDuotone,
    PiDropDuotone,
} from 'react-icons/pi'
import type { TraineeDashboardData } from '@/@types/api'

const TraineeDashboard = () => {
    const [data, setData] = useState<TraineeDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await apiGetTraineeDashboard()
                setData(response.data)
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

    // Prepare chart data for weight progress
    const chartData = useMemo(() => {
        if (!data?.weightProgress || data.weightProgress.length === 0) {
            return {
                series: [{ name: 'Weight', data: [] }],
                categories: [],
            }
        }

        const sorted = [...data.weightProgress].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        return {
            series: [
                {
                    name: 'Weight (kg)',
                    data: sorted.map((item) => item.weight),
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
    }, [data?.weightProgress])

    // Calculate days remaining for active plan
    const planDaysRemaining = useMemo(() => {
        if (!data?.activePlan?.endDate) return null
        const endDate = new Date(data.activePlan.endDate)
        const today = new Date()
        const diffTime = endDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }, [data?.activePlan?.endDate])

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

    const weightChange = data?.weightChange30Days || 0
    const isWeightLoss = weightChange < 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Trainee Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Your fitness journey overview
                </p>
            </div>

            {/* Weight Card - Prominent */}
            {data?.currentWeight !== undefined && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-blue-100 mb-2">
                                Current Weight
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-5xl font-bold text-white">
                                    {data.currentWeight}
                                </p>
                                <span className="text-xl text-blue-100">kg</span>
                            </div>
                            {data.targetWeight && (
                                <p className="text-sm text-blue-100 mt-2">
                                    Target: {data.targetWeight} kg
                                </p>
                            )}
                            {data.weightChange30Days !== undefined && (
                                <div className="flex items-center gap-2 mt-3">
                                    {isWeightLoss ? (
                                        <PiTrendDownDuotone className="w-5 h-5 text-green-200" />
                                    ) : (
                                        <PiTrendUpDuotone className="w-5 h-5 text-red-200" />
                                    )}
                                    <span
                                        className={`text-sm font-semibold ${
                                            isWeightLoss
                                                ? 'text-green-200'
                                                : 'text-red-200'
                                        }`}
                                    >
                                        {isWeightLoss ? '' : '+'}
                                        {data.weightChange30Days} kg in 30 days
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white/20 rounded-full">
                            <PiChartBarDuotone className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>
            )}

            {/* Active Plan Progress Bar */}
            {data?.activePlan && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">
                                Active Plan: {data.activePlan.name}
                            </h3>
                            {planDaysRemaining !== null && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {planDaysRemaining} days remaining
                                </p>
                            )}
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <PiClipboardTextDuotone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    {data.completionPercentage !== undefined && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Progress
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {data.completionPercentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                    style={{
                                        width: `${data.completionPercentage}%`,
                                    }}
                                >
                                    {data.completionPercentage > 10 && (
                                        <span className="text-xs font-semibold text-white">
                                            {data.completionPercentage}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Progress Chart */}
            {data?.weightProgress && data.weightProgress.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                    <h3 className="text-lg font-semibold mb-4">Weight Progress</h3>
                    <Chart
                        type="line"
                        series={chartData.series}
                        xAxis={chartData.categories}
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
            )}

            {/* Health Summary */}
            {data?.healthSummary && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Health Summary</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your current health metrics
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {data.healthSummary.bmi !== undefined && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                            <PiHeartDuotone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                BMI
                                            </h4>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {data.healthSummary.bmi.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Body Mass Index
                                    </p>
                                </div>
                            )}

                            {data.healthSummary.bodyFat !== undefined && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <PiTrendDownDuotone className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Body Fat
                                            </h4>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {data.healthSummary.bodyFat.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Body fat percentage
                                    </p>
                                </div>
                            )}

                            {data.healthSummary.muscleMass !== undefined && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <PiBarbellDuotone className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Muscle Mass
                                            </h4>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {data.healthSummary.muscleMass.toFixed(1)} kg
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Muscle mass
                                    </p>
                                </div>
                            )}

                            {data.healthSummary.hydration !== undefined && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <PiDropDuotone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Hydration
                                            </h4>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {data.healthSummary.hydration.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Hydration level
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Last Measurement Date */}
            {data?.lastMeasurementDate && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">
                                Last Measurement
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(
                                    data.lastMeasurementDate,
                                ).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TraineeDashboard
