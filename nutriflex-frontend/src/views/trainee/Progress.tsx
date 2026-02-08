import { useEffect, useState } from 'react'
import {
    apiGetHealthMetric,
    apiGetBodyMeasurements,
    apiGetTraineeProgress,
} from '@/services/TraineeService'
import { useSessionUser } from '@/store/authStore'
import type {
    HealthMetric,
    BodyMeasurement,
    TraineeProgress,
} from '@/@types/api'

const Progress = () => {
    const [weightMetrics, setWeightMetrics] = useState<HealthMetric[]>([])
    const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
    const [progress, setProgress] = useState<TraineeProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const user = useSessionUser((state) => state.user)

    useEffect(() => {
        const loadProgress = async () => {
            if (!user.id) return

            try {
                setLoading(true)
                setError(null)

                const [weightResp, measurementsResp, progressResp] =
                    await Promise.all([
                        apiGetHealthMetric({
                            trainee_id: user.id,
                            metric_type: 'weight',
                        }),
                        apiGetBodyMeasurements(user.id),
                        apiGetTraineeProgress({
                            trainee_id: user.id,
                        }),
                    ])

                setWeightMetrics(weightResp.data.metrics || [])
                setMeasurements(measurementsResp.data.measurements || [])
                setProgress(progressResp.data.progress || [])
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
    }, [user.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading progress...</div>
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
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Progress</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Track your fitness journey
                </p>
            </div>

            <div className="space-y-6">
                {/* Weight Metrics */}
                {weightMetrics.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Weight History
                        </h3>
                        <div className="space-y-2">
                            {weightMetrics.slice(0, 10).map((metric) => (
                                <div
                                    key={metric.id}
                                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                >
                                    <span className="text-sm">
                                        {new Date(
                                            metric.recordedAt,
                                        ).toLocaleDateString()}
                                    </span>
                                    <span className="font-semibold">
                                        {metric.value} kg
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Body Measurements */}
                {measurements.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Body Measurements
                        </h3>
                        <div className="space-y-2">
                            {measurements.slice(0, 10).map((measurement) => (
                                <div
                                    key={measurement.id}
                                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                                >
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        {new Date(
                                            measurement.recordedAt,
                                        ).toLocaleDateString()}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        {measurement.measurements.chest && (
                                            <div>
                                                Chest: {measurement.measurements.chest} cm
                                            </div>
                                        )}
                                        {measurement.measurements.waist && (
                                            <div>
                                                Waist: {measurement.measurements.waist} cm
                                            </div>
                                        )}
                                        {measurement.measurements.hips && (
                                            <div>
                                                Hips: {measurement.measurements.hips} cm
                                            </div>
                                        )}
                                        {measurement.measurements.arms && (
                                            <div>
                                                Arms: {measurement.measurements.arms} cm
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Summary */}
                {progress.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Progress Summary
                        </h3>
                        <div className="space-y-2">
                            {progress.map((p, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                                >
                                    {p.weightChange !== undefined && (
                                        <div className="text-sm">
                                            Weight Change:{' '}
                                            <span
                                                className={`font-semibold ${
                                                    p.weightChange >= 0
                                                        ? 'text-green-500'
                                                        : 'text-red-500'
                                                }`}
                                            >
                                                {p.weightChange >= 0 ? '+' : ''}
                                                {p.weightChange} kg
                                            </span>
                                        </div>
                                    )}
                                    {p.bodyFatChange !== undefined && (
                                        <div className="text-sm">
                                            Body Fat Change:{' '}
                                            <span className="font-semibold">
                                                {p.bodyFatChange}%
                                            </span>
                                        </div>
                                    )}
                                    {p.muscleMassChange !== undefined && (
                                        <div className="text-sm">
                                            Muscle Mass Change:{' '}
                                            <span className="font-semibold">
                                                {p.muscleMassChange} kg
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {weightMetrics.length === 0 &&
                    measurements.length === 0 &&
                    progress.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No progress data available
                        </div>
                    )}
            </div>
        </div>
    )
}

export default Progress
