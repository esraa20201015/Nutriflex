import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    apiCreatePlan,
    apiUpdatePlan,
    apiGetPlan,
    apiGetCoachTrainees,
} from '@/services/CoachService'
import { useSessionUser } from '@/store/authStore'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import { PiArrowLeftDuotone, PiClipboardTextDuotone } from 'react-icons/pi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { CoachTrainee } from '@/@types/api'

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

const CreatePlan = () => {
    const { id } = useParams<{ id?: string }>()
    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)
    const isEditMode = !!id

    const [trainees, setTrainees] = useState<CoachTrainee[]>([])
    const [loadingTrainees, setLoadingTrainees] = useState(true)
    const [loading, setLoading] = useState(isEditMode)
    const [saving, setSaving] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PlanFormData>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            status: 'draft',
            daily_calories: null,
            description: '',
            end_date: null,
        },
    })

    // Load trainees for dropdown
    useEffect(() => {
        const loadTrainees = async () => {
            if (!user.id) return

            try {
                setLoadingTrainees(true)
                const response = await apiGetCoachTrainees({
                    coach_id: user.id,
                })
                setTrainees(response.data.coachTrainees || [])
            } catch (err) {
                console.error('Failed to load trainees:', err)
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
                    trainee_id: plan.traineeId || '',
                    title: (plan as any).title || (plan as any).name || '',
                    description: plan.description || '',
                    daily_calories:
                        (plan as any).daily_calories ||
                        (plan as any).dailyCalories ||
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

            const planData = {
                coach_id: user.id,
                trainee_id: data.trainee_id,
                title: data.title,
                description: data.description || null,
                daily_calories: data.daily_calories || null,
                start_date: data.start_date.toISOString(),
                end_date: data.end_date?.toISOString() || null,
                status: data.status,
            }

            if (isEditMode && id) {
                await apiUpdatePlan(id, planData)
                toast.push(
                    <Notification type="success" title="Success">
                        Plan updated successfully
                    </Notification>,
                )
            } else {
                await apiCreatePlan(planData)
                toast.push(
                    <Notification type="success" title="Success">
                        Plan created successfully
                    </Notification>,
                )
            }

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
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size={40} />
            </div>
        )
    }

    const traineeOptions = trainees.map((trainee) => ({
        value: trainee.traineeId,
        label: trainee.trainee?.fullName || 'Unknown Trainee',
    }))

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

            {/* Form */}
            <Card>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 space-y-6">
                        {/* Trainee Selection */}
                        <FormItem
                            label="Trainee"
                            invalid={!!errors.trainee_id}
                            errorMessage={errors.trainee_id?.message}
                        >
                            <Controller
                                name="trainee_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={traineeOptions}
                                        value={traineeOptions.find(
                                            (opt) => opt.value === field.value,
                                        )}
                                        onChange={(option) =>
                                            field.onChange(
                                                option ? option.value : '',
                                            )
                                        }
                                        placeholder="Select a trainee"
                                        isDisabled={isEditMode}
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
                                            onChange={(date) => field.onChange(date)}
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
                                                field.onChange(date || null)
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
                                        { value: 'archived', label: 'Archived' },
                                    ]
                                    return (
                                        <Select
                                            options={statusOptions}
                                            value={statusOptions.find(
                                                (opt) => opt.value === field.value,
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

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                variant="plain"
                                onClick={() => navigate('/coach/plans')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                loading={saving}
                            >
                                {isEditMode ? 'Update Plan' : 'Create Plan'}
                            </Button>
                        </div>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

export default CreatePlan
