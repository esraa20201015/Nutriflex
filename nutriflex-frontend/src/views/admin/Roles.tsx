import { useEffect, useState } from 'react'
import { apiGetRoles } from '@/services/AdminService'
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import Tooltip from '@/components/ui/Tooltip'
import type { Role } from '@/@types/api'

const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadRoles = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await apiGetRoles()
                // Backend returns ApiResponse<Role[]> in `data`
                setRoles(response.data || [])
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load roles',
                )
            } finally {
                setLoading(false)
            }
        }

        loadRoles()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading roles...</div>
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
                <h2 className="text-2xl font-bold">Roles Management</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage system roles and permissions
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
                                        className="px-6 py-4 text-center text-gray-500"
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {role.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {role.status || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-3">
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
                                            <Tooltip title="Delete">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200 transition-colors"
                                                    aria-label="Delete role"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
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
    )
}

export default Roles
