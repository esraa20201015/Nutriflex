import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { apiGetAvailableCoaches, apiSelectCoach } from '@/services/TraineeService'
import { useSessionUser } from '@/store/authStore'
import type { PublicCoachProfile } from '@/@types/api'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const CoachDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useSessionUser()
    const [coach, setCoach] = useState<PublicCoachProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [selecting, setSelecting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            if (!id) {
                setError('Coach not found')
                setLoading(false)
                return
            }
            try {
                setLoading(true)
                setError(null)
                const resp = await apiGetAvailableCoaches()
                const match =
                    resp.data?.find((c: PublicCoachProfile) => c.id === id) || null
                if (!match) {
                    setError('Coach not found')
                } else {
                    setCoach(match)
                }
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Failed to load coach'
                setError(message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleSelect = async () => {
        if (!coach || !user?.id) {
            toast.push(
                <Notification type="danger" title="Error">
                    Unable to select coach. Please sign in again.
                </Notification>,
            )
            return
        }
        try {
            setSelecting(true)
            await apiSelectCoach({
                coach_id: coach.id,
                trainee_id: user.id,
            })
            toast.push(
                <Notification type="success" title="Coach selected">
                    Your coach has been updated successfully.
                </Notification>,
            )
            navigate('/trainee/choose-coach')
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to select coach'
            toast.push(
                <Notification type="danger" title="Error">
                    {message}
                </Notification>,
            )
        } finally {
            setSelecting(false)
        }
    }

    if (loading) {
        return <CustomIndicator />
    }

    if (error || !coach) {
        return (
            <div className="space-y-4">
                <Button variant="plain" onClick={() => navigate(-1)}>
                    Back
                </Button>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-lg text-red-500 mb-2">Error</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {error || 'Coach not found'}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <Button variant="plain" onClick={() => navigate(-1)}>
                    Back
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold truncate">{coach.fullName}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Detailed coach profile
                    </p>
                </div>
            </div>

            <Card>
                <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <Avatar size={80} src={coach.profileImageUrl || ''}>
                            {coach.fullName[0]}
                        </Avatar>
                        <Button
                            variant="solid"
                            onClick={handleSelect}
                            loading={selecting}
                        >
                            {coach.isSelected ? 'Keep This Coach' : 'Select This Coach'}
                        </Button>
                        {coach.isSelected && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                This coach is currently assigned to you.
                            </p>
                        )}
                    </div>
                    <div className="flex-1 space-y-4">
                        {coach.specialization && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Specialization
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {coach.specialization}
                                </p>
                            </div>
                        )}
                        {coach.yearsOfExperience !== null &&
                            coach.yearsOfExperience !== undefined && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Years of experience
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {coach.yearsOfExperience} years
                                    </p>
                                </div>
                            )}
                        {coach.certifications && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Certifications
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                    {coach.certifications}
                                </p>
                            </div>
                        )}
                        {coach.bio && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Bio
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                    {coach.bio}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default CoachDetails

