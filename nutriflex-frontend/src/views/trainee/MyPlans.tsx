import { useEffect, useState } from 'react'
import { apiGetTraineePlans, apiGetTraineePlanStatuses } from '@/services/TraineeService'
import { useSessionUser } from '@/store/authStore'
import type { NutritionPlan } from '@/@types/api'

const MyPlans = () => {
    const [plans, setPlans] = useState<NutritionPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const user = useSessionUser((state) => state.user)

    useEffect(() => {
        const loadPlans = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await apiGetTraineePlans({
                    trainee_id: user.id!,
                })
                setPlans(response.data.plans || [])
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load plans',
                )
            } finally {
                setLoading(false)
            }
        }

        if (user.id) {
            loadPlans()
        }
    }, [user.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading plans...</div>
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
                <h2 className="text-2xl font-bold">My Plans</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    View your assigned nutrition plans
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        No plans assigned
                    </div>
                ) : (
                    plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
                        >
                            <h3 className="text-lg font-semibold mb-2">
                                {plan.name}
                            </h3>
                            {plan.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {plan.description}
                                </p>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Status: {plan.status || 'N/A'}
                                </span>
                                {plan.createdAt && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(
                                            plan.createdAt,
                                        ).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default MyPlans
