import type { TraineeStatusData } from '@/@types/api'
import Card from '@/components/ui/Card'
import {
    PiCalendarCheckDuotone,
    PiFireDuotone,
} from 'react-icons/pi'

interface Props {
    data: TraineeStatusData
}

/** Format YYYY-MM-DD to short display date */
function formatDate(iso: string | null): string {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export default function StatusCard({ data }: Props) {
    const items = [
        {
            icon: PiFireDuotone,
            label: 'Streak',
            value: `${data.streakDays ?? 0} days`,
            iconBg: 'bg-warning-subtle dark:bg-warning/20',
            iconColor: 'text-warning',
        },
        {
            icon: PiCalendarCheckDuotone,
            label: 'Last check-in',
            value: formatDate(data.lastCheckIn),
            iconBg: 'bg-primary-subtle dark:bg-primary/15',
            iconColor: 'text-primary',
        },
    ]

    return (
        <Card className="rounded-xl border border-gray-200 dark:border-gray-600/60 bg-white dark:bg-gray-800/80 shadow-sm overflow-hidden">
            <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Motivation &amp; status
                </h2>
                <ul className="space-y-4">
                    {items.map(({ icon: Icon, label, value, iconBg, iconColor }) => (
                        <li
                            key={label}
                            className="flex items-center gap-3"
                        >
                            <span
                                className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${iconBg} ${iconColor}`}
                            >
                                <Icon className="w-5 h-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {label}
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {value}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    )
}
