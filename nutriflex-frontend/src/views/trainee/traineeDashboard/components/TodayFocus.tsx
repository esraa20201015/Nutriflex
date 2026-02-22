import type { TraineeTodayData } from '@/@types/api'
import Card from '@/components/ui/Card'
import {
  PiForkKnifeDuotone,
  PiCheckCircleDuotone,
  PiBarbellDuotone,
} from 'react-icons/pi'

interface Props {
  data: TraineeTodayData
}

export default function TodayFocus({ data }: Props) {
  const baseCard = `
    p-5 rounded-xl border
    !bg-gray-50
    border-[#0d1229]
    text-[#0d1229]
    dark:!bg-gray-800
    dark:border-ecmePink
    dark:text-ecmePink
    transition-colors
  `

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

      {/* Workout */}
      <Card className={baseCard}>
        <div className="flex items-center gap-3 mb-2">
          <PiBarbellDuotone className="w-6 h-6" />
          <h3 className="font-semibold text-lg">Workout</h3>
        </div>
        <p className="opacity-80">
          {data.todayWorkout ?? '—'}
        </p>
      </Card>

      {/* Meals Completed */}
      <Card className={baseCard}>
        <div className="flex items-center gap-3 mb-2">
          <PiForkKnifeDuotone className="w-6 h-6" />
          <h3 className="font-semibold text-lg">Meals</h3>
        </div>
        <p className="opacity-80">
          <strong>{data.completedMeals}</strong> / {data.todayMeals} completed
        </p>
      </Card>

      {/* Workout Completed */}
      <Card className={baseCard}>
        <div className="flex items-center gap-3 mb-2">
          <PiCheckCircleDuotone className="w-6 h-6" />
          <h3 className="font-semibold text-lg">Workout Status</h3>
        </div>
        <p className="opacity-80">
          {data.completedWorkout ? 'Completed ✅' : 'Not completed ❌'}
        </p>
      </Card>

    </div>
  )
}
