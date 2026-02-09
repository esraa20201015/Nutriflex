import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
    apiGetTraineePlanDetails,
    apiGetTraineePlanStatus,
} from '@/services/TraineeService'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import {
    PiArrowLeftDuotone,
    PiClipboardTextDuotone,
    PiCalendarCheckDuotone,
    PiUserCircleDuotone,
    PiForkKnifeDuotone,
    PiCheckCircleDuotone,
    PiClockDuotone,
    PiPlayCircleDuotone,
    PiFireDuotone,
} from 'react-icons/pi'
import type { TraineePlanDetails, PlanStatusData } from '@/@types/api'

const PlanDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [plan, setPlan] = useState<TraineePlanDetails | null>(null)
    const [status, setStatus] = useState<PlanStatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadPlanDetails = async () => {
            if (!id) return

            try {
                setLoading(true)
                setError(null)
                const [planResponse, statusResponse] = await Promise.all([
                    apiGetTraineePlanDetails(id),
                    apiGetTraineePlanStatus(id).catch(() => null), // Optional
                ])
                setPlan(planResponse.data)
                if (statusResponse?.data) {
                    setStatus(statusResponse.data)
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load plan details',
                )
            } finally {
                setLoading(false)
            }
        }

        loadPlanDetails()
    }, [id])

    // Format date helper
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Ongoing'
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    // Group meals by type
    const groupMealsByType = () => {
        if (!plan?.meals) return {}
        const grouped: Record<string, typeof plan.meals> = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
        }
        plan.meals.forEach((meal) => {
            if (grouped[meal.meal_type]) {
                grouped[meal.meal_type].push(meal)
            }
        })
        return grouped
    }

    // Get meal type label
    const getMealTypeLabel = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1)
    }

    // Get completion badge color
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

    if (error || !plan) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-lg text-red-500 mb-2">Error</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        {error || 'Plan not found'}
                    </p>
                    <Button
                        className="mt-4"
                        onClick={() => navigate('/trainee/plans')}
                    >
                        Back to Plans
                    </Button>
                </div>
            </div>
        )
    }

    const groupedMeals = groupMealsByType()
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="plain"
                    icon={<PiArrowLeftDuotone />}
                    onClick={() => navigate('/trainee/plans')}
                >
                    Back
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{plan.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Nutrition plan details and meals
                    </p>
                </div>
            </div>

            {/* Plan Overview Card */}
            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Description
                                </h3>
                                <p className="text-gray-900 dark:text-gray-100">
                                    {plan.description || 'No description available'}
                                </p>
                            </div>

                            {plan.daily_calories && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                        <PiForkKnifeDuotone className="w-4 h-4" />
                                        Daily Calories
                                    </h3>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {plan.daily_calories} kcal
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                    <PiCalendarCheckDuotone className="w-4 h-4" />
                                    Duration
                                </h3>
                                <p className="text-gray-900 dark:text-gray-100">
                                    {formatDate(plan.start_date)} -{' '}
                                    {formatDate(plan.end_date)}
                                </p>
                                {status && (
                                    <div className="mt-2 flex items-center gap-4 text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {status.daysElapsed} days elapsed
                                        </span>
                                        {status.daysRemaining > 0 && (
                                            <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                <PiFireDuotone className="w-4 h-4" />
                                                {status.daysRemaining} days remaining
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                    <PiUserCircleDuotone className="w-4 h-4" />
                                    Coach
                                </h3>
                                <p className="text-gray-900 dark:text-gray-100">
                                    {plan.coach.fullName}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {plan.coach.email}
                                </p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Status
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag
                                        className={`${getCompletionBadgeColor(
                                            plan.completionStatus.status,
                                        )} border-0`}
                                    >
                                        {plan.completionStatus.status ===
                                        'completed' ? (
                                            <>
                                                <PiCheckCircleDuotone className="w-4 h-4 mr-1" />
                                                Completed
                                            </>
                                        ) : plan.completionStatus.status ===
                                          'in_progress' ? (
                                            <>
                                                <PiPlayCircleDuotone className="w-4 h-4 mr-1" />
                                                In Progress
                                            </>
                                        ) : (
                                            <>
                                                <PiClockDuotone className="w-4 h-4 mr-1" />
                                                Not Started
                                            </>
                                        )}
                                    </Tag>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Completion Progress
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Progress
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {plan.completionStatus.completion_percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${
                                                plan.completionStatus
                                                    .completion_percentage >= 75
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
                            </div>

                            {plan.completionStatus.last_updated && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                        Last Updated
                                    </h3>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {formatDate(
                                            plan.completionStatus.last_updated,
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Meals Section */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <PiForkKnifeDuotone className="w-5 h-5" />
                        Meals ({plan.meals.length})
                    </h3>

                    {plan.meals.length === 0 ? (
                        <div className="text-center py-8">
                            <PiForkKnifeDuotone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-400">
                                No meals added to this plan yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {mealTypes.map((mealType) => {
                                const meals = groupedMeals[mealType] || []
                                if (meals.length === 0) return null

                                return (
                                    <div key={mealType}>
                                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">
                                            {getMealTypeLabel(mealType)} (
                                            {meals.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {meals.map((meal) => (
                                                <Card
                                                    key={meal.id}
                                                    className="bg-gray-50 dark:bg-gray-700/50"
                                                >
                                                    <div className="p-4">
                                                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                            {meal.name}
                                                        </h5>
                                                        {meal.instructions && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                {meal.instructions}
                                                            </p>
                                                        )}
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            {meal.calories !== null && (
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Calories:
                                                                    </span>
                                                                    <span className="font-semibold ml-1">
                                                                        {meal.calories}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {meal.protein !== null && (
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Protein:
                                                                    </span>
                                                                    <span className="font-semibold ml-1">
                                                                        {meal.protein}g
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {meal.carbs !== null && (
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Carbs:
                                                                    </span>
                                                                    <span className="font-semibold ml-1">
                                                                        {meal.carbs}g
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {meal.fats !== null && (
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Fats:
                                                                    </span>
                                                                    <span className="font-semibold ml-1">
                                                                        {meal.fats}g
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default PlanDetails
