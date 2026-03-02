import { useNavigate } from 'react-router'
import ActionLink from '@/components/shared/ActionLink'
import { FaRunning, FaDumbbell } from 'react-icons/fa'
import classNames from '@/utils/classNames'
import type { CommonProps } from '@/@types/common'

interface RoleSelectionProps extends CommonProps {
    signInUrl?: string
}

type Role = 'COACH' | 'TRAINEE'

const RoleSelection = ({ className, signInUrl = '/sign-in' }: RoleSelectionProps) => {
    const navigate = useNavigate()

    const handleRoleSelect = (role: Role) => {
        navigate(`/sign-up?role=${role}`)
    }

    const roles = [
        {
            value: 'TRAINEE' as Role,
            label: 'Trainee',
            icon: FaRunning,
            description: 'Join as a trainee to achieve your fitness goals',
        },
        {
            value: 'COACH' as Role,
            label: 'Coach',
            icon: FaDumbbell,
            description: 'Register as a coach to help others reach their goals',
        },
    ]

    return (
        <div className={classNames('w-full', className)}>
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Join us today</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Select your registration type
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {roles.map((role) => {
                    const Icon = role.icon

                    return (
                        <button
                            key={role.value}
                            type="button"
                            onClick={() => handleRoleSelect(role.value)}
                            className={classNames(
                                'group p-6 rounded-lg border-2 transition-all duration-200',
                                'hover:shadow-lg hover:scale-[1.02]',
                                'text-left cursor-pointer',
                                'border-gray-200 dark:border-gray-700',
                                'hover:border-info focus:border-info focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2',
                            )}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className={classNames(
                                        'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                                        'transition-colors duration-200',
                                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                                        'group-hover:bg-info group-hover:text-white',
                                    )}
                                >
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {role.label}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {role.description}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="text-center">
                <span className="text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                </span>
                <ActionLink
                    to={signInUrl}
                    className="font-semibold heading-text"
                    themeColor={false}
                >
                    Sign In
                </ActionLink>
            </div>
        </div>
    )
}

export default RoleSelection
