import CustomIndicator from '@/components/shared/CustomIndicator'
import { useTraineeDashboard } from './hooks/useTraineeDashboard'
import OverviewCard from './components/OverviewCard'
import ProgressSection from './components/ProgressSection'
import TodayFocus from './components/TodayFocus'
import StatusCard from './components/StatusCard'
import { useEffect } from 'react'

export default function TraineeDashboardPage() {
  const { dashboard, overview, progress, today, status, loading } =
    useTraineeDashboard()

  useEffect(() => {
    if (window.location.hash === '#progress-section') {
      const el = document.getElementById('progress-section')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [progress])

  if (loading) return <CustomIndicator />

  // Fallback: show weight from progress.weightHistory if overview has none (e.g. before backend returns profile fallback)
  const displayOverview = overview
    ? (() => {
        const hasWeight = overview.currentWeight != null
        const latestFromProgress =
          progress?.weightHistory?.length &&
          [...progress.weightHistory].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0]
        const fallbackWeight = latestFromProgress
          ? latestFromProgress.value
          : null
        return {
          ...overview,
          currentWeight: hasWeight ? overview.currentWeight! : fallbackWeight,
        }
      })()
    : null

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

      {/* Overview – four cards: Coach (first), Current Weight, Active Plan, Plan Completion */}
      {displayOverview && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Overview
          </h2>
          <OverviewCard data={displayOverview} coachName={status?.coachName} />
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

      {/* Progress (weight history + body measurements) – single section, no duplication */}
      {progress && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Progress
          </h2>
          <ProgressSection data={progress} />
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
