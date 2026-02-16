import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
    apiGetCoachPlans,
    apiTogglePlanStatus,
    apiDeletePlan,
    apiGetCoachTraineesProgress,
} from '@/services/CoachService'
import { useSessionUser } from '@/store/authStore'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import {
    PiClipboardTextDuotone,
    PiCalendarCheckDuotone,
    PiUserCircleDuotone,
    PiPlusDuotone,
    PiPencilDuotone,
    PiTrashDuotone,
    PiToggleRightDuotone,
    PiToggleLeftDuotone,
    PiForkKnifeDuotone,
} from 'react-icons/pi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { CoachNutritionPlan } from '@/@types/api'

const Plans = () => {
    const [plans, setPlans] = useState<CoachNutritionPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null)
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
    const user = useSessionUser((state) => state.user)
    const navigate = useNavigate()

    useEffect(() => {
        const loadPlans = async () => {
            if (!user.id) return
    
            try {
                setLoading(true)
                setError(null)
    
                const params: { coach_id: string; status?: string } = {
                    coach_id: user.id,
                }
    
                if (statusFilter !== 'all') {
                    params.status = statusFilter
                }
    
                const response = await apiGetCoachPlans(params)
                setPlans(response.data as CoachNutritionPlan[])
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
    }, [user.id, statusFilter])

    const handleToggleStatus = async (planId: string) => {
        if (togglingPlanId) return

        try {
            setTogglingPlanId(planId)
            await apiTogglePlanStatus(planId)
            toast.push(
                <Notification type="success" title="Success">
                    Plan status updated successfully
                </Notification>,
            )
            // Reload plans
            const params: { coach_id: string; status?: string } = {
                coach_id: user.id!,
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter
            }
            const response = await apiGetCoachPlans(params)
            setPlans(response.data as CoachNutritionPlan[])
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to update plan status'
            toast.push(
                <Notification type="danger" title="Error">
                    {message}
                </Notification>,
            )
        } finally {
            setTogglingPlanId(null)
        }
    }

    const handleDelete = async (planId: string) => {
        if (deletingPlanId || !confirm('Are you sure you want to delete this plan? This will also delete all associated meals.')) {
            return
        }

        try {
            setDeletingPlanId(planId)
            await apiDeletePlan(planId)
            toast.push(
                <Notification type="success" title="Success">
                    Plan deleted successfully
                </Notification>,
            )
            // Reload plans
            const params: { coach_id: string; status?: string } = {
                coach_id: user.id!,
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter
            }
            const response = await apiGetCoachPlans(params)
            setPlans(response.data as CoachNutritionPlan[])
            console.log(response.data)
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to delete plan'
            toast.push(
                <Notification type="danger" title="Error">
                    {message}
                </Notification>,
            )
        } finally {
            setDeletingPlanId(null)
        }
    }

    // Format date helper
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Ongoing'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Plans</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your nutrition plans
                    </p>
                </div>
                <Button
                    variant="solid"
                    icon={<PiPlusDuotone />}
                    onClick={() => navigate('/coach/plans/new')}
                >
                    Create Plan
                </Button>
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
                    onClick={() => setStatusFilter('draft')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === 'draft'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    Draft
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
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {statusFilter === 'all'
                                ? "You don't have any nutrition plans yet."
                                : `You don't have any ${statusFilter} plans.`}
                        </p>
                        <Button
                            variant="solid"
                            icon={<PiPlusDuotone />}
                            onClick={() => navigate('/coach/plans/new')}
                        >
                            Create Your First Plan
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                            {plan.title}
                                        </h3>
                                        <Tag
                                            className={`${getStatusBadgeColor(
                                                plan.status,
                                            )} border-0 text-xs`}
                                        >
                                            {plan.status === 'active'
                                                ? 'Active'
                                                : plan.status === 'archived'
                                                ? 'Archived'
                                                : 'Draft'}
                                        </Tag>
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
                                <div className="space-y-2 mb-4">
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

                                    {/* Dates */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <PiCalendarCheckDuotone className="w-4 h-4" />
                                        <span>
                                            {formatDate(plan.start_date)} -{' '}
                                            {formatDate(plan.end_date)}
                                        </span>
                                    </div>

                                    {/* Trainee */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <PiUserCircleDuotone className="w-4 h-4" />
                                        <span>
                                            Trainee:{' '}
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {plan.trainee.fullName}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        icon={<PiPencilDuotone />}
                                        onClick={() =>
                                            navigate(`/coach/plans/${plan.id}`)
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        icon={
                                            plan.status === 'active' ? (
                                                <PiToggleRightDuotone />
                                            ) : (
                                                <PiToggleLeftDuotone />
                                            )
                                        }
                                        onClick={() =>
                                            handleToggleStatus(plan.id)
                                        }
                                        disabled={togglingPlanId === plan.id}
                                    >
                                        {togglingPlanId === plan.id
                                            ? 'Updating...'
                                            : 'Toggle'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        icon={<PiTrashDuotone />}
                                        onClick={() => handleDelete(plan.id)}
                                        disabled={deletingPlanId === plan.id}
                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        {deletingPlanId === plan.id
                                            ? 'Deleting...'
                                            : 'Delete'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Plans
