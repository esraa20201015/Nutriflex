import { useEffect, useRef, useState } from 'react'
import { useSessionUser } from '@/store/authStore'
import ApiService from '@/services/ApiService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { ApiResponse, TraineeDashboardData } from '@/@types/api'

type MeProfilePayload = {
    userId: string
    role: 'ADMIN' | 'COACH' | 'TRAINEE' | string
    profile: any | null
    avatarUrl?: string | null
}

type MeProfileResponse = ApiResponse<MeProfilePayload>
type TraineeDashboardResponse = ApiResponse<TraineeDashboardData>
type GenericResponse = ApiResponse<Record<string, unknown> | null>

const Profile = () => {
    const { fullName, email, role } = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)

    const [serverRole, setServerRole] = useState<string | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string>('')
    const [traineeStats, setTraineeStats] =
        useState<TraineeDashboardData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<
        'overview' | 'settings' | 'bodyMeasurements'
    >('overview')

    // Settings tab state
    const [accountName, setAccountName] = useState(fullName || '')
    const [accountEmail, setAccountEmail] = useState(email || '')
    const [accountSaving, setAccountSaving] = useState(false)
    const [accountMessage, setAccountMessage] = useState<string | null>(null)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Body measurements tab state (for trainees)
    const [bmHeightCm, setBmHeightCm] = useState<string>('')
    const [bmWeightKg, setBmWeightKg] = useState<string>('')
    const [bmWaistCm, setBmWaistCm] = useState<string>('')
    const [bmChestCm, setBmChestCm] = useState<string>('')
    const [bmHipsCm, setBmHipsCm] = useState<string>('')
    const [bmSaving, setBmSaving] = useState(false)
    const [bmMessage, setBmMessage] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            setError(null)

            try {
                const res =
                    await ApiService.fetchDataWithAxios<MeProfileResponse>({
                        url: '/profile/me',
                        method: 'get',
                    })

                setServerRole(res.data.role)
                setProfile(res.data.profile)
                const avatar = res.data.avatarUrl || ''
                setAvatarUrl(avatar)
                setUser({ avatar: avatar || undefined })

                // Seed body measurements tab for trainees from profile snapshot if available
                if (res.data.role === 'TRAINEE' && res.data.profile) {
                    const p = res.data.profile as {
                        height_cm?: number | null
                        weight_kg?: number | null
                    }
                    if (typeof p.height_cm === 'number') {
                        setBmHeightCm(String(p.height_cm))
                    }
                    if (typeof p.weight_kg === 'number') {
                        setBmWeightKg(String(p.weight_kg))
                    }
                }

                if (res.data.role === 'TRAINEE') {
                    const traineeRes =
                        await ApiService.fetchDataWithAxios<TraineeDashboardResponse>(
                            {
                                url: '/dashboard/trainee',
                                method: 'get',
                            },
                        )
                    setTraineeStats(traineeRes.data)
                }
            } catch (e) {
                setError('Unable to load profile details.')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    useEffect(() => {
        setAccountName(fullName || '')
        setAccountEmail(email || '')
    }, [fullName, email])

    const isActive = serverRole === 'COACH' || serverRole === 'TRAINEE'

    const handleAvatarFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = () => reject(reader.error)
                reader.readAsDataURL(file)
            })

            const res = await ApiService.fetchDataWithAxios<MeProfileResponse>({
                url: '/profile/me',
                method: 'put',
                data: { avatarBase64: dataUrl },
            })
            const savedAvatar = res.data?.avatarUrl ?? dataUrl
            setAvatarUrl(savedAvatar)
            setUser({ avatar: savedAvatar })
            setAccountMessage('Avatar updated.')
            toast.push(
                <Notification type="success" title="Success">
                    Avatar updated.
                </Notification>,
            )
        } catch (err: unknown) {
            const errorMessage =
                (err as { response?: { data?: { messageEn?: string } } })
                    ?.response?.data?.messageEn ||
                'Unable to upload avatar image.'
            setAccountMessage(errorMessage)
            toast.push(
                <Notification type="danger" title="Failed">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const getInitials = () => {
        if (fullName) {
            const parts = fullName.trim().split(/\s+/)
            const first = parts[0]?.charAt(0) || ''
            const second = parts[1]?.charAt(0) || ''
            const combined = (first + second).toUpperCase()
            if (combined) return combined
        }
        if (email) {
            return email.charAt(0).toUpperCase()
        }
        return '?'
    }

    const handleAccountSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setAccountSaving(true)
        setAccountMessage(null)
        try {
            const res =
                await ApiService.fetchDataWithAxios<MeProfileResponse>({
                    url: '/profile/me',
                    method: 'put',
                    data: {
                        fullName: accountName,
                        email: accountEmail,
                        avatarUrl: avatarUrl || null,
                    },
                })
            const message = res.messageEn || 'Profile updated successfully.'
            setAccountMessage(message)
            const updatedAvatar = res.data?.avatarUrl ?? avatarUrl
            setAvatarUrl(updatedAvatar || '')
            setUser({
                fullName: accountName,
                email: accountEmail,
                avatar: updatedAvatar || undefined,
            })
            toast.push(
                <Notification type="success" title="Success">
                    {message}
                </Notification>,
            )
        } catch (err: unknown) {
            const errorMessage =
                (err as { response?: { data?: { messageEn?: string } } })
                    ?.response?.data?.messageEn ||
                'Unable to update account details.'
            setAccountMessage(errorMessage)
            toast.push(
                <Notification type="danger" title="Failed">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setAccountSaving(false)
        }
    }

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordMessage(null)

        if (!newPassword || newPassword !== confirmPassword) {
            const msg = 'New password and confirmation must match.'
            setPasswordMessage(msg)
            toast.push(
                <Notification type="danger" title="Validation">
                    {msg}
                </Notification>,
            )
            return
        }

        setPasswordSaving(true)
        try {
            const res =
                await ApiService.fetchDataWithAxios<GenericResponse>({
                    url: '/auth/change-password',
                    method: 'post',
                    data: {
                        currentPassword,
                        newPassword,
                    },
                })
            const message = res.messageEn || 'Password updated successfully.'
            setPasswordMessage(message)
            toast.push(
                <Notification type="success" title="Success">
                    {message}
                </Notification>,
            )
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: unknown) {
            const errorMessage =
                (err as { response?: { data?: { messageEn?: string } } })
                    ?.response?.data?.messageEn ||
                'Unable to update password.'
            setPasswordMessage(errorMessage)
            toast.push(
                <Notification type="danger" title="Failed">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setPasswordSaving(false)
        }
    }

    const handleBodyMeasurementsSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (serverRole !== 'TRAINEE') return

        setBmSaving(true)
        setBmMessage(null)

        try {
            const payload: {
                heightCm?: number | null
                weightKg?: number | null
                waistCm?: number | null
                chestCm?: number | null
                hipsCm?: number | null
            } = {}

            if (bmHeightCm !== '') {
                payload.heightCm = Number(bmHeightCm)
            }
            if (bmWeightKg !== '') {
                payload.weightKg = Number(bmWeightKg)
            }
            if (bmWaistCm !== '') {
                payload.waistCm = Number(bmWaistCm)
            }
            if (bmChestCm !== '') {
                payload.chestCm = Number(bmChestCm)
            }
            if (bmHipsCm !== '') {
                payload.hipsCm = Number(bmHipsCm)
            }

            const res =
                await ApiService.fetchDataWithAxios<MeProfileResponse>({
                    url: '/profile/me/body-measurement',
                    method: 'post',
                    data: payload,
                })

            setBmMessage(
                res.messageEn || 'Body measurements updated successfully.',
            )

            // Update local snapshot if height/weight came back in profile
            if (res.data.profile) {
                setProfile(res.data.profile)
                const p = res.data.profile as {
                    height_cm?: number | null
                    weight_kg?: number | null
                }
                if (typeof p.height_cm === 'number') {
                    setBmHeightCm(String(p.height_cm))
                }
                if (typeof p.weight_kg === 'number') {
                    setBmWeightKg(String(p.weight_kg))
                }
            }

            toast.push(
                <Notification type="success" title="Success">
                    {res.messageEn || 'Body measurements updated successfully.'}
                </Notification>,
            )
        } catch (err: unknown) {
            const errorMessage =
                (err as { response?: { data?: { messageEn?: string } } })
                    ?.response?.data?.messageEn ||
                'Unable to update body measurements.'
            setBmMessage(errorMessage)
            toast.push(
                <Notification type="danger" title="Failed">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setBmSaving(false)
        }
    }

    return (
        <div className="px-6 py-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-semibold mb-4">Profile</h1>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4">
                    <nav className="flex gap-6 text-sm">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`pb-2 -mb-px border-b-2 ${
                                activeTab === 'overview'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={`pb-2 -mb-px border-b-2 ${
                                activeTab === 'settings'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Settings
                        </button>
                        {serverRole === 'TRAINEE' && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('bodyMeasurements')}
                                className={`pb-2 -mb-px border-b-2 ${
                                    activeTab === 'bodyMeasurements'
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                Body Measurements
                            </button>
                        )}
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div className="grid gap-4 lg:grid-cols-3">
                        {/* Left profile card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center">
                            {/* Avatar: use image when available, otherwise initials */}
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={fullName || 'Profile avatar'}
                                    className="w-24 h-24 rounded-full object-cover mb-3"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-[#1d293d1a] text-[#1d293d] dark:bg-[#fb64b61a] dark:text-[#fb64b6] flex items-center justify-center text-3xl font-semibold mb-3">
                                    {getInitials()}
                                </div>
                            )}
                            <div className="text-lg font-semibold mb-1">
                                {fullName || 'User'}
                            </div>
                            {isActive && (
                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 mb-4">
                                    Active
                                </span>
                            )}

                            <div className="w-full text-left text-sm text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                                {email && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Email:</span>
                                        <span>{email}</span>
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 mt-2">
                                    Full access based on your Nutriflex role and
                                    permissions.
                                </div>
                            </div>
                        </div>

                        {/* Right side cards */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Personal Information */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <h2 className="text-sm font-semibold mb-4">
                                    Personal Information
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                    <div className="space-y-1">
                                        <div className="text-gray-500">Name</div>
                                        <div className="font-medium">
                                            {fullName || 'Not set'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-500">Email</div>
                                        <div className="font-medium">
                                            {email || 'Not set'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-500">Role</div>
                                        <div className="font-medium">
                                            {role || 'Not set'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <h2 className="text-sm font-semibold mb-4">
                                    Account Information
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                                    <div className="space-y-1">
                                        <div className="text-gray-500">
                                            Permissions
                                        </div>
                                        <div>
                                            Access to Nutriflex features and data
                                            according to your role.
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-500">
                                            Account Status
                                        </div>
                                        <div>
                                            <span
                                                className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${
                                                    isActive
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {isActive ? 'Active' : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trainee metrics */}
                            {serverRole === 'TRAINEE' && traineeStats && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                    <h2 className="text-sm font-semibold mb-4">
                                        Trainee Metrics (last 30 days)
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-3 text-sm">
                                        <div className="space-y-1">
                                            <div className="text-gray-500">
                                                Current Weight
                                            </div>
                                            <div className="font-medium">
                                                {typeof traineeStats.currentWeight ===
                                                'number'
                                                    ? `${traineeStats.currentWeight} kg`
                                                    : 'Not available'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-gray-500">
                                                Change (30 days)
                                            </div>
                                            <div className="font-medium">
                                                {typeof traineeStats.weightChange30Days ===
                                                'number'
                                                    ? `${traineeStats.weightChange30Days} kg`
                                                    : 'Not available'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-gray-500">
                                                Last measurement
                                            </div>
                                            <div className="font-medium">
                                                {traineeStats.lastMeasurementDate ||
                                                    'Not recorded'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-4">
                        <div className="grid gap-4 lg:grid-cols-3">
                            {/* Avatar settings */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center">
                                <h2 className="text-sm font-semibold mb-4">
                                    Profile Avatar
                                </h2>
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={fullName || 'Profile avatar'}
                                        className="w-20 h-20 rounded-full object-cover mb-3"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-[#1d293d1a] text-[#1d293d] dark:bg-[#fb64b61a] dark:text-[#fb64b6] flex items-center justify-center text-2xl font-semibold mb-3">
                                        {getInitials()}
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarFileChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-1 inline-flex items-center px-3 py-1.5 rounded-full border border-primary text-primary text-xs font-medium hover:bg-primary hover:text-white dark:border-[#fb64b6] dark:text-[#fb64b6] dark:hover:bg-[#fb64b6] dark:hover:text-white transition-colors"
                                >
                                    Edit avatar
                                </button>
                                <p className="mt-2 text-[11px] text-gray-500">
                                    JPG, PNG, up to a few MB. Saves when you choose a file; appears in the header and everywhere.
                                </p>
                            </div>

                            {/* Account settings */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:col-span-2">
                                <h2 className="text-sm font-semibold mb-4">
                                    Account Details
                                </h2>
                                <form
                                    className="space-y-4 text-sm"
                                    onSubmit={handleAccountSave}
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="block text-gray-500">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                value={accountName}
                                                onChange={(e) =>
                                                    setAccountName(e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-gray-500">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                value={accountEmail}
                                                onChange={(e) =>
                                                    setAccountEmail(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                    {accountMessage && (
                                        <div className="text-xs text-gray-500">
                                            {accountMessage}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-mild dark:bg-[#fb64b6] dark:hover:bg-[#fb64b6] disabled:opacity-60"
                                        disabled={accountSaving}
                                    >
                                        {accountSaving ? 'Saving...' : 'Save changes'}
                                    </button>
                                </form>
                            </div>

                            {/* Password settings - full width below Avatar + Account Details */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-300 lg:col-span-3">
                                <h2 className="text-sm font-semibold mb-4">
                                    Change Password
                                </h2>
                                <form
                                    className="space-y-3"
                                    onSubmit={handlePasswordSave}
                                >
                                    <div className="space-y-1">
                                        <label className="block text-gray-500">
                                            Current password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="block text-gray-500">
                                                New password
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-gray-500">
                                                Confirm new password
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                    {passwordMessage && (
                                        <div className="text-xs text-gray-500">
                                            {passwordMessage}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-mild dark:bg-[#fb64b6] dark:hover:bg-[#fb64b6] disabled:opacity-60"
                                        disabled={passwordSaving}
                                    >
                                        {passwordSaving ? 'Saving...' : 'Update password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bodyMeasurements' && serverRole === 'TRAINEE' && (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 max-w-3xl">
                            <h2 className="text-sm font-semibold mb-1">
                                Body Measurements
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">
                                Keep your height, weight, and key measurements up to date so Nutriflex
                                can track your progress accurately.
                            </p>

                            <form
                                className="space-y-4 text-sm"
                                onSubmit={handleBodyMeasurementsSave}
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="block text-gray-500">
                                            Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="165.5"
                                            value={bmHeightCm}
                                            onChange={(e) =>
                                                setBmHeightCm(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-gray-500">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="60.5"
                                            value={bmWeightKg}
                                            onChange={(e) =>
                                                setBmWeightKg(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-1">
                                        <label className="block text-gray-500">
                                            Waist (cm)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="80"
                                            value={bmWaistCm}
                                            onChange={(e) =>
                                                setBmWaistCm(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-gray-500">
                                            Chest (cm)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="95"
                                            value={bmChestCm}
                                            onChange={(e) =>
                                                setBmChestCm(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-gray-500">
                                            Hips (cm)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="95"
                                            value={bmHipsCm}
                                            onChange={(e) =>
                                                setBmHipsCm(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                {bmMessage && (
                                    <div className="text-xs text-gray-500">
                                        {bmMessage}
                                    </div>
                                )}

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[11px] text-gray-500">
                                        Saving will update your profile snapshot and add a new
                                        body measurement entry.
                                    </span>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-mild dark:bg-[#fb64b6] dark:hover:bg-[#fb64b6] disabled:opacity-60"
                                        disabled={bmSaving}
                                    >
                                        {bmSaving ? 'Saving...' : 'Save changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile


