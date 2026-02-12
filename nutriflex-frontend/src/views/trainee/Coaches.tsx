import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { HiOutlineEye } from 'react-icons/hi'
import { apiGetAvailableCoaches } from '@/services/TraineeService'
import type { PublicCoachProfile } from '@/@types/api'

const Coaches = () => {
    const [coaches, setCoaches] = useState<PublicCoachProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const loadCoaches = async () => {
        try {
            setLoading(true)
            setError(null)
            const resp = await apiGetAvailableCoaches()
            setCoaches(resp.data || [])
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to load coaches'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCoaches()
    }, [])

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
                <h2 className="text-2xl font-bold">Coaches</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Browse available coaches and select the one you want to work with.
                </p>
            </div>

            {coaches.length === 0 ? (
                <Card>
                    <div className="p-10 text-center">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            No coaches available
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Once coaches complete their profiles, you&apos;ll be able to select one here.
                        </p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="p-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Coach
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Specialization
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Experience
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Certifications
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {coaches.map((coach) => {
                                    const selected = coach.isSelected
                                    return (
                                        <tr key={coach.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        size={32}
                                                        src={coach.profileImageUrl || ''}
                                                    >
                                                        {coach.fullName[0]}
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {coach.fullName}
                                                        </div>
                                                        {coach.bio && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                                                                {coach.bio}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {coach.specialization || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {coach.yearsOfExperience ?? '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {coach.certifications || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                {selected ? 'Selected' : 'Not selected'}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    variant="plain"
                                                    shape="circle"
                                                    icon={<HiOutlineEye className="text-lg" />}
                                                    onClick={() =>
                                                        navigate(
                                                            `/trainee/coaches/${coach.id}`,
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default Coaches

