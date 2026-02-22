import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import {
    PiArrowLeftDuotone,
    PiPencilDuotone,
    PiCalendarCheckDuotone,
    PiUserCircleDuotone,
    PiForkKnifeDuotone,
} from 'react-icons/pi'
import { apiGetPlan } from '@/services/CoachService'
import type { CoachNutritionPlan } from '@/@types/api'

const ViewPlanPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [plan, setPlan] = useState<CoachNutritionPlan | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadPlan = async () => {
            try {
                setLoading(true)
                const res = await apiGetPlan(id!)
                setPlan(res.data as unknown as CoachNutritionPlan)
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load plan'
                )
            } finally {
                setLoading(false)
            }
        }

        if (id) loadPlan()
    }, [id])

    const formatDate = (date: string | null) => {
        if (!date) return 'Ongoing'
        return new Date(date).toLocaleDateString()
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700'
            case 'draft':
                return 'bg-yellow-100 text-yellow-700'
            case 'archived':
                return 'bg-gray-200 text-gray-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) {
        return <CustomIndicator />
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                {error}
            </div>
        )
    }

    if (!plan) {
        return (
            <div className="text-center">
                Plan not found
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{plan.title}</h2>
                    <p className="text-gray-500">Nutrition Plan Details</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="plain"
                        icon={<PiArrowLeftDuotone />}
                        onClick={() => navigate('/coach/plans')}
                    >
                        Back
                    </Button>
                    <Button
                        variant="solid"
                        icon={<PiPencilDuotone />}
                        onClick={() =>
                            navigate(`/coach/plans/${plan.id}/edit`)
                        }
                    >
                        Edit
                    </Button>
                </div>
            </div>

            {/* Plan Info */}
            <Card>
                <div className="p-6 space-y-4">
                    {/* Status */}
                    <Tag className={`${statusColor(plan.status)} border-0`}>
                        {plan.status.toUpperCase()}
                    </Tag>

                    {/* Description */}
                    {plan.description && (
                        <p className="text-gray-700">
                            {plan.description}
                        </p>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <PiUserCircleDuotone />
                            <span>
                                <strong>Trainee:</strong>{' '}
                                {plan.trainee.fullName}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <PiUserCircleDuotone />
                            <span>
                                <strong>Coach:</strong>{' '}
                                {plan.coach.fullName}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <PiCalendarCheckDuotone />
                            <span>
                                <strong>Start:</strong>{' '}
                                {formatDate(plan.start_date)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <PiCalendarCheckDuotone />
                            <span>
                                <strong>End:</strong>{' '}
                                {formatDate(plan.end_date)}
                            </span>
                        </div>

                        {plan.daily_calories && (
                            <div className="flex items-center gap-2">
                                <PiForkKnifeDuotone />
                                <span>
                                    <strong>Daily Calories:</strong>{' '}
                                    {plan.daily_calories} kcal
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ViewPlanPage
