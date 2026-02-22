import { useEffect, useState } from 'react'
import { apiGetCoachTraineesProgress } from '@/services/CoachService'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'
import {
    PiTrendDownDuotone,
    PiTrendUpDuotone,
    PiChartBarDuotone,
    PiCalendarCheckDuotone,
    PiUserCircleDuotone,
    PiRulerDuotone,
} from 'react-icons/pi'
import type { CoachTraineeProgressItem } from '@/@types/api'

const MyTrainees = () => {
    const [trainees, setTrainees] = useState<CoachTraineeProgressItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadTrainees = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await apiGetCoachTraineesProgress()
                setTrainees(response.data.trainees || [])
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load trainees',
                )
            } finally {
                setLoading(false)
            }
        }

        loadTrainees()
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
                <h2 className="text-2xl font-bold">My Trainees</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Track progress and activity of your assigned trainees
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Total Trainees
                            </h3>
                            <PiUserCircleDuotone className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {trainees.length}
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Active This Week
                            </h3>
                            <PiCalendarCheckDuotone className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {
                                trainees.filter((t) => {
                                    if (!t.lastActivity) return false
                                    const lastDate = new Date(t.lastActivity)
                                    const weekAgo = new Date()
                                    weekAgo.setDate(weekAgo.getDate() - 7)
                                    return lastDate >= weekAgo
                                }).length
                            }
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Avg. Completion
                            </h3>
                            <PiChartBarDuotone className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {trainees.length > 0
                                ? Math.round(
                                      trainees.reduce(
                                          (sum, t) => sum + t.completionRate,
                                          0,
                                      ) / trainees.length,
                                  )
                                : 0}
                            %
                        </p>
                    </div>
                </Card>
            </div>

            {/* Trainees Table */}
            <Card>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Trainees Progress</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Detailed progress metrics for each trainee
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
                                    30-Day Change
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
                            {trainees.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        <PiUserCircleDuotone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p>No trainees assigned yet</p>
                                    </td>
                                </tr>
                            ) : (
                                trainees.map((trainee) => {
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
                                                    <Avatar
                                                        size={40}
                                                        shape="circle"
                                                        icon={
                                                            <PiUserCircleDuotone className="text-lg" />
                                                        }
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {trainee.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            ID: {trainee.traineeId.slice(0, 8)}...
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
                                                            <PiChartBarDuotone className="w-4 h-4 text-gray-400" />
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

export default MyTrainees
