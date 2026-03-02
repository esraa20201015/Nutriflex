import type { TraineeProgressData } from '@/@types/api'
import Card from '@/components/ui/Card'
import {
    PiTrendUpDuotone,
    PiTrendDownDuotone,
    PiBarbellDuotone,
    PiRulerDuotone,
} from 'react-icons/pi'

interface Props {
    data: TraineeProgressData
}

export default function ProgressChart({ data }: Props) {
    const weightHistory = data?.weightHistory ?? []
    const bodyMeasurements = data?.bodyMeasurements ?? []

    const lastWeightEntry = weightHistory.length
        ? weightHistory[weightHistory.length - 1]
        : null
    const firstWeightEntry =
        weightHistory.length > 1 ? weightHistory[0] : null
    const weightTrend =
        firstWeightEntry && lastWeightEntry
            ? lastWeightEntry.value - firstWeightEntry.value
            : null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight trend */}
            <Card className="rounded-xl border border-gray-200 dark:border-gray-600/60 bg-white dark:bg-gray-800/80 shadow-sm overflow-hidden">
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary-subtle dark:bg-primary/15 text-primary">
                            <PiBarbellDuotone className="w-6 h-6" />
                        </span>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Weight trend
                        </h3>
                    </div>
                    {lastWeightEntry ? (
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {weightTrend !== null ? (
                                <>
                                    {weightTrend < 0 ? (
                                        <PiTrendDownDuotone className="text-success shrink-0" />
                                    ) : (
                                        <PiTrendUpDuotone className="text-warning shrink-0" />
                                    )}
                                    <span>
                                        {weightTrend > 0 ? '+' : ''}
                                        {weightTrend.toFixed(1)} kg
                                    </span>
                                </>
                            ) : (
                                <span>{lastWeightEntry.value.toFixed(1)} kg</span>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                            No weight data yet
                        </p>
                    )}
                    {weightHistory.length > 0 && (
                        <ul className="mt-4 space-y-2 text-sm">
                            {weightHistory.slice(-5).reverse().map((item) => (
                                <li
                                    key={item.date}
                                    className="flex justify-between text-gray-600 dark:text-gray-300"
                                >
                                    <span>{item.date}</span>
                                    <span className="font-semibold text-primary">
                                        {item.value} kg
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Card>

            {/* Body measurements */}
            <Card className="rounded-xl border border-gray-200 dark:border-gray-600/60 bg-white dark:bg-gray-800/80 shadow-sm overflow-hidden">
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-info-subtle dark:bg-info/15 text-info">
                            <PiRulerDuotone className="w-6 h-6" />
                        </span>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Body measurements
                        </h3>
                    </div>
                    {bodyMeasurements.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {bodyMeasurements.slice(-5).reverse().map((item) => (
                                <li
                                    key={item.date}
                                    className="text-gray-600 dark:text-gray-300"
                                >
                                    <span className="font-medium">{item.date}:</span>
                                    {item.waist != null && (
                                        <span className="ml-1">
                                            Waist {item.waist} cm
                                        </span>
                                    )}
                                    {item.chest != null && (
                                        <span className="ml-1">
                                            Chest {item.chest} cm
                                        </span>
                                    )}
                                    {item.waist == null && item.chest == null && (
                                        <span className="ml-1 text-gray-400">—</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                            No measurements yet
                        </p>
                    )}
                </div>
            </Card>
        </div>
    )
}
