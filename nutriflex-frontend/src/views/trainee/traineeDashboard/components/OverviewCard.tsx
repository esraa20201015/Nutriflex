import type { TraineeOverviewData } from '@/@types/api';
import { HiScale, HiClipboardCheck, HiChartBar, HiCalendar } from 'react-icons/hi';
import Card from '@/components/ui/Card';

interface Props {
  data: TraineeOverviewData;
}

export default function OverviewCards({ data }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Weight */}
      <Card className="p-5 shadow-md rounded-lg flex items-center gap-3
        border-2 border-blue-500 dark:border-ecmePink bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300"
      >
        <HiScale className="w-6 h-6 text-blue-500 dark:text-ecmePink" />
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Current Weight</p>
          <p className="font-semibold text-lg text-light-primary dark:text-dark-primary">
            {data.currentWeight ?? '—'} kg
          </p>
        </div>
      </Card>

      {/* Active Plan */}
      <Card className="p-5 shadow-md rounded-lg flex items-center gap-3
        border-2 border-blue-500 dark:border-ecmePink bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300"
      >
        <HiClipboardCheck className="w-6 h-6 text-blue-500 dark:text-ecmePink" />
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Active Plan</p>
          <p className="font-semibold text-lg text-light-primary dark:text-dark-primary">
            {data.activePlanName ?? '—'}
          </p>
        </div>
      </Card>

      {/* Plan Completion */}
      <Card className="p-5 shadow-md rounded-lg flex items-center gap-3
        border-2 border-blue-500 dark:border-ecmePink bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300"
      >
        <HiChartBar className="w-6 h-6 text-blue-500 dark:text-ecmePink" />
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Plan Completion</p>
          <p className="font-semibold text-lg text-light-primary dark:text-dark-primary">
            {data.planCompletion ?? 0}%
          </p>
        </div>
      </Card>

      {/* Days Active This Week */}
      <Card className="p-5 shadow-md rounded-lg flex items-center gap-3
        border-2 border-blue-500 dark:border-ecmePink bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300"
      >
        <HiCalendar className="w-6 h-6 text-blue-500 dark:text-ecmePink" />
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Days Active This Week</p>
          <p className="font-semibold text-lg text-light-primary dark:text-dark-primary">
            {data.daysActiveThisWeek ?? 0}
          </p>
        </div>
      </Card>
    </div>
  );
}
