import type { TraineeTodayData } from '@/@types/api';
import {
  PiForkKnifeDuotone,
  PiCheckCircleDuotone,
  PiBarbellDuotone,
} from 'react-icons/pi';

interface Props {
  data: TraineeTodayData;
}

export default function TodayFocus({ data }: Props) {
  return (
    <div className="card p-5 shadow-md rounded-lg bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-4 text-light-primary dark:text-dark-primary flex items-center">
        <PiBarbellDuotone className="w-6 h-6 mr-2 text-light-primary dark:text-dark-primary" />
        Today's Focus
      </h2>

      <ul className="space-y-3 text-gray-700 dark:text-gray-300">
        {/* Workout */}
        <li className="flex items-center gap-2">
          <PiBarbellDuotone className="w-5 h-5 text-ecmePink dark:text-ecmePink" />
          <span>
            Workout: <strong>{data.todayWorkout ?? '—'}</strong>
          </span>
        </li>

        {/* Meals Completed */}
        <li className="flex items-center gap-2">
          <PiForkKnifeDuotone className="w-5 h-5 text-ecmePink dark:text-ecmePink" />
          <span>
            Meals Completed: <strong>{data.completedMeals}</strong> /{' '}
            <strong>{data.todayMeals}</strong>
          </span>
        </li>

        {/* Workout Completed */}
        <li className="flex items-center gap-2">
          <PiCheckCircleDuotone
            className={`w-5 h-5 ${
              data.completedWorkout ? 'text-green-500' : 'text-red-500'
            }`}
          />
          <span>
            Workout Completed:{' '}
            <strong>{data.completedWorkout ? 'Yes' : 'No'}</strong>
          </span>
        </li>
      </ul>
    </div>
  );
}
