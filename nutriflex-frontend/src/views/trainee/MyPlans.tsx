import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
    apiGetTraineeMyPlans,
    apiGetTraineePlanStatus,
} from '@/services/TraineeService'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import {
    PiClipboardTextDuotone,
    PiCalendarCheckDuotone,
    PiUserCircleDuotone,
    PiTrendUpDuotone,
    PiCheckCircleDuotone,
    PiClockDuotone,
    PiPlayCircleDuotone,
    PiForkKnifeDuotone,
} from 'react-icons/pi'
import type { TraineeNutritionPlan } from '@/@types/api'

const MyPlans = () => {
    const [plans, setPlans] = useState<TraineeNutritionPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const navigate = useNavigate()

    useEffect(() => {
        const loadPlans = async () => {
            try {
                setLoading(true)
                setError(null)
                const params =
                    statusFilter !== 'all' ? { status: statusFilter } : {}
                const response = await apiGetTraineeMyPlans(params)
                setPlans(response.data || [])
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load plans',
                )
            } finally {
                setLoading(false)
            }
        }

        loadPlans()
    }, [statusFilter])

    // Format date helper
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Ongoing'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    // Calculate days remaining
    const getDaysRemaining = (endDate: string | null) => {
        if (!endDate) return null
        const today = new Date()
        const end = new Date(endDate)
        const diffTime = end.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }

    // Get status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'archived':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            case 'draft':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    // Get completion status badge color
    const getCompletionBadgeColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'in_progress':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            case 'not_started':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }
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
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">My Plans</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    View and manage your assigned nutrition plans
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === 'all'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    All ({plans.length})
                </button>
                <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === 'active'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setStatusFilter('archived')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === 'archived'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    Archived
                </button>
            </div>

            {/* Plans Grid */}
            {plans.length === 0 ? (
                <Card>
                    <div className="p-12 text-center">
                        <PiClipboardTextDuotone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Plans Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {statusFilter === 'all'
                                ? "You don't have any nutrition plans assigned yet."
                                : `You don't have any ${statusFilter} plans.`}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const daysRemaining = getDaysRemaining(plan.end_date)
                        const isActive = plan.status === 'active'
                        const isCompleted =
                            plan.completionStatus.status === 'completed'

                        return (
                            <Card
                                key={plan.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() =>
                                    navigate(`/trainee/plans/${plan.id}`)
                                }
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                {plan.title}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Tag
                                                    className={`${getStatusBadgeColor(
                                                        plan.status,
                                                    )} border-0 text-xs`}
                                                >
                                                    {plan.status === 'active'
                                                        ? 'Active'
                                                        : plan.status ===
                                                          'archived'
                                                        ? 'Archived'
                                                        : 'Draft'}
                                                </Tag>
                                                <Tag
                                                    className={`${getCompletionBadgeColor(
                                                        plan.completionStatus
                                                            .status,
                                                    )} border-0 text-xs flex items-center gap-1`}
                                                >
                                                    {plan.completionStatus
                                                        .status ===
                                                    'completed' ? (
                                                        <PiCheckCircleDuotone className="w-3 h-3" />
                                                    ) : plan.completionStatus
                                                          .status ===
                                                        'in_progress' ? (
                                                        <PiPlayCircleDuotone className="w-3 h-3" />
                                                    ) : (
                                                        <PiClockDuotone className="w-3 h-3" />
                                                    )}
                                                    {plan.completionStatus
                                                        .status === 'completed'
                                                        ? 'Completed'
                                                        : plan.completionStatus
                                                              .status ===
                                                          'in_progress'
                                                        ? 'In Progress'
                                                        : 'Not Started'}
                                                </Tag>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <PiClipboardTextDuotone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {plan.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                            {plan.description}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="space-y-3 mb-4">
                                        {/* Daily Calories */}
                                        {plan.daily_calories && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <PiForkKnifeDuotone className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Daily Calories:
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {plan.daily_calories} kcal
                                                </span>
                                            </div>
                                        )}

                                        {/* Completion Progress */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Progress
                                                </span>
                                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                    {
                                                        plan.completionStatus
                                                            .completion_percentage
                                                    }
                                                    %
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        plan.completionStatus
                                                            .completion_percentage >=
                                                        75
                                                            ? 'bg-green-500'
                                                            : plan.completionStatus
                                                                  .completion_percentage >=
                                                              50
                                                            ? 'bg-yellow-500'
                                                            : 'bg-blue-500'
                                                    }`}
                                                    style={{
                                                        width: `${
                                                            plan.completionStatus
                                                                .completion_percentage
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <PiCalendarCheckDuotone className="w-4 h-4" />
                                            <span>
                                                {formatDate(plan.start_date)} -{' '}
                                                {formatDate(plan.end_date)}
                                            </span>
                                        </div>

                                        {/* Days Remaining */}
                                        {daysRemaining !== null &&
                                            isActive &&
                                            !isCompleted && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <PiTrendUpDuotone className="w-4 h-4 text-orange-500" />
                                                    <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                                        {daysRemaining} days
                                                        remaining
                                                    </span>
                                                </div>
                                            )}
                                    </div>

                                    {/* Coach Info */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <PiUserCircleDuotone className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                Coach:{' '}
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {plan.coach.fullName}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <div className="mt-4">
                                        <Button
                                            size="sm"
                                            variant="solid"
                                            className="w-full"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(
                                                    `/trainee/plans/${plan.id}`,
                                                )
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default MyPlans
