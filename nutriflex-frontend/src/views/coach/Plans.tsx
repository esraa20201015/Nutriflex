import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
    apiGetCoachPlans,
    apiDeletePlan,
} from '@/services/CoachService'
import { useSessionUser } from '@/store/authStore'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import {
    PiClipboardTextDuotone,
    PiCalendarCheckDuotone,
    PiUserCircleDuotone,
    PiPlusDuotone,
    PiPencilDuotone,
    PiTrashDuotone,
    PiForkKnifeDuotone,
} from 'react-icons/pi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { CoachNutritionPlan } from '@/@types/api'

const TAB_STATUSES = ['all', 'draft', 'active', 'archived'] as const

function computeCountsByStatus(planList: CoachNutritionPlan[]): Record<string, number> {
    return {
        all: planList.length,
        draft: planList.filter((p) => p.status === 'draft').length,
        active: planList.filter((p) => p.status === 'active').length,
        archived: planList.filter((p) => p.status === 'archived').length,
    }
}

const Plans = () => {
    const [plans, setPlans] = useState<CoachNutritionPlan[]>([])
    const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>({
        all: 0,
        draft: 0,
        active: 0,
        archived: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
    const [planIdToDelete, setPlanIdToDelete] = useState<string | null>(null)
    const user = useSessionUser((state) => state.user)
    const navigate = useNavigate()

    // Load plans for the current tab; when loading "all", also refresh counts so each tab has a fixed count
    useEffect(() => {
        const loadPlans = async () => {
            if (!user.id) return
            try {
                setLoading(true)
                setError(null)
                const params: { coach_id: string; status?: string } = { coach_id: user.id }
                if (statusFilter !== 'all') params.status = statusFilter
                const response = await apiGetCoachPlans(params)
                const data = response.data ?? []
                setPlans(data)
                if (statusFilter === 'all') {
                    setCountsByStatus(computeCountsByStatus(data))
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load plans')
            } finally {
                setLoading(false)
            }
        }
        loadPlans()
    }, [user.id, statusFilter])

    // Delete plan (called after user confirms in dialog)
    const handleDeleteConfirm = async () => {
        const planId = planIdToDelete
        if (!planId || deletingPlanId) return
        setPlanIdToDelete(null)
        try {
            setDeletingPlanId(planId)
            await apiDeletePlan(planId)
            toast.push(
                <Notification type="success" title="Success">
                    Plan deleted successfully
                </Notification>
            )
            // Reload plans (and refresh counts if on "all" so tab counts stay correct)
            const params: { coach_id: string; status?: string } = { coach_id: user.id! }
            if (statusFilter !== 'all') params.status = statusFilter
            const response = await apiGetCoachPlans(params)
            const data = response.data ?? []
            setPlans(data)
            if (statusFilter === 'all') {
                setCountsByStatus(computeCountsByStatus(data))
            } else {
                setCountsByStatus((prev) => ({ ...prev, [statusFilter]: data.length }))
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete plan'
            toast.push(
                <Notification type="danger" title="Error">
                    {message}
                </Notification>
            )
        } finally {
            setDeletingPlanId(null)
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Ongoing'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'archived':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            case 'draft':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'inactive':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    if (loading) return <CustomIndicator />

    if (error)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-lg text-red-500 mb-2">Error</p>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        )

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

            {/* Filter Tabs: each tab shows its own count from countsByStatus; switching tabs only changes the list */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {TAB_STATUSES.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            statusFilter === status
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)} ({countsByStatus[status] ?? 0})
                    </button>
                ))}
            </div>

            {/* Plans List */}
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
                <div className="flex flex-col gap-4">
                    {plans.map((plan) => (
                        <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                {/* Left side: Title + Status + Description */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {plan.title}
                                        </h3>
                                        <Tag
                                            className={`${getStatusBadgeColor(plan.status)} border-0 text-xs`}
                                        >
                                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                                        </Tag>
                                    </div>
                                    {plan.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {plan.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {plan.daily_calories && (
                                            <div className="flex items-center gap-1">
                                                <PiForkKnifeDuotone className="w-4 h-4" />
                                                {plan.daily_calories} kcal/day
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <PiCalendarCheckDuotone className="w-4 h-4" />
                                            {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <PiUserCircleDuotone className="w-4 h-4" />
                                            {plan.trainee.fullName}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: Actions */}
                                <div className="flex items-center gap-2">
                                    {/* View page */}
                                    <Tooltip title="View">
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            icon={<PiUserCircleDuotone />}
                                            onClick={() => navigate(`/coach/plans/${plan.id}/view`)}
                                        />
                                    </Tooltip>
                                    {/* Edit page */}
                                    <Tooltip title="Edit">
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            icon={<PiPencilDuotone />}
                                            onClick={() => navigate(`/coach/plans/${plan.id}/edit`)}
                                        />
                                    </Tooltip>
                                    {/* Delete */}
                                    <Tooltip title="Delete">
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            icon={<PiTrashDuotone />}
                                            onClick={() => setPlanIdToDelete(plan.id)}
                                            disabled={deletingPlanId === plan.id}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={planIdToDelete !== null}
                type="danger"
                title="Delete plan"
                onClose={() => setPlanIdToDelete(null)}
                onConfirm={handleDeleteConfirm}
                confirmText="Delete"
                cancelText="Cancel"
            >
                <p className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete this plan? This will also
                    delete all associated meals.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default Plans
