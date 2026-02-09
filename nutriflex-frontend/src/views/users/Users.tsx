import { useState, useEffect, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import Spinner from '@/components/ui/Spinner'
import {
    apiGetUsers,
    apiSearchUsers,
    apiDeleteUser,
    apiToggleUserStatus,
} from '@/services/UserService'
import type { UserWithProfile } from '@/@types/user'
import {
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlineFilter,
} from 'react-icons/hi'
import { PiUserDuotone } from 'react-icons/pi'
import { TbToggleRight, TbToggleLeft } from 'react-icons/tb'
import Avatar from '@/components/ui/Avatar'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Dropdown from '@/components/ui/Dropdown'

const Users = () => {
    const [users, setUsers] = useState<UserWithProfile[]>([])
    const [loading, setLoading] = useState(false)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [pagingData, setPagingData] = useState({
        total: 0,
        pageIndex: 1,
        pageSize: 10,
    })
    const [statusFilter, setStatusFilter] = useState<
        'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ALL'
    >('ALL')
    const [togglingUserId, setTogglingUserId] = useState<string | null>(null)

    const loadUsers = async () => {
        setLoading(true)
        try {
            let response
            if (searchKeyword.trim()) {
                response = await apiSearchUsers(searchKeyword.trim())
            } else {
                response = await apiGetUsers({
                    skip: (pagingData.pageIndex - 1) * pagingData.pageSize,
                    take: pagingData.pageSize,
                    status: statusFilter === 'ALL' ? undefined : statusFilter,
                })
            }

            if (response?.data !== undefined) {
                const rawList = Array.isArray(response.data)
                    ? response.data
                    : (response.data as { users?: UserWithProfile[] })?.users ?? []
                const usersList = (rawList as Record<string, unknown>[]).map(
                    (u) => ({
                        ...u,
                        avatar: (u.avatarUrl ?? u.avatar_url ?? u.avatar) as
                            | string
                            | undefined,
                        status: (typeof u.status === 'string'
                            ? u.status.toUpperCase()
                            : u.status) as UserWithProfile['status'],
                        role: (u.role ?? 'ADMIN') as UserWithProfile['role'],
                    }),
                ) as UserWithProfile[]
                setUsers(usersList)
                if (!searchKeyword.trim()) {
                    const total =
                        (response as { meta?: { total?: number } })?.meta?.total ??
                        (response.data as { total?: number })?.total ??
                        0
                    setPagingData((prev) => ({
                        ...prev,
                        total: Number(total),
                    }))
                }
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.messageEn ||
                error?.response?.data?.message ||
                'Failed to load users'
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagingData.pageIndex, pagingData.pageSize, statusFilter])

    const handleSearch = () => {
        setPagingData((prev) => ({ ...prev, pageIndex: 1 }))
        loadUsers()
    }

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)

    const handleDeleteClick = (userId: string) => {
        setUserToDelete(userId)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return

        try {
            await apiDeleteUser(userToDelete)
            toast.push(
                <Notification type="success" title="Success">
                    User deleted successfully
                </Notification>,
            )
            setDeleteDialogOpen(false)
            setUserToDelete(null)
            loadUsers()
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.messageEn ||
                error?.response?.data?.message ||
                'Failed to delete user'
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        }
    }

    const handleToggleStatus = async (
        userId: string,
        currentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    ) => {
        if (togglingUserId) return
        setTogglingUserId(userId)
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        try {
            await apiToggleUserStatus(userId, { status: newStatus })
            toast.push(
                <Notification type="success" title="Success">
                    User status updated successfully
                </Notification>,
            )
            loadUsers()
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.messageEn ||
                error?.response?.data?.message ||
                'Failed to update user status'
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
                </Notification>,
            )
        } finally {
            setTogglingUserId(null)
        }
    }

    const columns = useMemo<ColumnDef<UserWithProfile>[]>(
        () => [
            {
                header: 'Name',
                accessorKey: 'fullName',
                cell: ({ row }) => {
                    const user = row.original
                    const avatarSrc =
                        user.avatar ||
                        (user as { avatarUrl?: string }).avatarUrl ||
                        (user as { avatar_url?: string }).avatar_url
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar
                                size={40}
                                shape="circle"
                                src={avatarSrc}
                                alt={user.fullName}
                                {...(!avatarSrc && { icon: <PiUserDuotone className="text-lg" /> })}
                            />
                            <div>
                                <div className="font-semibold">{user.fullName}</div>
                                <div className="text-sm text-gray-500">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Role',
                accessorKey: 'role',
                cell: ({ row }) => {
                    const roleData = row.original.role
                    // Handle both string and object role formats
                    const roleName = typeof roleData === 'string' 
                        ? roleData 
                        : (roleData?.name || roleData?.id || 'UNKNOWN')
                    const roleTagClass = {
                        ADMIN:
                            'text-white bg-indigo-600 dark:bg-indigo-500/80 border-0 rounded',
                        COACH:
                            'text-white bg-blue-600 dark:bg-blue-500/80 border-0 rounded',
                        TRAINEE:
                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0 rounded',
                    }
                    return (
                        <Tag
                            className={
                                roleTagClass[roleName as keyof typeof roleTagClass] ||
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-0 rounded'
                            }
                        >
                            {roleName}
                        </Tag>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => {
                    const status = row.original.status
                    const statusTagClass = {
                        ACTIVE:
                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0 rounded',
                        INACTIVE:
                            'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-200 border-0 rounded',
                        SUSPENDED:
                            'text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-500/20 border-0 rounded',
                    }
                    return (
                        <Tag
                            className={
                                statusTagClass[status] ||
                                'bg-gray-100 text-gray-800 border-0 rounded'
                            }
                        >
                            {status}
                        </Tag>
                    )
                },
            },
            {
                header: 'Email Verified',
                accessorKey: 'isEmailVerified',
                cell: ({ row }) => {
                    return row.original.isEmailVerified ? (
                        <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0 rounded">
                            Verified
                        </Tag>
                    ) : (
                        <Tag className="text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20 border-0 rounded">
                            Not Verified
                        </Tag>
                    )
                },
            },
            {
                header: 'Actions',
                accessorKey: 'actions',
                cell: ({ row }) => {
                    const user = row.original
                    return (
                        <div className="flex items-center gap-1">
                            <Tooltip title="Edit">
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={
                                        <HiOutlinePencil className="text-lg" />
                                    }
                                    onClick={() => {
                                        // TODO: Navigate to edit page
                                        toast.push(
                                            <Notification
                                                type="info"
                                                title="Info"
                                            >
                                                Edit functionality coming soon
                                            </Notification>,
                                        )
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title="View">
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={
                                        <HiOutlineEye className="text-lg" />
                                    }
                                    onClick={() => {
                                        // TODO: Navigate to view user
                                        toast.push(
                                            <Notification
                                                type="info"
                                                title="Info"
                                            >
                                                View functionality coming soon
                                            </Notification>,
                                        )
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title="Delete">
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={
                                        <HiOutlineTrash className="text-lg" />
                                    }
                                    onClick={() =>
                                        handleDeleteClick(user.id)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                />
                            </Tooltip>
                            {(user.status === 'ACTIVE' ||
                                user.status === 'INACTIVE') && (
                                <Tooltip
                                    title={
                                        user.status === 'ACTIVE'
                                            ? 'Active'
                                            : 'Inactive'
                                    }
                                >
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label={
                                            user.status === 'ACTIVE'
                                                ? 'Deactivate user'
                                                : 'Activate user'
                                        }
                                        className="inline-flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() =>
                                            handleToggleStatus(
                                                user.id,
                                                user.status,
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault()
                                                handleToggleStatus(
                                                    user.id,
                                                    user.status,
                                                )
                                            }
                                        }}
                                    >
                                        {togglingUserId === user.id ? (
                                            <Spinner size={20} />
                                        ) : user.status === 'ACTIVE' ? (
                                            <TbToggleRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <TbToggleLeft className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                </Tooltip>
                            )}
                        </div>
                    )
                },
            },
        ],
        [],
    )

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3>Users Management</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage all users in the system
                    </p>
                </div>
                <Button variant="solid" size="sm">
                    Add New User
                </Button>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch()
                            }
                        }}
                        className="bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-indigo-500/20 rounded-lg"
                        suffix={
                            <HiOutlineSearch
                                className="cursor-pointer text-gray-500 dark:text-gray-400 text-lg"
                                onClick={handleSearch}
                            />
                        }
                    />
                </div>
                <Dropdown
                    title={
                        <span className="flex items-center gap-2">
                            <HiOutlineFilter className="text-lg" />
                            Filter
                        </span>
                    }
                    placement="bottom-start"
                    menuClass="min-w-[180px] py-1"
                    toggleClassName="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-0 rounded-lg px-4 py-2 font-medium"
                >
                    <Dropdown.Item
                        eventKey="ALL"
                        onClick={() => {
                            setStatusFilter('ALL')
                            setPagingData((prev) => ({ ...prev, pageIndex: 1 }))
                        }}
                        className={
                            statusFilter === 'ALL'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                                : ''
                        }
                    >
                        All
                    </Dropdown.Item>
                    <Dropdown.Item
                        eventKey="ACTIVE"
                        onClick={() => {
                            setStatusFilter('ACTIVE')
                            setPagingData((prev) => ({ ...prev, pageIndex: 1 }))
                        }}
                        className={
                            statusFilter === 'ACTIVE'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                                : ''
                        }
                    >
                        Active
                    </Dropdown.Item>
                    <Dropdown.Item
                        eventKey="INACTIVE"
                        onClick={() => {
                            setStatusFilter('INACTIVE')
                            setPagingData((prev) => ({ ...prev, pageIndex: 1 }))
                        }}
                        className={
                            statusFilter === 'INACTIVE'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                                : ''
                        }
                    >
                        Inactive
                    </Dropdown.Item>
                    <Dropdown.Item
                        eventKey="SUSPENDED"
                        onClick={() => {
                            setStatusFilter('SUSPENDED')
                            setPagingData((prev) => ({ ...prev, pageIndex: 1 }))
                        }}
                        className={
                            statusFilter === 'SUSPENDED'
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                                : ''
                        }
                    >
                        Suspended
                    </Dropdown.Item>
                </Dropdown>
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                pagingData={pagingData}
                onPaginationChange={(page) => {
                    setPagingData((prev) => ({ ...prev, pageIndex: page }))
                }}
                onSelectChange={(pageSize) => {
                    setPagingData((prev) => ({
                        ...prev,
                        pageSize,
                        pageIndex: 1,
                    }))
                }}
            />

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="Delete User"
                onClose={() => {
                    setDeleteDialogOpen(false)
                    setUserToDelete(null)
                }}
                onConfirm={handleDeleteConfirm}
                confirmText="Delete"
                cancelText="Cancel"
            >
                <p>
                    Are you sure you want to delete this user? This action
                    cannot be undone.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default Users
