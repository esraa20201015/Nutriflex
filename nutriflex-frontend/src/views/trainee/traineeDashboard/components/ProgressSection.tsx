import { useMemo, useState, useCallback } from 'react'
import Chart from '@/components/shared/Chart'
import Card from '@/components/ui/Card'
import Checkbox from '@/components/ui/Checkbox'
import {
    PiChartBarDuotone,
    PiRulerDuotone,
    PiTrendUpDuotone,
    PiTrendDownDuotone,
} from 'react-icons/pi'
import type { TraineeProgressData } from '@/@types/api'

/** Body measurement type keys and fixed colors for the chart */
const BODY_MEASUREMENT_COLORS: Record<
    'waist' | 'chest' | 'hips' | 'arm' | 'thigh',
    string
> = {
    waist: '#10b981',
    chest: '#f59e0b',
    hips: '#8b5cf6',
    arm: '#06b6d4',
    thigh: '#ec4899',
}

const BODY_TYPES_ORDER: ('waist' | 'chest' | 'hips' | 'arm' | 'thigh')[] = [
    'waist',
    'chest',
    'hips',
    'arm',
    'thigh',
]

interface Props {
    data: TraineeProgressData | null
}

/** Progress section for trainee dashboard: weight change summary, weight history chart, body measurements chart. */
export default function ProgressSection({ data: progressData }: Props) {
    const [selectedBodyTypes, setSelectedBodyTypes] = useState<
        ('waist' | 'chest' | 'hips' | 'arm' | 'thigh')[]
    >(['waist', 'chest', 'hips', 'arm', 'thigh'])

    const handleBodyTypesChange = useCallback((next: string[]) => {
        if (next.length === 0) {
            setSelectedBodyTypes(['waist'])
            return
        }
        setSelectedBodyTypes(next as ('waist' | 'chest' | 'hips' | 'arm' | 'thigh')[])
    }, [])
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
        const hasValidMeasurements = records.some((item) => {
            return (
                item.waist !== null ||
                item.chest !== null ||
                item.hips != null ||
                item.arm != null ||
                item.thigh != null
            )
        })
        return {
            hasAnyRecords: true,
            hasValidMeasurements,
            totalRecords: records.length,
        }
    }, [progressData?.bodyMeasurements])

    const hasBodyMeasurementsData = bodyMeasurementStats.hasValidMeasurements

    const bodyMeasurementsChartData = useMemo(() => {
        if (!hasBodyMeasurementsData) return { series: [], categories: [], colors: [] as string[] }
        const sorted = [...(progressData?.bodyMeasurements || [])].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )
        const validEntries = sorted.filter((item) => {
            return (
                item.waist !== null ||
                item.chest !== null ||
                item.hips != null ||
                item.arm != null ||
                item.thigh != null
            )
        })
        const waistData: (number | null)[] = []
        const chestData: (number | null)[] = []
        const hipsData: (number | null)[] = []
        const armData: (number | null)[] = []
        const thighData: (number | null)[] = []
        const categories: string[] = []
        validEntries.forEach((item) => {
            categories.push(
                new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
            )
            waistData.push(item.waist ?? null)
            chestData.push(item.chest ?? null)
            hipsData.push(item.hips ?? null)
            armData.push(item.arm ?? null)
            thighData.push(item.thigh ?? null)
        })
        const typeToData: Record<
            'waist' | 'chest' | 'hips' | 'arm' | 'thigh',
            (number | null)[]
        > = {
            waist: waistData,
            chest: chestData,
            hips: hipsData,
            arm: armData,
            thigh: thighData,
        }
        const typeToLabel: Record<
            'waist' | 'chest' | 'hips' | 'arm' | 'thigh',
            string
        > = {
            waist: 'Waist (cm)',
            chest: 'Chest (cm)',
            hips: 'Hips (cm)',
            arm: 'Arm (cm)',
            thigh: 'Thigh (cm)',
        }
        const series: { name: string; data: (number | null)[] }[] = []
        const colors: string[] = []
        BODY_TYPES_ORDER.forEach((key) => {
            if (!selectedBodyTypes.includes(key)) return
            const data = typeToData[key]
            if (data.some((val) => val !== null)) {
                series.push({ name: typeToLabel[key], data })
                colors.push(BODY_MEASUREMENT_COLORS[key])
            }
        })
        return { series, categories, colors }
    }, [
        progressData?.bodyMeasurements,
        hasBodyMeasurementsData,
        selectedBodyTypes,
    ])

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
                        <Checkbox.Group
                            value={selectedBodyTypes}
                            onChange={(next) => handleBodyTypesChange(next as string[])}
                            className="mb-4 flex flex-wrap items-center gap-4"
                        >
                            {BODY_TYPES_ORDER.map((key) => (
                                <label
                                    key={key}
                                    className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                                >
                                    <Checkbox value={key} />
                                    <span
                                        className="inline-block w-3 h-3 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: BODY_MEASUREMENT_COLORS[key],
                                        }}
                                    />
                                    <span>
                                        {key === 'waist'
                                            ? 'Waist'
                                            : key === 'chest'
                                              ? 'Chest'
                                              : key === 'hips'
                                                ? 'Hips'
                                                : key === 'arm'
                                                  ? 'Arm'
                                                  : 'Thigh'}{' '}
                                        (cm)
                                    </span>
                                </label>
                            ))}
                        </Checkbox.Group>
                        {bodyMeasurementsChartData.series.length > 0 ? (
                            <>
                                <Chart
                                    type="line"
                                    series={bodyMeasurementsChartData.series}
                                    xAxis={bodyMeasurementsChartData.categories}
                                    height={350}
                                    customOptions={{
                                        colors: bodyMeasurementsChartData.colors,
                                        stroke: { curve: 'smooth', width: 3 },
                                        markers: { size: 5, hover: { size: 7 } },
                                        yaxis: { title: { text: 'Circumference (cm)' } },
                                        tooltip: {
                                            y: {
                                                formatter: (val: number) =>
                                                    val != null ? `${val} cm` : '—',
                                            },
                                        },
                                    }}
                                />
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                                No data for the selected measurement types.
                            </p>
                        )}
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
