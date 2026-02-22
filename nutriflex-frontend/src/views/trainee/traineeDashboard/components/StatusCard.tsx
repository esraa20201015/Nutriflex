import type { TraineeStatusData } from '@/@types/api'
import Card from '@/components/ui/Card'
import {
  PiCalendarCheckDuotone,
  PiFireDuotone,
  PiUserCircleDuotone,
} from 'react-icons/pi'

interface Props {
  data: TraineeStatusData
}

export default function StatusCard({ data }: Props) {
  return (
    <Card
      className="
        p-5 rounded-xl border
        !bg-neutral
        border-[#0d1229]
        text-[#0d1229]
        dark:border-ecmePink
        dark:text-ecmePink
        dark:!bg-gray-800
        transition-colors
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <PiUserCircleDuotone className="w-6 h-6" />
        <h2 className="text-lg font-semibold">Status</h2>
      </div>

      <ul className="space-y-3">

        {/* Streak */}
        <li className="flex items-center gap-3">
          <PiFireDuotone className="w-5 h-5" />
          <span>
            Streak Days:{' '}
            <strong>{data.streakDays ?? 0}</strong>
          </span>
        </li>

        {/* Check-in */}
        <li className="flex items-center gap-3">
          <PiCalendarCheckDuotone className="w-5 h-5" />
          <span>
            Last Check-in:{' '}
            <strong>{data.lastCheckIn ?? '—'}</strong>
          </span>
        </li>

        {/* Coach */}
        <li className="flex items-center gap-3">
          <PiUserCircleDuotone className="w-5 h-5" />
          <span>
            Coach:{' '}
            <strong>{data.coachName ?? '—'}</strong>
          </span>
        </li>

      </ul>
    </Card>
  )
}
