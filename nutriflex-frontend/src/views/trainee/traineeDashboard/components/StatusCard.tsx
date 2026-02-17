import type { TraineeStatusData } from '@/@types/api';
import {
  PiCalendarCheckDuotone,
  PiFireDuotone,
  PiUserCircleDuotone,
} from 'react-icons/pi';

interface Props {
  data: TraineeStatusData;
}

export default function StatusCard({ data }: Props) {
  return (
    <div className="card p-5 shadow-md rounded-lg bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-4 text-light-primary dark:text-dark-primary flex items-center">
        <PiUserCircleDuotone className="w-6 h-6 mr-2 text-light-primary dark:text-dark-primary" />
        Status
      </h2>

      <ul className="space-y-3 text-gray-700 dark:text-gray-300">
        {/* Streak Days */}
        <li className="flex items-center gap-2">
          <PiFireDuotone className="w-5 h-5 text-ecmePink dark:text-ecmePink" />
          <span>
            Streak Days: <strong>{data.streakDays ?? 0}</strong>
          </span>
        </li>

        {/* Last Check-in */}
        <li className="flex items-center gap-2">
          <PiCalendarCheckDuotone className="w-5 h-5 text-ecmePink dark:text-ecmePink" />
          <span>
            Last Check-in: <strong>{data.lastCheckIn ?? '—'}</strong>
          </span>
        </li>

        {/* Coach */}
        <li className="flex items-center gap-2">
          <PiUserCircleDuotone className="w-5 h-5 text-ecmePink dark:text-ecmePink" />
          <span>
            Coach: <strong>{data.coachName ?? '—'}</strong>
          </span>
        </li>
      </ul>
    </div>
  );
}
