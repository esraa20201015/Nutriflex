import type { TraineeOverviewData } from '@/@types/api'
import {
    HiScale,
    HiUserCircle,
    HiClipboardCheck,
    HiChartBar,
} from 'react-icons/hi'
import Card from '@/components/ui/Card'

interface Props {
    data: TraineeOverviewData
    /** Coach name for the top card (from status API). */
    coachName?: string | null
}

/** Format weight change with sign (loss = success, gain = warning). */
function WeightChangeBadge({ value }: { value: number | null }) {
    if (value === null) return <span className="text-gray-500 dark:text-gray-400">—</span>
    const isLoss = value < 0
    const sign = value > 0 ? '+' : ''
    return (
        <span
            className={
                isLoss
                    ? 'text-success font-semibold'
                    : 'text-warning font-semibold'
            }
        >
            {sign}{value.toFixed(1)} kg
        </span>
    )
}

export default function OverviewCard({ data, coachName }: Props) {
    const cards: Array<{
        icon: typeof HiClipboardCheck
        label: string
        value: string
        iconBg: string
        iconColor: string
        weightBadges?: boolean
    }> = []

    if (coachName != null && coachName !== '') {
        cards.push({
            icon: HiUserCircle,
            label: 'Coach',
            value: coachName,
            iconBg: 'bg-info-subtle dark:bg-info/15',
            iconColor: 'text-info dark:text-info',
        })
    }

    cards.push(
        {
            icon: HiScale,
            label: 'Current Weight',
            value: data.currentWeight != null ? `${data.currentWeight} kg` : '—',
            iconBg: 'bg-primary-subtle dark:bg-primary/15',
            iconColor: 'text-primary',
            weightBadges: true,
        },
        {
            icon: HiClipboardCheck,
            label: 'Active Plan',
            value: data.activePlanName ?? '—',
            iconBg: 'bg-info-subtle dark:bg-info/15',
            iconColor: 'text-info dark:text-info',
        },
        {
            icon: HiChartBar,
            label: 'Plan Completion',
            value: `${data.planCompletion ?? 0}%`,
            iconBg: 'bg-success-subtle dark:bg-success/15',
            iconColor: 'text-success',
        },
    )

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(({ icon: Icon, label, value, iconBg, iconColor, weightBadges }) => (
                <Card
                    key={label}
                    className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600/60 bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                    <div className="p-5 flex items-center gap-4">
                        <span
                            className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBg} ${iconColor}`}
                        >
                            <Icon className="w-6 h-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {label}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {value}
                            </p>
                            {weightBadges &&
                                (data.weightChange7Days != null ||
                                    data.weightChange30Days != null) && (
                                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                        7d{' '}
                                        <WeightChangeBadge
                                            value={data.weightChange7Days}
                                        />{' '}
                                        · 30d{' '}
                                        <WeightChangeBadge
                                            value={data.weightChange30Days}
                                        />
                                    </p>
                                )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}
