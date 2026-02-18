import type { TraineeOverviewData } from '@/@types/api'
import {
  HiScale,
  HiClipboardCheck,
  HiChartBar,
  HiCalendar,
} from 'react-icons/hi'
import Card from '@/components/ui/Card'

interface Props {
  data: TraineeOverviewData
}

export default function OverviewCards({ data }: Props) {
  const base =
    'p-5 rounded-xl border flex items-center gap-4 transition-colors duration-300'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Current Weight */}
      <Card
        className={`${base}
          bg-gray-50 text-gray-900
          border-[#0d1229]
          dark:bg-gray-800 dark:text-gray-100
          dark:border-[#fb64b6]`}
      >
        <HiScale className="w-6 h-6 text-[#0d1229] dark:text-[#fb64b6]" />
        <div>
          <p className="text-sm opacity-70">Current Weight</p>
          <p className="text-lg font-semibold">
            {data.currentWeight ?? '—'} kg
          </p>
        </div>
      </Card>

      {/* Active Plan */}
      <Card
        className={`${base}
          bg-gray-50 text-gray-900
          border-[#0d1229]
          dark:bg-gray-800 dark:text-gray-100
          dark:border-[#fb64b6]`}
      >
        <HiClipboardCheck className="w-6 h-6 text-[#0d1229] dark:text-[#fb64b6]" />
        <div>
          <p className="text-sm opacity-70">Active Plan</p>
          <p className="text-lg font-semibold">
            {data.activePlanName ?? '—'}
          </p>
        </div>
      </Card>

      {/* Plan Completion */}
      <Card
        className={`${base}
          bg-gray-50 text-gray-900
          border-[#0d1229]
          dark:bg-gray-800 dark:text-gray-100
          dark:border-[#fb64b6]`}
      >
        <HiChartBar className="w-6 h-6 text-[#0d1229] dark:text-[#fb64b6]" />
        <div>
          <p className="text-sm opacity-70">Plan Completion</p>
          <p className="text-lg font-semibold">
            {data.planCompletion ?? 0}%
          </p>
        </div>
      </Card>

      {/* Days Active */}
      <Card
        className={`${base}
          bg-gray-50 text-gray-900
          border-[#0d1229]
          dark:bg-gray-800 dark:text-gray-100
          dark:border-[#fb64b6]`}
      >
        <HiCalendar className="w-6 h-6 text-[#0d1229] dark:text-[#fb64b6]" />
        <div>
          <p className="text-sm opacity-70">Days Active This Week</p>
          <p className="text-lg font-semibold">
            {data.daysActiveThisWeek ?? 0}
          </p>
        </div>
      </Card>

    </div>
  )
}
