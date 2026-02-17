import { useEffect, useState } from 'react';
import { apiGetAvailableCoaches, apiSelectCoach } from '@/services/TraineeService';
import type { PublicCoachProfile } from '@/@types/api';
import CoachCard from './CoachCard';

interface Props {
  traineeId: string;
}

export default function CoachSelector({ traineeId }: Props) {
  const [coaches, setCoaches] = useState<PublicCoachProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await apiGetAvailableCoaches({ trainee_id: traineeId });
      setCoaches(res.data);
      setLoading(false);
    })();
  }, [traineeId]);

  const handleSelect = async (coachId: string) => {
    await apiSelectCoach({ coach_id: coachId, trainee_id: traineeId });
    alert('Coach selected!');
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-light-gray-300 dark:border-dark-gray-600 border-t-4 border-t-ecmePink rounded-full animate-spin"></div>
        <span className="sr-only">Loading coaches...</span>
      </div>
    );

  if (coaches.length === 0)
    return (
      <p className="text-center text-gray-600 dark:text-gray-300">
        No coaches available at the moment.
      </p>
    );

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {coaches.map((coach) => (
        <CoachCard key={coach.id} coach={coach} onSelect={handleSelect} />
      ))}
    </div>
  );
}
