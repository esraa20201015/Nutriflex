import CustomIndicator from '@/components/shared/CustomIndicator'
import { useTraineeDashboard } from './hooks/useTraineeDashboard'
import OverviewCard from './components/OverviewCard'
import ProgressChart from './components/ProgressChart'
import TodayFocus from './components/TodayFocus'
import StatusCard from './components/StatusCard'

export default function TraineeDashboardPage() {
  const { dashboard, overview, progress, today, status, loading } =
    useTraineeDashboard()

  if (loading) return <CustomIndicator />

  return (
    <div className="trainee-dashboard space-y-8 p-4 md:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Your progress, today&apos;s focus, and status at a glance
        </p>
      </div>

      {/* Overview stats – from overview API */}
      {overview && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Overview
          </h2>
          <OverviewCard data={overview} />
        </section>
      )}

      {/* Today's focus – from today API */}
      {today && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Today&apos;s Focus
          </h2>
          <TodayFocus data={today} />
        </section>
      )}

      {/* Progress (weight & measurements) – from progress API */}
      {progress && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Progress
          </h2>
          <ProgressChart data={progress} />
        </section>
      )}

      {/* Status (streak, check-in, coach) – from status API */}
      {status && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Status
          </h2>
          <StatusCard data={status} />
        </section>
      )}
    </div>
  )
}
