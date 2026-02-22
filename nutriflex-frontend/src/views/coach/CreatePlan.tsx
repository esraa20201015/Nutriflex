import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    apiCreatePlanWithDetails,
    apiGetPlan,
    apiGetCoachTrainees,
    apiGetPlanMeals,
} from '@/services/CoachService'
import { useSessionUser } from '@/store/authStore'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Steps from '@/components/ui/Steps'
import {
    PiArrowLeftDuotone,
    PiClipboardTextDuotone,
    PiForkKnifeDuotone,
} from 'react-icons/pi'
import {
    HiOutlineLogin,
    HiOutlineClipboardCheck,
    HiOutlineDocumentSearch,
} from 'react-icons/hi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type {
    CoachTrainee,
    CreatePlanWithDetailsDto,
    MealIngredientInputDto,
    PlanExerciseDto,
    PlanMealDto,
} from '@/@types/api'

/** Convert a file to Base64 data URL for sending to backend. Rejects if read fails. */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/** Use full data URL so backend can store and trainee can use as img/video src. */

// Validation schema
const planSchema = z.object({
    trainee_id: z.string().min(1, 'Trainee is required'),
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be less than 255 characters'),
    description: z.string().max(1000, 'Description too long').optional(),
    daily_calories: z
        .number()
        .min(0, 'Calories must be positive')
        .max(10000, 'Calories must be reasonable')
        .nullable()
        .optional(),
    start_date: z.date({ required_error: 'Start date is required' }),
    end_date: z.date().nullable().optional(),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
})

type PlanFormData = z.infer<typeof planSchema>

type ExerciseSubCategory = 'Upper' | 'Core' | 'Lower'

type WizardExercise = PlanExerciseDto & {
    id: string
    subCategory: ExerciseSubCategory
}

type WizardMeal = PlanMealDto & {
    id: string
    ingredients: MealIngredientInputDto[]
}

type WizardStep = 0 | 1 | 2

const CreatePlan = () => {
    const { id } = useParams<{ id?: string }>()
    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)
    const isEditMode = !!id

    const [currentStep, setCurrentStep] = useState<WizardStep>(0)
    const [trainees, setTrainees] = useState<CoachTrainee[]>([])
    const [loadingTrainees, setLoadingTrainees] = useState(true)
    const [loading, setLoading] = useState(isEditMode)
    const [saving, setSaving] = useState(false)

    // Wizard state for exercises and meals
    const [exercises, setExercises] = useState<WizardExercise[]>([])
    const [meals, setMeals] = useState<WizardMeal[]>([])

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        trigger,
        getValues,
    } = useForm<PlanFormData>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            status: 'draft',
            daily_calories: null,
            description: '',
            end_date: null,
        },
    })

    useEffect(() => {
        const loadTrainees = async () => {
            if (!user.id) return
    
            try {
                setLoadingTrainees(true)
    
                const response = await apiGetCoachTrainees({
                    coach_id: user.id,
                })
    
                setTrainees(response.data as CoachTrainee[])
            } catch (error) {
                console.error('Failed to load trainees', error)
    
                toast.push(
                    <Notification type="danger" title="Error">
                        Failed to load trainees
                    </Notification>,
                )
            } finally {
                setLoadingTrainees(false)
            }
        }
    
        loadTrainees()
    }, [user.id])
    
    // Load plan data if editing
    useEffect(() => {
        const loadPlan = async () => {
            if (!id || !isEditMode) return

            try {
                setLoading(true)
                const response = await apiGetPlan(id)
                const plan = response.data

                reset({
                    trainee_id: (plan as any).trainee_id ?? (plan as any).traineeId ?? '',
                    title: (plan as any).title ?? (plan as any).name ?? '',
                    description: (plan as any).description ?? '',
                    daily_calories:
                        (plan as any).daily_calories ??
                        (plan as any).dailyCalories ??
                        null,
                    start_date: (plan as any).start_date
                        ? new Date((plan as any).start_date)
                        : new Date(),
                    end_date: (plan as any).end_date
                        ? new Date((plan as any).end_date)
                        : null,
                    status:
                        ((plan as any).status as 'draft' | 'active' | 'archived') ||
                        'draft',
                })
            } catch (err) {
                toast.push(
                    <Notification type="danger" title="Error">
                        Failed to load plan details
                    </Notification>,
                )
                navigate('/coach/plans')
            } finally {
                setLoading(false)
            }
        }

        loadPlan()
    }, [id, isEditMode, reset, navigate])

    const onSubmit = async (data: PlanFormData) => {
        if (!user.id) return

        try {
            setSaving(true)

            const base: CreatePlanWithDetailsDto = {
                coach_id: user.id,
                trainee_id: data.trainee_id,
                title: data.title,
                description: data.description || null,
                daily_calories: data.daily_calories || null,
                start_date: data.start_date.toISOString(),
                end_date: data.end_date?.toISOString() || null,
                status: data.status,
                exercises: exercises.map((ex, idx) => ({
                    exercise_id: ex.exercise_id,
                    name: ex.name,
                    exercise_type: ex.exercise_type,
                    day_index: ex.day_index ?? 1,
                    sets: ex.sets ?? null,
                    reps: ex.reps ?? null,
                    duration_minutes: ex.duration_minutes ?? null,
                    notes: ex.notes ?? null,
                    guide_image_base64: ex.guide_image_base64 ?? null,
                    guide_video_base64: ex.guide_video_base64 ?? null,
                    order_index: ex.order_index ?? idx + 1,
                })),
                meals: meals.map((meal, idx) => ({
                    meal_type: meal.meal_type,
                    name: meal.name,
                    calories:
                        meal.calories ??
                        meal.ingredients?.reduce(
                            (sum, ing) => sum + (ing.calories ?? 0),
                            0,
                        ) ?? null,
                    instructions: meal.instructions ?? null,
                    order_index: meal.order_index ?? idx + 1,
                    ingredients: meal.ingredients,
                })),
            }

            await apiCreatePlanWithDetails(base)

            toast.push(
                <Notification type="success" title="Success">
                    {isEditMode
                        ? 'Plan saved successfully'
                        : 'Plan created and assigned successfully'}
                </Notification>,
            )

            navigate('/coach/plans')
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : isEditMode
                    ? 'Failed to update plan'
                    : 'Failed to create plan'

            toast.push(
                <Notification type="danger" title="Error">
                    {message}
                </Notification>,
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading || loadingTrainees) {
        return <CustomIndicator />
    }

    const traineeOptions = trainees
        .filter((ct) => ct.trainee) // ensure ct.trainee is defined
        .map((ct) => ({
            value: ct.trainee!.id,
            label: ct.trainee!.fullName || 'Unknown Trainee',
        }));


    const stepTitles = ['Plan Info', 'Exercises', 'Meals']

    const goToNextStep = async () => {
        if (currentStep === 0) {
            // validate basic plan info before moving on
            const isValid = await trigger([
                'trainee_id',
                'title',
                'start_date',
                'status',
            ])
            if (!isValid) return
        }
        setCurrentStep((prev: WizardStep) => Math.min((prev + 1), 2) as WizardStep)
    }

    const goToPreviousStep = () => {
        setCurrentStep((prev: WizardStep) =>
            Math.max(prev - 1, 0) as WizardStep
        )
    }

    const totalMealCalories = meals.reduce((planSum, meal) => {
        const mealTotal =
            meal.calories ??
            meal.ingredients?.reduce(
                (sum, ing) => sum + (ing.calories ?? 0),
                0,
            ) ?? 0
        return planSum + mealTotal
    }, 0)

    const dailyCalories = getValues('daily_calories') ?? null
    const caloriesProgress =
        dailyCalories && dailyCalories > 0
            ? Math.min(100, Math.round((totalMealCalories / dailyCalories) * 100))
            : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="plain"
                    icon={<PiArrowLeftDuotone />}
                    onClick={() => navigate('/coach/plans')}
                >
                    Back
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                        {isEditMode ? 'Edit Plan' : 'Create New Plan'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isEditMode
                            ? 'Update nutrition plan details'
                            : 'Create a new nutrition plan for a trainee'}
                    </p>
                </div>
            </div>

            {/* Wizard */}
            <Card>
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4 pb-3">
                    <Steps current={currentStep}>
                        <Steps.Item
                            title={stepTitles[0]}
                            customIcon={<HiOutlineLogin />}
                        />
                        <Steps.Item
                            title={stepTitles[1]}
                            customIcon={<HiOutlineDocumentSearch />}
                        />
                        <Steps.Item
                            title={stepTitles[2]}
                            customIcon={<PiForkKnifeDuotone />}
                        />
                    </Steps>
                </div>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 space-y-6">
                        {currentStep === 0 && (
                            <>
                               {/* Trainee Selection */}
                <FormItem
                    label="Trainee"
                    invalid={!!errors.trainee_id}
                    errorMessage={errors.trainee_id?.message}
                >
                            <Controller
                                name="trainee_id"
                                control={control}
                                rules={{ required: 'Please select a trainee' }}
                                render={({ field }) => (
                                    <Select
                                    options={traineeOptions}
                                    value={traineeOptions.find(opt => opt.value === field.value) || null}
                                    onChange={(option) => field.onChange(option ? option.value : '')}
                                    placeholder={loading ? 'Loading trainees...' : 'Select a trainee'}
                                    isDisabled={isEditMode || loading}
                                    isLoading={loading}
                            />
                        )}
                    />
                                </FormItem>
                                {/* Title */}
                                <FormItem
                                    label="Plan Title"
                                    invalid={!!errors.title}
                                    errorMessage={errors.title?.message}
                                >
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="e.g., Summer Weight Loss Plan"
                                            />
                                        )}
                                    />
                                </FormItem>

                                {/* Description */}
                                <FormItem
                                    label="Description"
                                    invalid={!!errors.description}
                                    errorMessage={errors.description?.message}
                                >
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                textArea
                                                rows={4}
                                                placeholder="Plan description (optional)"
                                            />
                                        )}
                                    />
                                </FormItem>

                                {/* Daily Calories */}
                                <FormItem
                                    label="Daily Calories (kcal)"
                                    invalid={!!errors.daily_calories}
                                    errorMessage={errors.daily_calories?.message}
                                >
                                    <Controller
                                        name="daily_calories"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="e.g., 2000"
                                                value={
                                                    field.value === null
                                                        ? ''
                                                        : field.value
                                                }
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    field.onChange(
                                                        value === ''
                                                            ? null
                                                            : Number(value),
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </FormItem>

                                {/* Date Range */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem
                                        label="Start Date"
                                        invalid={!!errors.start_date}
                                        errorMessage={errors.start_date?.message}
                                    >
                                        <Controller
                                            name="start_date"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    {...field}
                                                    value={field.value}
                                                    onChange={(date) =>
                                                        field.onChange(date)
                                                    }
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="End Date (Optional)"
                                        invalid={!!errors.end_date}
                                        errorMessage={errors.end_date?.message}
                                    >
                                        <Controller
                                            name="end_date"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    {...field}
                                                    value={field.value || undefined}
                                                    onChange={(date) =>
                                                        field.onChange(
                                                            date || null,
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </div>

                                {/* Status */}
                                <FormItem
                                    label="Status"
                                    invalid={!!errors.status}
                                    errorMessage={errors.status?.message}
                                >
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => {
                                            const statusOptions = [
                                                { value: 'draft', label: 'Draft' },
                                                { value: 'active', label: 'Active' },
                                                {
                                                    value: 'archived',
                                                    label: 'Archived',
                                                },
                                            ]
                                            return (
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find(
                                                        (opt) =>
                                                            opt.value ===
                                                            field.value,
                                                    )}
                                                    onChange={(option) =>
                                                        field.onChange(
                                                            option
                                                                ? (option.value as
                                                                      | 'draft'
                                                                      | 'active'
                                                                      | 'archived')
                                                                : 'draft',
                                                        )
                                                    }
                                                />
                                            )
                                        }}
                                    />
                                </FormItem>
                            </>
                        )}

                        {currentStep === 1 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <HiOutlineDocumentSearch className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold">
                                        Exercises
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Select exercise categories and add exercises
                                    per day, including notes and basic metrics.
                                </p>
                                {/* For now, keep this simple list – can be extended with full category UI */}
                                <Button
                                    type="button"
                                    variant="default"
                                    className="mb-4"
                                    onClick={() => {
                                        setExercises((prev) => [
                                            ...prev,
                                            {
                                                id: `${Date.now()}-${prev.length}`,
                                                name: '',
                                                exercise_type: 'cardio',
                                                subCategory: 'Upper',
                                                day_index: 1,
                                                sets: null,
                                                reps: null,
                                                duration_minutes: null,
                                                notes: null,
                                                guide_image_base64: null,
                                                guide_video_base64: null,
                                                order_index: prev.length + 1,
                                            },
                                        ])
                                    }}
                                >
                                    + Add Exercise
                                </Button>
                                <div className="space-y-3">
                                    {exercises.map((ex, index) => (
                                        <div
                                            key={ex.id}
                                            className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3"
                                        >
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                                    Name
                                                </label>
                                                <Input
                                                    value={ex.name}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        setExercises((prev) =>
                                                            prev.map((row) =>
                                                                row.id === ex.id
                                                                    ? {
                                                                          ...row,
                                                                          name: value,
                                                                      }
                                                                    : row,
                                                            ),
                                                        )
                                                    }}
                                                    placeholder="Exercise name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                                    Type
                                                </label>
                                                <Select
                                                    options={[
                                                        {
                                                            value: 'cardio',
                                                            label: 'Cardio',
                                                        },
                                                        {
                                                            value: 'strength',
                                                            label: 'Strength',
                                                        },
                                                        {
                                                            value: 'calisthenics',
                                                            label: 'Calisthenics',
                                                        },
                                                    ]}
                                                    value={{
                                                        value: ex.exercise_type,
                                                        label:
                                                            ex.exercise_type.charAt(
                                                                0,
                                                            ).toUpperCase() +
                                                            ex.exercise_type.slice(
                                                                1,
                                                            ),
                                                    }}
                                                    onChange={(option) => {
                                                        if (!option) return
                                                        setExercises((prev) =>
                                                            prev.map((row) =>
                                                                row.id === ex.id
                                                                    ? {
                                                                          ...row,
                                                                          exercise_type:
                                                                              option.value as PlanExerciseDto['exercise_type'],
                                                                      }
                                                                    : row,
                                                            ),
                                                        )
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                                    Day
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={ex.day_index ?? 1}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value === ''
                                                                ? 1
                                                                : Number(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                        setExercises((prev) =>
                                                            prev.map((row) =>
                                                                row.id === ex.id
                                                                    ? {
                                                                          ...row,
                                                                          day_index:
                                                                              value,
                                                                      }
                                                                    : row,
                                                            ),
                                                        )
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                                    Sets x Reps
                                                </label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Sets"
                                                        value={ex.sets ?? ''}
                                                        onChange={(e) => {
                                                            const value =
                                                                e.target
                                                                    .value === ''
                                                                    ? null
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      )
                                                            setExercises(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (
                                                                            row,
                                                                        ) =>
                                                                            row.id ===
                                                                            ex.id
                                                                                ? {
                                                                                      ...row,
                                                                                      sets: value,
                                                                                  }
                                                                                : row,
                                                                    ),
                                                            )
                                                        }}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="Reps"
                                                        value={ex.reps ?? ''}
                                                        onChange={(e) => {
                                                            const value =
                                                                e.target
                                                                    .value === ''
                                                                    ? null
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      )
                                                            setExercises(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (
                                                                            row,
                                                                        ) =>
                                                                            row.id ===
                                                                            ex.id
                                                                                ? {
                                                                                      ...row,
                                                                                      reps: value,
                                                                                  }
                                                                                : row,
                                                                    ),
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 flex gap-2 justify-end">
                                                <Button
                                                    type="button"
                                                    variant="plain"
                                                    className="text-xs"
                                                    onClick={() =>
                                                        setExercises((prev) =>
                                                            prev.filter(
                                                                (row) =>
                                                                    row.id !==
                                                                    ex.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            {/* Guide media: shown only when exercise row exists (after Add Exercise) */}
                                            <div className="md:col-span-6 flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Guide for trainee:
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    id={`guide-image-${ex.id}`}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (!file) return
                                                        try {
                                                            const dataUrl = await fileToBase64(file)
                                                            setExercises((prev) =>
                                                                prev.map((row) =>
                                                                    row.id === ex.id
                                                                        ? { ...row, guide_image_base64: dataUrl }
                                                                        : row,
                                                                ),
                                                            )
                                                        } catch {
                                                            toast.push(
                                                                <Notification type="danger" title="Upload failed">
                                                                    Could not read image file.
                                                                </Notification>,
                                                            )
                                                        }
                                                        e.target.value = ''
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => document.getElementById(`guide-image-${ex.id}`)?.click()}
                                                >
                                                    {ex.guide_image_base64 ? 'Change Image' : 'Upload Image'}
                                                </Button>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    id={`guide-video-${ex.id}`}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (!file) return
                                                        try {
                                                            const dataUrl = await fileToBase64(file)
                                                            setExercises((prev) =>
                                                                prev.map((row) =>
                                                                    row.id === ex.id
                                                                        ? { ...row, guide_video_base64: dataUrl }
                                                                        : row,
                                                                ),
                                                            )
                                                        } catch {
                                                            toast.push(
                                                                <Notification type="danger" title="Upload failed">
                                                                    Could not read video file.
                                                                </Notification>,
                                                            )
                                                        }
                                                        e.target.value = ''
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => document.getElementById(`guide-video-${ex.id}`)?.click()}
                                                >
                                                    {ex.guide_video_base64 ? 'Change Video' : 'Upload Video'}
                                                </Button>
                                                {(ex.guide_image_base64 || ex.guide_video_base64) && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {ex.guide_image_base64 && 'Image attached'}
                                                        {ex.guide_image_base64 && ex.guide_video_base64 && ' · '}
                                                        {ex.guide_video_base64 && 'Video attached'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {exercises.length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No exercises added yet. Use “+ Add
                                            Exercise” to start building a
                                            workout for this plan.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <PiForkKnifeDuotone className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold">
                                        Meals & Ingredients
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Add meals with structured ingredients. We’ll
                                    calculate total calories and compare them
                                    against the daily goal.
                                </p>

                                <div className="grid gap-4">
                                    {(['breakfast', 'lunch', 'dinner'] as const).map(
                                        (mealType, idx) => {
                                            const sectionMeals = meals.filter(
                                                (m) => m.meal_type === mealType,
                                            )
                                            const label =
                                                mealType.charAt(0).toUpperCase() +
                                                mealType.slice(1)
                                            return (
                                                <Card
                                                    key={mealType}
                                                    className="bg-black/40 bg-cover bg-center text-white"
                                                >
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-base font-semibold">
                                                                {label}
                                                            </h4>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="solid"
                                                                onClick={() => {
                                                                    setMeals(
                                                                        (prev) => [
                                                                            ...prev,
                                                                            {
                                                                                id: `${mealType}-${Date.now()}-${prev.length}`,
                                                                                meal_type:
                                                                                    mealType,
                                                                                name: `${label} Meal`,
                                                                                calories: null,
                                                                                instructions:
                                                                                    null,
                                                                                order_index:
                                                                                    idx +
                                                                                    1,
                                                                                ingredients:
                                                                                    [],
                                                                            },
                                                                        ],
                                                                    )
                                                                }}
                                                            >
                                                                + Add Meal
                                                            </Button>
                                                        </div>

                                                        {sectionMeals.length ===
                                                        0 ? (
                                                            <p className="text-xs text-gray-200/80">
                                                                No {label.toLowerCase()}{' '}
                                                                meals yet.
                                                            </p>
                                                        ) : (
                                                            sectionMeals.map(
                                                                (meal) => {
                                                                    const mealIngredients =
                                                                        meal.ingredients ||
                                                                        []
                                                                    const mealTotal =
                                                                        mealIngredients.reduce(
                                                                            (
                                                                                sum,
                                                                                ing,
                                                                            ) =>
                                                                                sum +
                                                                                (ing.calories ??
                                                                                    0),
                                                                            0,
                                                                        )

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                meal.id
                                                                            }
                                                                            className="mt-3 space-y-2"
                                                                        >
                                                                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                                                                <Input
                                                                                    value={
                                                                                        meal.name
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const value =
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        setMeals(
                                                                                            (
                                                                                                prev,
                                                                                            ) =>
                                                                                                prev.map(
                                                                                                    (
                                                                                                        m,
                                                                                                    ) =>
                                                                                                        m.id ===
                                                                                                        meal.id
                                                                                                            ? {
                                                                                                                  ...m,
                                                                                                                  name: value,
                                                                                                              }
                                                                                                            : m,
                                                                                                ),
                                                                                        )
                                                                                    }}
                                                                                    placeholder={`${label} name`}
                                                                                />
                                                                                <Input
                                                                                    value={
                                                                                        meal.instructions ??
                                                                                        ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const value =
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        setMeals(
                                                                                            (
                                                                                                prev,
                                                                                            ) =>
                                                                                                prev.map(
                                                                                                    (
                                                                                                        m,
                                                                                                    ) =>
                                                                                                        m.id ===
                                                                                                        meal.id
                                                                                                            ? {
                                                                                                                  ...m,
                                                                                                                  instructions:
                                                                                                                      value,
                                                                                                              }
                                                                                                            : m,
                                                                                                ),
                                                                                        )
                                                                                    }}
                                                                                    placeholder="Instructions (optional)"
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    size="xs"
                                                                                    variant="plain"
                                                                                    onClick={() =>
                                                                                        setMeals(
                                                                                            (
                                                                                                prev,
                                                                                            ) =>
                                                                                                prev.filter(
                                                                                                    (
                                                                                                        m,
                                                                                                    ) =>
                                                                                                        m.id !==
                                                                                                        meal.id,
                                                                                                ),
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Remove
                                                                                </Button>
                                                                            </div>

                                                                            <div className="mt-2 rounded-xl bg-black/40 px-3 py-2">
                                                                                <div className="grid grid-cols-4 gap-2 text-[11px] font-semibold mb-2 text-gray-200">
                                                                                    <span>
                                                                                        Serial
                                                                                    </span>
                                                                                    <span>
                                                                                        Food Name
                                                                                    </span>
                                                                                    <span>
                                                                                        Unit
                                                                                    </span>
                                                                                    <span className="text-right">
                                                                                        Calories
                                                                                        per
                                                                                        Serving
                                                                                    </span>
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    {mealIngredients.map(
                                                                                        (
                                                                                            ing,
                                                                                            ingIdx,
                                                                                        ) => (
                                                                                            <div
                                                                                                key={`${meal.id}-ing-${ingIdx}`}
                                                                                                className="grid grid-cols-4 gap-2 items-center"
                                                                                            >
                                                                                                <div className="h-6 rounded-full bg-white/10 text-center text-xs flex items-center justify-center">
                                                                                                    {
                                                                                                        ingIdx +
                                                                                                        1
                                                                                                    }
                                                                                                </div>
                                                                                                <Input
                                                                                                    value={
                                                                                                        ing.name
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        e,
                                                                                                    ) => {
                                                                                                        const value =
                                                                                                            e
                                                                                                                .target
                                                                                                                .value
                                                                                                        setMeals(
                                                                                                            (
                                                                                                                prev,
                                                                                                            ) =>
                                                                                                                prev.map(
                                                                                                                    (
                                                                                                                        m,
                                                                                                                    ) =>
                                                                                                                        m.id ===
                                                                                                                        meal.id
                                                                                                                            ? {
                                                                                                                                  ...m,
                                                                                                                                  ingredients:
                                                                                                                                      mealIngredients.map(
                                                                                                                                          (
                                                                                                                                              row,
                                                                                                                                              idx2,
                                                                                                                                          ) =>
                                                                                                                                              idx2 ===
                                                                                                                                              ingIdx
                                                                                                                                                  ? {
                                                                                                                                                        ...row,
                                                                                                                                                        name: value,
                                                                                                                                                    }
                                                                                                                                                  : row,
                                                                                                                                      ),
                                                                                                                              }
                                                                                                                            : m,
                                                                                                                ),
                                                                                                        )
                                                                                                    }}
                                                                                                    placeholder="Food name"
                                                                                                />
                                                                                                <Input
                                                                                                    value={
                                                                                                        ing.unit ??
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        e,
                                                                                                    ) => {
                                                                                                        const value =
                                                                                                            e
                                                                                                                .target
                                                                                                                .value
                                                                                                        setMeals(
                                                                                                            (
                                                                                                                prev,
                                                                                                            ) =>
                                                                                                                prev.map(
                                                                                                                    (
                                                                                                                        m,
                                                                                                                    ) =>
                                                                                                                        m.id ===
                                                                                                                        meal.id
                                                                                                                            ? {
                                                                                                                                  ...m,
                                                                                                                                  ingredients:
                                                                                                                                      mealIngredients.map(
                                                                                                                                          (
                                                                                                                                              row,
                                                                                                                                              idx2,
                                                                                                                                          ) =>
                                                                                                                                              idx2 ===
                                                                                                                                              ingIdx
                                                                                                                                                  ? {
                                                                                                                                                        ...row,
                                                                                                                                                        unit: value,
                                                                                                                                                    }
                                                                                                                                                  : row,
                                                                                                                                      ),
                                                                                                                              }
                                                                                                                            : m,
                                                                                                                ),
                                                                                                        )
                                                                                                    }}
                                                                                                    placeholder="g / ml"
                                                                                                />
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    value={
                                                                                                        ing.calories ??
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        e,
                                                                                                    ) => {
                                                                                                        const value =
                                                                                                            e
                                                                                                                .target
                                                                                                                .value
                                                                                                        const num =
                                                                                                            value ===
                                                                                                            ''
                                                                                                                ? null
                                                                                                                : Number(
                                                                                                                      value,
                                                                                                                  )
                                                                                                        setMeals(
                                                                                                            (
                                                                                                                prev,
                                                                                                            ) =>
                                                                                                                prev.map(
                                                                                                                    (
                                                                                                                        m,
                                                                                                                    ) =>
                                                                                                                        m.id ===
                                                                                                                        meal.id
                                                                                                                            ? {
                                                                                                                                  ...m,
                                                                                                                                  ingredients:
                                                                                                                                      mealIngredients.map(
                                                                                                                                          (
                                                                                                                                              row,
                                                                                                                                              idx2,
                                                                                                                                          ) =>
                                                                                                                                              idx2 ===
                                                                                                                                              ingIdx
                                                                                                                                                  ? {
                                                                                                                                                        ...row,
                                                                                                                                                        calories:
                                                                                                                                                            num,
                                                                                                                                                    }
                                                                                                                                                  : row,
                                                                                                                                      ),
                                                                                                                              }
                                                                                                                            : m,
                                                                                                                ),
                                                                                                        )
                                                                                                    }}
                                                                                                    className="text-right"
                                                                                                    placeholder="kcal"
                                                                                                />
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                                <div className="mt-2 flex items-center justify-between text-xs text-gray-100">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span>
                                                                                            Total
                                                                                            Meal
                                                                                            Calories
                                                                                        </span>
                                                                                        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                                                                                            {mealTotal.toFixed(
                                                                                                0,
                                                                                            )}{' '}
                                                                                            Kcal
                                                                                        </span>
                                                                                    </div>
                                                                                    <Button
                                                                                        type="button"
                                                                                        size="xs"
                                                                                        variant="plain"
                                                                                        onClick={() =>
                                                                                            setMeals(
                                                                                                (
                                                                                                    prev,
                                                                                                ) =>
                                                                                                    prev.map(
                                                                                                        (
                                                                                                            m,
                                                                                                        ) =>
                                                                                                            m.id ===
                                                                                                            meal.id
                                                                                                                ? {
                                                                                                                      ...m,
                                                                                                                      ingredients:
                                                                                                                          [
                                                                                                                              ...mealIngredients,
                                                                                                                              {
                                                                                                                                  name: '',
                                                                                                                                  quantity:
                                                                                                                                      null,
                                                                                                                                  unit: null,
                                                                                                                                  calories:
                                                                                                                                      null,
                                                                                                                                  notes: null,
                                                                                                                                  order_index:
                                                                                                                                      mealIngredients.length +
                                                                                                                                      1,
                                                                                                                              },
                                                                                                                          ],
                                                                                                                  }
                                                                                                                : m,
                                                                                                    ),
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        + Add
                                                                                        Ingredient
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                },
                                                            )
                                                        )}
                                                    </div>
                                                </Card>
                                            )
                                        },
                                    )}
                                </div>

                                {/* Calories Goal Progress */}
                                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <PiClipboardTextDuotone className="w-6 h-6 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                Total Plan Calories
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Sum of all meal calories vs daily
                                                goal
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-semibold">
                                                {totalMealCalories.toFixed(0)}{' '}
                                                Kcal
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Daily goal:{' '}
                                                {dailyCalories
                                                    ? `${dailyCalories} Kcal`
                                                    : 'Not set'}
                                            </div>
                                        </div>
                                        <div className="w-40">
                                            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all"
                                                    style={{
                                                        width: `${caloriesProgress}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-1 text-xs text-right text-gray-500 dark:text-gray-400">
                                                {caloriesProgress}% of goal
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                {currentStep > 0 && (
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={goToPreviousStep}
                                    >
                                        Previous
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="plain"
                                    type="button"
                                    onClick={() => navigate('/coach/plans')}
                                >
                                    Cancel
                                </Button>
                                {currentStep < 2 && (
                                    <Button
                                        type="button"
                                        variant="solid"
                                        onClick={goToNextStep}
                                    >
                                        Next
                                    </Button>
                                )}
                                {currentStep === 2 && (
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        loading={saving}
                                    >
                                        {isEditMode
                                            ? 'Save Plan'
                                            : 'Create & Assign Plan'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

export default CreatePlan
