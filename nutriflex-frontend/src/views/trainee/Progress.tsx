import { useEffect, useState, useMemo } from 'react'
import { apiGetTraineeDashboardProgress } from '@/services/TraineeService'
import Chart from '@/components/shared/Chart'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import {
    PiChartBarDuotone,
    PiRulerDuotone,
    PiTrendUpDuotone,
    PiTrendDownDuotone,
} from 'react-icons/pi'
import type { TraineeProgressData } from '@/@types/api'

const Progress = () => {
    const [progressData, setProgressData] =
        useState<TraineeProgressData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadProgress = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await apiGetTraineeDashboardProgress()
                setProgressData(response.data)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load progress data',
                )
            } finally {
                setLoading(false)
            }
        }

        loadProgress()
    }, [])

    // ----------------------------
    // Weight Chart Data
    // ----------------------------
    const weightChartData = useMemo(() => {
        if (!progressData?.weightHistory || progressData.weightHistory.length === 0) {
            return { series: [{ name: 'Weight', data: [] }], categories: [] }
        }

        const sorted = [...progressData.weightHistory].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        return {
            series: [
                { name: 'Weight (kg)', data: sorted.map((item) => item.value) },
            ],
            categories: sorted.map((item) =>
                new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
            ),
        }
    }, [progressData?.weightHistory])

    // ----------------------------
    // Body Measurement Stats (NEW LOGIC)
    // ----------------------------
    const bodyMeasurementStats = useMemo(() => {
        const records = progressData?.bodyMeasurements || []

        if (records.length === 0) {
            return { hasAnyRecords: false, hasValidMeasurements: false, totalRecords: 0 }
        }

        const hasValidMeasurements = records.some(
            (item) => item.waist !== null || item.chest !== null,
        )

        return {
            hasAnyRecords: true,
            hasValidMeasurements,
            totalRecords: records.length,
        }
    }, [progressData?.bodyMeasurements])

    const hasBodyMeasurementsData = bodyMeasurementStats.hasValidMeasurements

    // ----------------------------
    // Body Measurements Chart Data
    // ----------------------------
    const bodyMeasurementsChartData = useMemo(() => {
        if (!hasBodyMeasurementsData) {
            return { series: [], categories: [] }
        }

        const sorted = [...(progressData?.bodyMeasurements || [])].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        const validEntries = sorted.filter(
            (item) => item.waist !== null || item.chest !== null,
        )

        const waistData: (number | null)[] = []
        const chestData: (number | null)[] = []
        const categories: string[] = []

        validEntries.forEach((item) => {
            categories.push(
                new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
            )
            waistData.push(item.waist)
            chestData.push(item.chest)
        })

        const series = []
        if (waistData.some((val) => val !== null)) {
            series.push({ name: 'Waist (cm)', data: waistData })
        }
        if (chestData.some((val) => val !== null)) {
            series.push({ name: 'Chest (cm)', data: chestData })
        }

        return { series, categories }
    }, [progressData?.bodyMeasurements, hasBodyMeasurementsData])

    // ----------------------------
    // Weight Change
    // ----------------------------
    const weightChange = useMemo(() => {
        if (!progressData?.weightHistory || progressData.weightHistory.length < 2) {
            return null
        }

        const sorted = [...progressData.weightHistory].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        const first = sorted[0].value
        const last = sorted[sorted.length - 1].value

        return {
            change: last - first,
            firstDate: sorted[0].date,
            lastDate: sorted[sorted.length - 1].date,
        }
    }, [progressData?.weightHistory])

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

    const hasWeightData = weightChartData.categories.length > 0
    const hasNoData = !hasWeightData && !hasBodyMeasurementsData

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Progress</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Track your fitness journey over time
                </p>
            </div>

            {/* ---------------- Weight Change Summary ---------------- */}
            {weightChange && (
                <Card>
                    <div className="p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Overall Weight Change
                            </h3>
                            <div className="flex items-baseline gap-2">
                                {weightChange.change !== 0 ? (
                                    <>
                                        {weightChange.change < 0 ? (
                                            <PiTrendDownDuotone className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <PiTrendUpDuotone className="w-5 h-5 text-red-500" />
                                        )}
                                        <span
                                            className={`text-2xl font-bold ${
                                                weightChange.change < 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}
                                        >
                                            {weightChange.change > 0 ? '+' : ''}
                                            {weightChange.change.toFixed(1)} kg
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                        No change
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <div>
                                From:{' '}
                                {new Date(weightChange.firstDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </div>
                            <div>
                                To:{' '}
                                {new Date(weightChange.lastDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* ---------------- Weight Progress Chart ---------------- */}
            {hasWeightData ? (
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <PiChartBarDuotone className="w-5 h-5" />
                            Weight History
                        </h3>
                        <Chart
                            type="line"
                            series={weightChartData.series}
                            xAxis={weightChartData.categories}
                            height={350}
                            customOptions={{
                                colors: ['#3b82f6'],
                                stroke: { curve: 'smooth', width: 3 },
                                markers: { size: 5, hover: { size: 7 } },
                                yaxis: { title: { text: 'Weight (kg)' } },
                                tooltip: {
                                    y: { formatter: (val: number) => `${val} kg` },
                                },
                            }}
                        />
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Showing {progressData?.weightHistory.length || 0} weight measurements
                        </div>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="p-12 text-center">
                        <PiChartBarDuotone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Weight Data
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Start tracking your weight to see your progress over time
                        </p>
                    </div>
                </Card>
            )}

            {/* ---------------- Body Measurements Chart ---------------- */}
            {hasBodyMeasurementsData ? (
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
                            height={350}
                        />
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Showing {bodyMeasurementStats.totalRecords} body measurement records
                        </div>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="p-12 text-center">
                        <PiRulerDuotone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {!bodyMeasurementStats.hasAnyRecords
                                ? 'No Body Measurement Records Yet'
                                : 'No Valid Body Measurements'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {!bodyMeasurementStats.hasAnyRecords
                                ? 'You have not added any body measurement entries yet.'
                                : 'Entries exist, but waist and chest values are missing.'}
                        </p>
                        {bodyMeasurementStats.hasAnyRecords && (
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                Total records found: {bodyMeasurementStats.totalRecords}
                            </p>
                        )}
                    </div>
                </Card>
            )}

            {/* ---------------- Empty State ---------------- */}
            {hasNoData && (
                <Card>
                    <div className="p-12 text-center">
                        <PiChartBarDuotone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Progress Data Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Start tracking your weight and body measurements to see your progress over time
                        </p>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default Progress
