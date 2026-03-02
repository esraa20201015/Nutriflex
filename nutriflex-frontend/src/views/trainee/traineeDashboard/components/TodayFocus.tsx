import type { TraineeTodayData } from '@/@types/api'
import Card from '@/components/ui/Card'
import {
    PiForkKnifeDuotone,
    PiCheckCircleDuotone,
    PiBarbellDuotone,
    PiXCircleDuotone,
} from 'react-icons/pi'

interface Props {
    data: TraineeTodayData
}

export default function TodayFocus({ data }: Props) {
    const items = [
        {
            icon: PiBarbellDuotone,
            title: 'Workout',
            content: data.todayWorkout ?? '—',
            iconBg: 'bg-primary-subtle dark:bg-primary/15',
            iconColor: 'text-primary',
        },
        {
            icon: PiForkKnifeDuotone,
            title: 'Meals',
            content: (
                <span>
                    <strong className="text-primary">{data.completedMeals}</strong>
                    {' / '}
                    {data.todayMeals} completed
                </span>
            ),
            iconBg: 'bg-info-subtle dark:bg-info/15',
            iconColor: 'text-info',
        },
        {
            icon: data.completedWorkout
                ? PiCheckCircleDuotone
                : PiXCircleDuotone,
            title: 'Workout Status',
            content: data.completedWorkout ? (
                <span className="text-success font-medium">Completed</span>
            ) : (
                <span className="text-gray-500 dark:text-gray-400">
                    Not completed
                </span>
            ),
            iconBg: data.completedWorkout
                ? 'bg-success-subtle dark:bg-success/15'
                : 'bg-gray-200 dark:bg-gray-600/40',
            iconColor: data.completedWorkout ? 'text-success' : 'text-gray-500 dark:text-gray-400',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(({ icon: Icon, title, content, iconBg, iconColor }) => (
                <Card
                    key={title}
                    className="rounded-xl border border-gray-200 dark:border-gray-600/60 bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <span
                                className={`flex items-center justify-center w-11 h-11 rounded-lg ${iconBg} ${iconColor}`}
                            >
                                <Icon className="w-6 h-6" />
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {title}
                            </h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {content}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    )
}
