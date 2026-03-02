import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
    apiGetTraineePlanDetails,
    apiGetTraineePlanStatus,
    apiStartTraineePlan,
    apiUpdateTraineePlanProgress,
} from '@/services/TraineeService'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
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
    PiBarbellDuotone,
} from 'react-icons/pi'
import type { TraineePlanDetails, PlanStatusData } from '@/@types/api'

const PlanDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [plan, setPlan] = useState<TraineePlanDetails | null>(null)
    const [status, setStatus] = useState<PlanStatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [starting, setStarting] = useState(false)
    const [exerciseStatuses, setExerciseStatuses] = useState<
        Record<string, 'pending' | 'completed'>
    >({})
    const [mealStatuses, setMealStatuses] = useState<
        Record<string, 'pending' | 'completed'>
    >({})
    const [selectedDay, setSelectedDay] = useState<number>(1)

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
                // Initialize item-level statuses (use persisted completion when available)
                const exercises = planResponse.data.planExercises || []
                const meals = planResponse.data.meals || []
                const completionStatus: any =
                    planResponse.data.completionStatus || {}
                const completedExerciseIds =
                    (completionStatus.completed_exercise_ids as
                        | string[]
                        | undefined) || []
                const completedMealIds =
                    (completionStatus.completed_meal_ids as
                        | string[]
                        | undefined) || []
                setExerciseStatuses(
                    exercises.reduce(
                        (acc, ex) => ({
                            ...acc,
                            [ex.id]: completedExerciseIds.includes(ex.id)
                                ? 'completed'
                                : 'pending',
                        }),
                        {} as Record<string, 'pending' | 'completed'>,
                    ),
                )
                setMealStatuses(
                    meals.reduce(
                        (acc, meal) => ({
                            ...acc,
                            [meal.id]: completedMealIds.includes(meal.id)
                                ? 'completed'
                                : 'pending',
                        }),
                        {} as Record<string, 'pending' | 'completed'>,
                    ),
                )
                if (statusResponse?.data) {
                    setStatus(statusResponse.data)
                    const totalDays = statusResponse.data.totalDays
                    if (typeof totalDays === 'number' && totalDays >= 1) {
                        setSelectedDay(1)
                    }
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

    // Derived plan status – must be declared before any early return
    const effectiveStatus = useMemo(() => {
        const planStatus = plan?.status
        const completionStatus = plan?.completionStatus.status

        return {
            planStatus,
            completionStatus,
        }
    }, [plan])

    const canStartPlan =
        effectiveStatus.planStatus === 'active' &&
        plan?.completionStatus.status === 'not_started'

    const isInProgress =
        effectiveStatus.planStatus === 'active' &&
        plan?.completionStatus.status === 'in_progress'

    const isCompleted = plan?.completionStatus.status === 'completed'

    const handleStartPlan = useCallback(async () => {
        if (!id || !canStartPlan) return
        try {
            setStarting(true)
            const response = await apiStartTraineePlan(id)
            const updated = response.data

            setPlan((prev) =>
                prev
                    ? {
                          ...prev,
                          completionStatus: {
                              completion_percentage:
                                  updated.completion_percentage,
                              status: updated.status,
                              last_updated: updated.last_updated,
                          },
                      }
                    : prev,
            )
            if (status) {
                setStatus({
                    ...status,
                    completion_percentage: updated.completion_percentage,
                    status: updated.status,
                    last_updated: updated.last_updated,
                })
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to start the plan',
            )
        } finally {
            setStarting(false)
        }
    }, [id, canStartPlan, status])

    const isReadOnly =
        effectiveStatus.planStatus === 'draft' ||
        effectiveStatus.planStatus === 'archived' ||
        isCompleted

    // Compute simple local completion from item-level statuses
    const localCompletionPercentage = useMemo(() => {
        if (!plan || isCompleted) {
            return plan?.completionStatus.completion_percentage ?? 0
        }

        const totalExercises = plan.planExercises?.length ?? 0
        const totalMeals = plan.meals.length ?? 0
        const totalItems = totalExercises + totalMeals
        if (totalItems === 0) {
            return plan.completionStatus.completion_percentage
        }

        let completedItems = 0
        plan.planExercises?.forEach((ex) => {
            if (exerciseStatuses[ex.id] === 'completed') completedItems += 1
        })
        plan.meals.forEach((meal) => {
            if (mealStatuses[meal.id] === 'completed') completedItems += 1
        })

        return Math.round((completedItems / totalItems) * 100)
    }, [plan, exerciseStatuses, mealStatuses, isCompleted])

    const syncPlanProgress = useCallback(
        async (
            nextExerciseStatuses: Record<string, 'pending' | 'completed'>,
            nextMealStatuses: Record<string, 'pending' | 'completed'>,
        ) => {
            if (!id) return
            try {
                const completedExerciseIds = Object.entries(
                    nextExerciseStatuses,
                )
                    .filter(([, value]) => value === 'completed')
                    .map(([key]) => key)

                const completedMealIds = Object.entries(nextMealStatuses)
                    .filter(([, value]) => value === 'completed')
                    .map(([key]) => key)

                const response = await apiUpdateTraineePlanProgress({
                    planId: id,
                    completedExerciseIds,
                    completedMealIds,
                })

                const updated = response.data

                setPlan((prev) =>
                    prev
                        ? {
                              ...prev,
                              completionStatus: {
                                  completion_percentage:
                                      updated.completion_percentage,
                                  status: updated.status,
                                  last_updated: updated.last_updated,
                              },
                          }
                        : prev,
                )
                if (status) {
                    setStatus({
                        ...status,
                        completion_percentage: updated.completion_percentage,
                        status: updated.status,
                        last_updated: updated.last_updated,
                    })
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to update plan progress',
                )
            }
        },
        [id, status],
    )

    const toggleExerciseStatus = (id: string) => {
        if (!isInProgress || isReadOnly) return
        setExerciseStatuses((prev) => {
            const next: Record<string, 'pending' | 'completed'> = {
                ...prev,
                [id]: prev[id] === 'completed' ? 'pending' : 'completed',
            }
            // Fire and forget API sync; UI already updated optimistically
            void syncPlanProgress(next, mealStatuses)
            return next
        })
    }

    const toggleMealStatus = (id: string) => {
        if (!isInProgress || isReadOnly) return
        setMealStatuses((prev) => {
            const next: Record<string, 'pending' | 'completed'> = {
                ...prev,
                [id]: prev[id] === 'completed' ? 'pending' : 'completed',
            }
            void syncPlanProgress(exerciseStatuses, next)
            return next
        })
    }

    if (loading) {
        return <CustomIndicator />
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

    const totalDaysFromPlan =
        (plan as any).totalDays && typeof (plan as any).totalDays === 'number'
            ? ((plan as any).totalDays as number)
            : status?.totalDays ?? null

    const clampedSelectedDay =
        totalDaysFromPlan && totalDaysFromPlan >= 1
            ? Math.min(Math.max(selectedDay, 1), totalDaysFromPlan)
            : selectedDay

    const visibleExercises = plan.planExercises
        ? plan.planExercises.filter(
              (ex) => (ex.day_index ?? 1) === clampedSelectedDay,
          )
        : []

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
                                        {status.daysRemaining != null &&
                                            status.daysRemaining > 0 && (
                                            <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                <PiFireDuotone className="w-4 h-4" />
                                                {status.daysRemaining} days remaining
                                            </span>
                                        )}
                                    </div>
                                )}
                                {totalDaysFromPlan && totalDaysFromPlan > 0 && (
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Plan length:{' '}
                                        <span className="font-semibold">
                                            {totalDaysFromPlan} day
                                            {totalDaysFromPlan > 1 ? 's' : ''}
                                        </span>
                                    </p>
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
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Status
                                </h3>
                                <div className="flex items-center gap-3 flex-wrap">
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

                                    {effectiveStatus.planStatus ===
                                        'active' && (
                                        <Button
                                            size="sm"
                                            variant={canStartPlan ? 'solid' : 'plain'}
                                            disabled={!canStartPlan || starting}
                                            loading={starting}
                                            onClick={handleStartPlan}
                                        >
                                            {canStartPlan
                                                ? 'Start Plan'
                                                : isInProgress
                                                ? 'In Progress'
                                                : 'Completed'}
                                        </Button>
                                    )}

                                    {effectiveStatus.planStatus ===
                                        'draft' && (
                                        <Tag className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                                            Draft (view only)
                                        </Tag>
                                    )}

                                    {effectiveStatus.planStatus ===
                                        'archived' && (
                                        <Tag className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0">
                                            Archived (view only)
                                        </Tag>
                                    )}
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
                                                {localCompletionPercentage}%
                                            </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${
                                                localCompletionPercentage >= 75
                                                    ? 'bg-green-500'
                                                    : localCompletionPercentage >=
                                                      50
                                                    ? 'bg-yellow-500'
                                                    : 'bg-blue-500'
                                            }`}
                                            style={{
                                                width: `${
                                                    localCompletionPercentage
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

            {/* Day selector for execution */}
            {totalDaysFromPlan && totalDaysFromPlan > 0 && (
                <Card>
                    <div className="p-4 flex flex-wrap items-center gap-3 justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                View plan for day
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Exercises and meals below are filtered by the selected day.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Day:
                            </span>
                            <Select
                                className="min-w-[110px]"
                                value={{
                                    value: clampedSelectedDay,
                                    label: `Day ${clampedSelectedDay}`,
                                }}
                                options={Array.from(
                                    { length: totalDaysFromPlan },
                                    (_v, i) => ({
                                        value: i + 1,
                                        label: `Day ${i + 1}`,
                                    }),
                                )}
                                onChange={(option) => {
                                    if (!option) return
                                    setSelectedDay(option.value as number)
                                }}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Exercises Section (with guide media) */}
            {plan.planExercises && visibleExercises.length > 0 && (
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <PiBarbellDuotone className="w-5 h-5" />
                            Exercises for Day {clampedSelectedDay} (
                            {visibleExercises.length})
                        </h3>
                        <div className="space-y-6">
                            {visibleExercises
                                .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                .map((ex) => (
                                    <div
                                        key={ex.id}
                                        className="relative group"
                                    >
                                        <Card className="bg-gray-50 dark:bg-gray-700/50 overflow-hidden">
                                            <div className="p-4">
                                                <div className="flex items-center justify-between gap-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {ex.name}
                                                    </h4>
                                                    <div
                                                        className="cursor-pointer inline-flex"
                                                        onClick={() =>
                                                            toggleExerciseStatus(ex.id)
                                                        }
                                                    >
                                                        <Tag
                                                            className={`text-xs border-0 ${
                                                                exerciseStatuses[ex.id] ===
                                                                'completed'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {exerciseStatuses[ex.id] ===
                                                            'completed'
                                                                ? 'Completed'
                                                                : 'Pending'}
                                                        </Tag>
                                                    </div>
                                                </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-3">
                                                {ex.exercise_type}
                                                {ex.sub_category && (
                                                    <span className="ml-2">
                                                        · {ex.sub_category}
                                                    </span>
                                                )}
                                                {ex.sets != null && ex.reps != null && (
                                                    <span className="ml-2">
                                                        · {ex.sets} sets × {ex.reps} reps
                                                    </span>
                                                )}
                                                {ex.duration_minutes != null && (
                                                    <span className="ml-2">
                                                        · {ex.duration_minutes} min
                                                    </span>
                                                )}
                                            </p>
                                            {ex.notes && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {ex.notes}
                                                </p>
                                            )}
                                            {/* Guide media: image and/or video (data URL from backend) */}
                                            {ex.guide_image_base64 ||
                                            ex.guide_video_base64 ? (
                                                <div className="flex flex-col gap-4 mt-4">
                                                    {ex.guide_image_base64 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                                How to perform (image)
                                                            </p>
                                                            <img
                                                                src={ex.guide_image_base64}
                                                                alt={`Guide for ${ex.name}`}
                                                                className="max-w-full rounded-lg border border-gray-200 dark:border-gray-600 max-h-80 object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    {ex.guide_video_base64 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                                How to perform (video)
                                                            </p>
                                                            <video
                                                                src={ex.guide_video_base64}
                                                                controls
                                                                className="max-w-full rounded-lg border border-gray-200 dark:border-gray-600 max-h-80"
                                                                playsInline
                                                            >
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                                    No media available for this exercise.
                                                </p>
                                            )}
                                        </div>
                                        </Card>
                                        {effectiveStatus.planStatus === 'active' && (
                                            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="max-w-xs rounded-lg bg-pink-50/95 border border-pink-300 shadow-md px-3 py-2 dark:bg-pink-900/85 dark:border-pink-400">
                                                    <p className="text-xs sm:text-sm font-semibold text-pink-900 dark:text-pink-50 text-center leading-snug">
                                                        <span className="block">
                                                            Finished this exercise?
                                                        </span>
                                                        <span className="block mt-1">
                                                            Click the{' '}
                                                            <span className="font-bold text-blue-700 dark:text-blue-200">
                                                                Pending
                                                            </span>{' '}
                                                            pill
                                                        </span>
                                                        <span className="block mt-1">
                                                            to mark it as{' '}
                                                            <span className="font-bold text-green-700 dark:text-green-300">
                                                                Completed
                                                            </span>
                                                            .
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Meals Section */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <PiForkKnifeDuotone className="w-5 h-5" />
                        Meals for Day {clampedSelectedDay} (
                        {
                            plan.meals.filter(
                                (meal) => (meal as any).day_index ?? 1 === clampedSelectedDay,
                            ).length
                        }
                        )
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
                                const allForType = groupedMeals[mealType] || []
                                const mealsForDay = allForType.filter(
                                    (meal) =>
                                        ((meal as any).day_index ?? 1) ===
                                        clampedSelectedDay,
                                )
                                if (mealsForDay.length === 0) return null

                                return (
                                    <div key={mealType}>
                                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">
                                            {getMealTypeLabel(mealType)} (
                                            {mealsForDay.length})
                                        </h4>
                                        <div className="space-y-4">
                                            {mealsForDay.map((meal) => (
                                                <div
                                                    key={meal.id}
                                                    className="relative group"
                                                >
                                                    <Card className="bg-gray-50 dark:bg-gray-700/50">
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                                <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    {meal.name}
                                                                </h5>
                                                                <div
                                                                    className="cursor-pointer inline-flex"
                                                                    onClick={() =>
                                                                        toggleMealStatus(
                                                                            meal.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Tag
                                                                        className={`text-xs border-0 ${
                                                                            mealStatuses[
                                                                                meal.id
                                                                            ] === 'completed'
                                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                                        }`}
                                                                    >
                                                                        {mealStatuses[
                                                                            meal.id
                                                                        ] === 'completed'
                                                                            ? 'Completed'
                                                                            : 'Pending'}
                                                                    </Tag>
                                                                </div>
                                                            </div>
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
                                                    {effectiveStatus.planStatus === 'active' && (
                                                        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="max-w-xs rounded-lg bg-pink-50/95 border border-pink-300 shadow-md px-3 py-2 dark:bg-pink-900/85 dark:border-pink-400">
                                                                <p className="text-xs sm:text-sm font-semibold text-pink-900 dark:text-pink-50 text-center leading-snug">
                                                                    <span className="block">
                                                                        Finished this meal?
                                                                    </span>
                                                                    <span className="block mt-1">
                                                                        Click the{' '}
                                                                        <span className="font-bold text-blue-700 dark:text-blue-200">
                                                                            Pending
                                                                        </span>{' '}
                                                                        pill
                                                                    </span>
                                                                    <span className="block mt-1">
                                                                        to mark it as{' '}
                                                                        <span className="font-bold text-green-700 dark:text-green-300">
                                                                            Completed
                                                                        </span>
                                                                        .
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
