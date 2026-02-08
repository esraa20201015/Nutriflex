import { useState, useEffect, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Segment from '@/components/ui/Segment'
import {
    apiGetUsers,
    apiSearchUsers,
    apiDeleteUser,
    apiToggleUserStatus,
} from '@/services/UserService'
import type { UserWithProfile } from '@/@types/user'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

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

            if (response?.data) {
                setUsers(response.data.users)
                if (!searchKeyword.trim()) {
                    setPagingData((prev) => ({
                        ...prev,
                        total: response.data.total,
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
        }
    }

    const columns = useMemo<ColumnDef<UserWithProfile>[]>(
        () => [
            {
                header: 'Name',
                accessorKey: 'fullName',
                cell: ({ row }) => {
                    const user = row.original
                    return (
                        <div>
                            <div className="font-semibold">{user.fullName}</div>
                            <div className="text-sm text-gray-500">
                                {user.email}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Role',
                accessorKey: 'role',
                cell: ({ row }) => {
                    const role = row.original.role
                    const roleColors = {
                        ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                        COACH: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                        TRAINEE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    }
                    return (
                        <Badge
                            className={roleColors[role] || 'bg-gray-100 text-gray-800'}
                        >
                            {role}
                        </Badge>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => {
                    const status = row.original.status
                    const statusColors = {
                        ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                        INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                        SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                    }
                    return (
                        <Badge
                            className={statusColors[status] || 'bg-gray-100 text-gray-800'}
                        >
                            {status}
                        </Badge>
                    )
                },
            },
            {
                header: 'Email Verified',
                accessorKey: 'isEmailVerified',
                cell: ({ row }) => {
                    return row.original.isEmailVerified ? (
                        <Badge className="bg-green-100 text-green-800">
                            Verified
                        </Badge>
                    ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                            Not Verified
                        </Badge>
                    )
                },
            },
            {
                header: 'Actions',
                accessorKey: 'actions',
                cell: ({ row }) => {
                    const user = row.original
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlinePencil />}
                                onClick={() => {
                                    // TODO: Navigate to edit page
                                    toast.push(
                                        <Notification type="info" title="Info">
                                            Edit functionality coming soon
                                        </Notification>,
                                    )
                                }}
                            />
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiOutlineTrash />}
                                onClick={() => handleDeleteClick(user.id)}
                                className="text-red-600 hover:text-red-700"
                            />
                            {(user.status === 'ACTIVE' ||
                                user.status === 'INACTIVE') && (
                                <Button
                                    size="sm"
                                    variant="plain"
                                    onClick={() =>
                                        handleToggleStatus(
                                            user.id,
                                            user.status,
                                        )
                                    }
                                >
                                    {user.status === 'ACTIVE'
                                        ? 'Deactivate'
                                        : 'Activate'}
                                </Button>
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

            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch()
                            }
                        }}
                        suffix={
                            <HiOutlineSearch
                                className="cursor-pointer"
                                onClick={handleSearch}
                            />
                        }
                    />
                </div>
                <Segment
                    value={statusFilter}
                    onChange={(value) =>
                        setStatusFilter(
                            (value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ALL') ||
                                'ALL',
                        )
                    }
                    size="sm"
                >
                    <Segment.Item value="ALL">All</Segment.Item>
                    <Segment.Item value="ACTIVE">Active</Segment.Item>
                    <Segment.Item value="INACTIVE">Inactive</Segment.Item>
                    <Segment.Item value="SUSPENDED">Suspended</Segment.Item>
                </Segment>
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
