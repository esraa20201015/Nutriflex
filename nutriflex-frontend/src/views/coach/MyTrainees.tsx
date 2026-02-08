import { useEffect, useState } from 'react'
import { apiGetCoachTrainees } from '@/services/CoachService'
import { useSessionUser } from '@/store/authStore'
import type { CoachTrainee } from '@/@types/api'

const MyTrainees = () => {
    const [trainees, setTrainees] = useState<CoachTrainee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const user = useSessionUser((state) => state.user)

    useEffect(() => {
        const loadTrainees = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await apiGetCoachTrainees({
                    coach_id: user.id,
                })
                setTrainees(response.data.coachTrainees || [])
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load trainees',
                )
            } finally {
                setLoading(false)
            }
        }

        if (user.id) {
            loadTrainees()
        }
    }, [user.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading trainees...</div>
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
                <h2 className="text-2xl font-bold">My Trainees</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your assigned trainees
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {trainees.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No trainees found
                                    </td>
                                </tr>
                            ) : (
                                trainees.map((ct) => (
                                    <tr key={ct.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {ct.trainee?.fullName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {ct.trainee?.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {ct.status || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default MyTrainees
