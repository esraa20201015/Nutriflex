import { useEffect, useState, useMemo } from 'react'
import {
    apiGetAdminDashboard,
    apiGetAdminAccountsStatus,
    apiGetAdminActivity,
    apiGetAdminAlerts,
} from '@/services/AdminService'
import Chart from '@/components/shared/Chart'
import Segment from '@/components/ui/Segment'
import Badge from '@/components/ui/Badge'
import Calendar from '@/components/ui/Calendar'
import {
    PiUsersThreeDuotone,
    PiClipboardTextDuotone,
    PiUserCircleDuotone,
    PiUserDuotone,
    PiChartBarDuotone,
    PiShieldWarningDuotone,
} from 'react-icons/pi'
import type {
    AdminDashboardData,
    AdminAccountsStatusData,
    AdminActivityData,
    AdminAlertsData,
} from '@/@types/api'

const AdminDashboard = () => {
    const [data, setData] = useState<AdminDashboardData | null>(null)
    const [accountsStatus, setAccountsStatus] =
        useState<AdminAccountsStatusData | null>(null)
    const [activity, setActivity] = useState<AdminActivityData | null>(null)
    const [alerts, setAlerts] = useState<AdminAlertsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [roleFilter, setRoleFilter] = useState<string>('ALL')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [newUsersDate, setNewUsersDate] = useState<Date | null>(null)
    const [activityPeriod, setActivityPeriod] = useState<'weekly' | 'monthly'>('weekly')

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true)
                setError(null)
                const [summaryRes, accountsRes, activityRes, alertsRes] =
                    await Promise.all([
                        apiGetAdminDashboard(),
                        apiGetAdminAccountsStatus(),
                        apiGetAdminActivity(),
                        apiGetAdminAlerts(),
                    ])

                setData(summaryRes.data)
                setAccountsStatus(accountsRes.data)
                setActivity(activityRes.data)
                setAlerts(alertsRes.data)
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load dashboard',
                )
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [])

    // Filter recent users
    const filteredRecentUsers = useMemo(() => {
        if (!data?.recentUsers) return []
        let filtered = [...data.recentUsers]

        if (roleFilter !== 'ALL') {
            filtered = filtered.filter((user) => user.role === roleFilter)
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((user) => user.status === statusFilter)
        }

        return filtered.slice(0, 10) // Show top 10
    }, [data?.recentUsers, roleFilter, statusFilter])

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!data?.usersGrowth || data.usersGrowth.length === 0) {
            return {
                series: [{ name: 'Users', data: [] }],
                categories: [],
            }
        }

        const sorted = [...data.usersGrowth].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        return {
            series: [
                {
                    name: 'Users',
                    data: sorted.map((item) => item.count),
                },
            ],
            categories: sorted.map((item) => {
                const date = new Date(item.date)
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                })
            }),
        }
    }, [data?.usersGrowth])


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading dashboard...</div>
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    System overview and statistics
                </p>
            </div>

            {/* KPI summary (ECME-style, larger cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative overflow-hidden rounded-2xl bg-pink-50 dark:bg-pink-900/20 px-6 py-5 flex items-center gap-5 min-h-[140px]">
                    <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/40">
                        <PiUsersThreeDuotone className="w-7 h-7 text-pink-600 dark:text-pink-300" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-pink-600 dark:text-pink-300 uppercase tracking-wide">
                            Total Users
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                            {data?.usersCount || 0}
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-6 py-5 flex items-center gap-5 min-h-[140px]">
                    <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                        <PiClipboardTextDuotone className="w-7 h-7 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wide">
                            Total Plans
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                            {data?.plansCount || 0}
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 px-6 py-5 flex items-center gap-5 min-h-[140px]">
                    <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                        <PiUserCircleDuotone className="w-7 h-7 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase tracking-wide">
                            Coaches
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                            {data?.coachesCount || 0}
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-violet-50 dark:bg-violet-900/20 px-6 py-5 flex items-center gap-5 min-h-[140px]">
                    <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                        <PiUserDuotone className="w-7 h-7 text-violet-600 dark:text-violet-300" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-300 uppercase tracking-wide">
                            Trainees
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                            {data?.traineesCount || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* User status & new users summary (new users styled like right-top card) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <PiShieldWarningDuotone className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            Account Status
                        </h3>
                    </div>
                    <div className="h-64">
                        <Chart
                            type="polarArea"
                            series={[
                                data?.activeUsers ?? 0,
                                data?.inactiveUsers ?? 0,
                                data?.blockedUsers ?? 0,
                                data?.pendingUsers ?? 0,
                            ]}
                            height={250}
                            customOptions={{
                                labels: ['Active', 'Inactive', 'Blocked', 'Pending'],
                                stroke: {
                                    colors: ['#fff'],
                                },
                                fill: {
                                    opacity: 0.8,
                                },
                                legend: {
                                    position: 'bottom',
                                },
                                responsive: [
                                    {
                                        breakpoint: 768,
                                        options: {
                                            chart: {
                                                width: '100%',
                                            },
                                            legend: {
                                                position: 'bottom',
                                            },
                                        },
                                    },
                                ],
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col justify-between">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                            <PiChartBarDuotone className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                New Users
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Onboarded to the platform
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    This month
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Total new users this month
                                </p>
                            </div>
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
                                {data?.newUsersThisMonth ?? 0}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    Today
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Joined in the last 24 hours
                                </p>
                            </div>
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
                                {data?.newUsersToday ?? 0}
                            </p>
                        </div>
                    </div>
                        {/* Small calendar, styled like ECME schedule/right cards */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="md:w-[260px] max-w-[260px] mx-auto">
                                <Calendar
                                    value={newUsersDate}
                                    dayClassName={(date, { selected }) => {
                                        if (date.getDate() === 12 && !selected) {
                                            return 'text-red-600'
                                        }

                                        if (selected) {
                                            return 'text-white'
                                        }

                                        return 'text-gray-700 dark:text-gray-200'
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    dayStyle={(date, { selected, outOfMonth }: any) => {
                                        if (date.getDate() === 18 && !selected) {
                                            return { color: '#15c39a' }
                                        }

                                        if (outOfMonth) {
                                            return {
                                                opacity: 0,
                                                pointerEvents: 'none',
                                                cursor: 'default',
                                            }
                                        }

                                        return {}
                                    }}
                                    renderDay={(date) => {
                                        const day = date.getDate()

                                        if (day !== 12) {
                                            return <span>{day}</span>
                                        }

                                        return (
                                            <span className="relative flex justify-center items-center w-full h-full">
                                                {day}
                                                <Badge
                                                    className="absolute bottom-1"
                                                    innerClass="h-1 w-1"
                                                />
                                            </span>
                                        )
                                    }}
                                    onChange={setNewUsersDate}
                                />
                            </div>
                        </div>
                </div>
            </div>

            {/* Users Growth / Ads performance-style chart */}
            {data?.usersGrowth && data.usersGrowth.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Users Growth</h3>
                        <div className="flex gap-2 text-xs">
                            <button className="rounded-full px-3 py-1 bg-gray-900 text-white text-xs">
                                All
                            </button>
                            <button className="rounded-full px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs">
                                Month
                            </button>
                            <button className="rounded-full px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs">
                                Week
                            </button>
                        </div>
                    </div>
                    <Chart
                        type="bar"
                        series={chartData.series}
                        xAxis={chartData.categories}
                        height={300}
                        customOptions={{
                            plotOptions: {
                                bar: {
                                    columnWidth: '45%',
                                    borderRadius: 6,
                                },
                            },
                            colors: ['#34d399'],
                        }}
                    />
                </div>
            )}

            {/* Accounts status card removed as requested */}

            {/* Platform Activity Metrics & System Health Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Platform Activity Metrics */}
                {activity && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Platform Activity Metrics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Active Plans
                                </p>
                                <p className="text-2xl font-bold">
                                    {activity.activePlans}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Inactive Plans
                                </p>
                                <p className="text-2xl font-bold">
                                    {activity.inactivePlans}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-700 dark:text-gray-200 font-medium">
                                    {activityPeriod === 'weekly'
                                        ? 'Trainees with no activity in last 7 days'
                                        : 'Trainees with no activity in last 30 days'}
                                </p>
                                <Segment
                                    value={activityPeriod}
                                    onChange={(value) =>
                                        setActivityPeriod(
                                            (value as 'weekly' | 'monthly') || 'weekly',
                                        )
                                    }
                                    size="sm"
                                >
                                    <Segment.Item value="weekly">Weekly</Segment.Item>
                                    <Segment.Item value="monthly">Monthly</Segment.Item>
                                </Segment>
                            </div>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                {activityPeriod === 'weekly'
                                    ? activity.traineesWithNoActivity7Days
                                    : activity.traineesWithNoActivity30Days}
                            </p>
                        </div>
                    </div>
                )}

                {/* System Health Alerts */}
                {alerts && alerts.alerts.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold">System Health Alerts</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                High-level issues that may require attention
                            </p>
                        </div>
                        <div className="p-6 space-y-3">
                            {alerts.alerts.map((alert) => {
                                // Map alert types to more descriptive labels
                                const getAlertLabel = (type: string) => {
                                    switch (type) {
                                        case 'LOW_ACTIVITY':
                                            return 'Low Activity Trainees'
                                        case 'INACTIVE_COACH':
                                            return 'Inactive Coaches'
                                        default:
                                            return type.replace(/_/g, ' ')
                                    }
                                }

                                const getAlertDescription = (type: string, count: number) => {
                                    switch (type) {
                                        case 'LOW_ACTIVITY':
                                            return `${count} trainee${count !== 1 ? 's' : ''} with no activity in the last 7 days`
                                        case 'INACTIVE_COACH':
                                            return `${count} coach${count !== 1 ? 'es' : ''} with no active trainees or plans`
                                        default:
                                            return `Count: ${count}`
                                    }
                                }

                                return (
                                    <div
                                        key={alert.type}
                                        className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {getAlertLabel(alert.type)}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {getAlertDescription(alert.type, alert.count)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Users Table with Filters */}
            {data?.recentUsers && data.recentUsers.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold">Recent Users</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Filter by Role
                                    </label>
                                    <Segment
                                        value={roleFilter}
                                        onChange={(value) =>
                                            setRoleFilter((value as string) || 'ALL')
                                        }
                                        size="sm"
                                    >
                                        <Segment.Item value="ALL">All</Segment.Item>
                                        <Segment.Item value="ADMIN">Admin</Segment.Item>
                                        <Segment.Item value="COACH">Coach</Segment.Item>
                                        <Segment.Item value="TRAINEE">Trainee</Segment.Item>
                                    </Segment>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Filter by Status
                                    </label>
                                    <Segment
                                        value={statusFilter}
                                        onChange={(value) =>
                                            setStatusFilter((value as string) || 'ALL')
                                        }
                                        size="sm"
                                    >
                                        <Segment.Item value="ALL">All</Segment.Item>
                                        <Segment.Item value="ACTIVE">Active</Segment.Item>
                                        <Segment.Item value="INACTIVE">
                                            Inactive
                                        </Segment.Item>
                                        <Segment.Item value="SUSPENDED">
                                            Suspended
                                        </Segment.Item>
                                    </Segment>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredRecentUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecentUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {user.fullName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    className={
                                                        user.role === 'ADMIN'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                            : user.role === 'COACH'
                                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    }
                                                >
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    className={
                                                        user.status === 'ACTIVE'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : user.status === 'INACTIVE'
                                                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }
                                                >
                                                    {user.status || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {user.createdAt
                                                    ? new Date(
                                                          user.createdAt,
                                                      ).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard
