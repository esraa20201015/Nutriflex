import { useEffect, useState, useCallback } from 'react'
import { apiGetRoles, apiToggleRoleStatus, apiGetUsers } from '@/services/AdminService'
import { FiEye, FiEdit2 } from 'react-icons/fi'
import { TbToggleRight, TbToggleLeft } from 'react-icons/tb'
import CustomIndicator from '@/components/shared/CustomIndicator'
import Card from '@/components/ui/Card'
import Tooltip from '@/components/ui/Tooltip'
import Spinner from '@/components/ui/Spinner'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'
import { PiUserDuotone, PiShieldCheckDuotone, PiUsersThreeDuotone } from 'react-icons/pi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { Role, User } from '@/@types/api'

const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [usersLoading, setUsersLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [togglingRoleId, setTogglingRoleId] = useState<string | null>(null)

    const loadRoles = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiGetRoles()
            setRoles(response.data || [])
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load roles',
            )
        } finally {
            setLoading(false)
        }
    }, [])

    const loadUsers = useCallback(async () => {
        try {
            setUsersLoading(true)
            const response = await apiGetUsers({ take: 1000 })
            const usersList = Array.isArray(response.data)
                ? response.data
                : (response.data as { users?: User[] })?.users ?? []
            setUsers(usersList as User[])
        } catch (err) {
            console.error('Failed to load users:', err)
        } finally {
            setUsersLoading(false)
        }
    }, [])

    useEffect(() => {
        loadRoles()
        loadUsers()
    }, [loadRoles, loadUsers])

    const getUserCountForRole = useCallback(
        (roleName: string) => {
            return users.filter((user) => {
                const userRoleName =
                    typeof user.role === 'string'
                        ? user.role
                        : (user.role as { name?: string })?.name
                return userRoleName?.toLowerCase() === roleName.toLowerCase()
            }).length
        },
        [users],
    )

    const getUsersForRole = useCallback(
        (roleName: string) => {
            return users.filter((user) => {
                const userRoleName =
                    typeof user.role === 'string'
                        ? user.role
                        : (user.role as { name?: string })?.name
                return userRoleName?.toLowerCase() === roleName.toLowerCase()
            })
        },
        [users],
    )

    const handleToggleStatus = async (roleId: string) => {
        if (togglingRoleId) return
        setTogglingRoleId(roleId)
        try {
            await apiToggleRoleStatus(roleId)
            toast.push(
                <Notification type="success" title="Success">
                    Role status updated successfully
                </Notification>,
            )
            await loadRoles()
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ||
                (err instanceof Error ? err.message : 'Failed to update role status')
            toast.push(
                <Notification type="danger" title="Error">
                    {message}
                </Notification>,
            )
        } finally {
            setTogglingRoleId(null)
        }
    }

    const isRoleActive = (status?: string) =>
        status?.toLowerCase() === 'active'

    /** Role card theme: soft, eye-friendly colors for light and dark mode */
    const getRoleCardTheme = (roleName: string) => {
        const name = roleName?.toLowerCase() ?? ''
        if (name === 'admin')
            return {
                headerClass:
                    'bg-primary-subtle text-primary dark:bg-primary/15 dark:text-primary-mild',
                iconBg: 'bg-primary/20 dark:bg-primary/25',
                icon: PiShieldCheckDuotone,
            }
        if (name === 'coach')
            return {
                headerClass:
                    'bg-success-subtle text-emerald-700 dark:bg-success/15 dark:text-emerald-300',
                iconBg: 'bg-emerald-500/20 dark:bg-emerald-400/25',
                icon: PiUsersThreeDuotone,
            }
        if (name === 'trainee')
            return {
                headerClass:
                    'bg-info-subtle text-[#c43d82] dark:bg-info/15 dark:text-info',
                iconBg: 'bg-info/20 dark:bg-info/25',
                icon: PiUserDuotone,
            }
        return {
            headerClass:
                'bg-gray-200 text-gray-700 dark:bg-gray-600/30 dark:text-gray-300',
            iconBg: 'bg-gray-400/20 dark:bg-gray-400/25',
            icon: PiUserDuotone,
        }
    }

    if (loading) {
        return <CustomIndicator />
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
                <h2 className="text-2xl font-bold">Roles Management</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage system roles and permissions
                </p>
            </div>

            {roles.length === 0 ? (
                <div className="flex items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">
                        No roles found
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roles.map((role) => {
                        const theme = getRoleCardTheme(role.name)
                        const RoleIcon = theme.icon
                        const cardHeader = (
                            <div
                                className={`rounded-tl-lg rounded-tr-lg overflow-hidden px-4 py-4 ${theme.headerClass}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`flex items-center justify-center w-10 h-10 rounded-lg ${theme.iconBg ?? 'bg-gray-400/20'}`}
                                    >
                                        <RoleIcon className="text-xl opacity-90" />
                                    </span>
                                    <h4 className="font-semibold truncate">
                                        {role.name}
                                    </h4>
                                </div>
                            </div>
                        )
                        const userCount = getUserCountForRole(role.name)
                        const roleUsers = getUsersForRole(role.name).slice(0, 3)

                        const cardFooter = (
                            <div className="flex items-center">
                                {userCount === 0 ? (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        No users
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2 flex-1">
                                        {roleUsers.map((user, idx) => {
                                            const avatarSrc =
                                                (user as { avatar?: string })
                                                    ?.avatar ||
                                                (user as {
                                                    avatarUrl?: string
                                                })?.avatarUrl
                                            return (
                                                <Avatar
                                                    key={user.id || idx}
                                                    size={30}
                                                    shape="circle"
                                                    src={avatarSrc}
                                                    alt={user.fullName}
                                                    {...(!avatarSrc && {
                                                        icon: (
                                                            <PiUserDuotone className="text-lg" />
                                                        ),
                                                    })}
                                                />
                                            )
                                        })}
                                        {userCount > 3 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                +{userCount - 3} more
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                            ({userCount}{' '}
                                            {userCount === 1
                                                ? 'user'
                                                : 'users'})
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                        return (
                            <Card
                                key={role.id}
                                className="overflow-hidden rounded-xl border-0 shadow-md hover:shadow-xl transition-all duration-200 ease-out bg-white dark:bg-gray-800 dark:shadow-gray-900/20"
                                header={{
                                    content: cardHeader,
                                    bordered: false,
                                    className: 'p-0',
                                }}
                                footer={{
                                    content: cardFooter,
                                    bordered: true,
                                    className: 'bg-gray-50/80 dark:bg-gray-800/80',
                                }}
                            >
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                    {role.description || 'No description'}
                                </p>
                                {role.status ? (
                                    <Tag
                                        className={
                                            isRoleActive(role.status)
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100 border-0 rounded-full px-3'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-200 border-0 rounded-full px-3'
                                        }
                                    >
                                        {role.status}
                                    </Tag>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        No status
                                    </span>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}

            <div className="mt-8">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold">Roles List</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage roles and their settings
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {roles.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No roles found
                                        </td>
                                    </tr>
                                ) : (
                                    roles.map((role) => (
                                        <tr key={role.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {role.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {role.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {role.status ? (
                                                    <Tag
                                                        className={
                                                            isRoleActive(
                                                                role.status,
                                                            )
                                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0 rounded'
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-200 border-0 rounded'
                                                        }
                                                    >
                                                        {role.status}
                                                    </Tag>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        No status
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-3">
                                                <Tooltip
                                                    title={
                                                        isRoleActive(role.status)
                                                            ? 'Deactivate'
                                                            : 'Activate'
                                                    }
                                                >
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={
                                                            isRoleActive(
                                                                role.status,
                                                            )
                                                                ? 'Deactivate role'
                                                                : 'Activate role'
                                                        }
                                                        className="inline-flex items-center justify-center cursor-pointer text-gray-500 hover:opacity-80 transition-opacity"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                role.id,
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    'Enter' ||
                                                                e.key === ' '
                                                            ) {
                                                                e.preventDefault()
                                                                handleToggleStatus(
                                                                    role.id,
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {togglingRoleId ===
                                                        role.id ? (
                                                            <Spinner size={20} />
                                                        ) : isRoleActive(
                                                              role.status,
                                                          ) ? (
                                                            <TbToggleRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                        ) : (
                                                            <TbToggleLeft className="w-6 h-6 text-red-600 dark:text-red-400" />
                                                        )}
                                                    </div>
                                                </Tooltip>
                                                <Tooltip title="View">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
                                                        aria-label="View role"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center justify-center text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 transition-colors"
                                                        aria-label="Edit role"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Roles
