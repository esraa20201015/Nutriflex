import { useMemo } from 'react'
import Chart from '@/components/shared/Chart'
import Card from '@/components/ui/Card'
import {
    PiChartBarDuotone,
    PiRulerDuotone,
    PiTrendUpDuotone,
    PiTrendDownDuotone,
} from 'react-icons/pi'
import type { TraineeProgressData } from '@/@types/api'

interface Props {
    data: TraineeProgressData | null
}

/** Progress section for trainee dashboard: weight change summary, weight history chart, body measurements chart. */
export default function ProgressSection({ data: progressData }: Props) {
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

    const bodyMeasurementsChartData = useMemo(() => {
        if (!hasBodyMeasurementsData) return { series: [], categories: [] }
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

    const hasWeightData = weightChartData.categories.length > 0
    const hasNoData = !hasWeightData && !hasBodyMeasurementsData

    if (!progressData) return null

    return (
        <div className="space-y-6" id="progress-section">
            {/* Weight change summary */}
            {weightChange && (
                <Card>
                    <div className="p-6 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Overall Weight Change
                            </h3>
                            <div className="flex items-baseline gap-2">
                                {weightChange.change !== 0 ? (
                                    <>
                                        {weightChange.change < 0 ? (
                                            <PiTrendDownDuotone className="w-5 h-5 text-green-500 shrink-0" />
                                        ) : (
                                            <PiTrendUpDuotone className="w-5 h-5 text-red-500 shrink-0" />
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

            {/* Weight history chart */}
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
                            Showing {progressData.weightHistory?.length ?? 0} weight measurements
                        </div>
                    </div>
                </Card>
            ) : !hasNoData ? (
                <Card>
                    <div className="p-8 text-center">
                        <PiChartBarDuotone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            No Weight Data
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Start tracking your weight to see your progress over time
                        </p>
                    </div>
                </Card>
            ) : null}

            {/* Body measurements chart */}
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
            ) : !hasNoData ? (
                <Card>
                    <div className="p-8 text-center">
                        <PiRulerDuotone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {!bodyMeasurementStats.hasAnyRecords
                                ? 'No Body Measurement Records Yet'
                                : 'No Valid Body Measurements'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {!bodyMeasurementStats.hasAnyRecords
                                ? 'Add body measurements to see waist and chest over time.'
                                : 'Entries exist but waist and chest values are missing.'}
                        </p>
                    </div>
                </Card>
            ) : null}

            {hasNoData && (
                <Card>
                    <div className="p-8 text-center">
                        <PiChartBarDuotone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            No Progress Data Yet
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Start tracking your weight and body measurements to see your progress here
                        </p>
                    </div>
                </Card>
            )}
        </div>
    )
}
