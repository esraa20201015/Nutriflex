import type { TraineeProgressData } from '@/@types/api';
import Card from '@/components/ui/Card';
import {
  PiTrendUpDuotone,
  PiTrendDownDuotone,
  PiBarbellDuotone,
  PiRulerDuotone,
} from 'react-icons/pi';

interface Props {
  data: TraineeProgressData;
}

export default function ProgressStats({ data }: Props) {
  const { weightHistory, bodyMeasurements } = data;

  const lastWeightEntry = weightHistory?.length
    ? weightHistory[weightHistory.length - 1]
    : null;

  const firstWeightEntry = weightHistory?.length > 1
    ? weightHistory[0]
    : null;

  const weightTrend =
    firstWeightEntry && lastWeightEntry
      ? lastWeightEntry.value - firstWeightEntry.value
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Weight Trend */}
      <Card className="bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <PiBarbellDuotone className="w-5 h-5 text-ecmePink dark:text-ecmePink" />
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Weight Trend
            </h3>
          </div>

          {lastWeightEntry ? (
            <div className="flex items-center gap-2 text-lg font-bold">
              {weightTrend !== null ? (
                <>
                  {weightTrend < 0 ? (
                    <PiTrendDownDuotone className="text-green-500" />
                  ) : (
                    <PiTrendUpDuotone className="text-red-500" />
                  )}
                  <span>{weightTrend.toFixed(1)} kg</span>
                </>
              ) : (
                <span>{lastWeightEntry.value.toFixed(1)} kg</span>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No data</p>
          )}

          {weightHistory.length > 0 && (
            <ul className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
              {weightHistory.map((item) => (
                <li key={item.date}>
                  {item.date}:{' '}
                  <span className="font-bold text-ecmePink dark:text-ecmePink">
                    {item.value} kg
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* Body Measurements */}
      <Card className="bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <PiRulerDuotone className="w-5 h-5 text-ecmePink dark:text-ecmePink" />
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Body Measurements
            </h3>
          </div>

          {bodyMeasurements.length > 0 ? (
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              {bodyMeasurements.map((item) => (
                <li key={item.date}>
                  <span className="font-medium">{item.date}:</span>
                  {item.waist !== null && (
                    <span className="ml-1">Waist: {item.waist} cm</span>
                  )}
                  {item.chest !== null && (
                    <span className="ml-1">Chest: {item.chest} cm</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No measurements</p>
          )}
        </div>
      </Card>
    </div>
  );
}
