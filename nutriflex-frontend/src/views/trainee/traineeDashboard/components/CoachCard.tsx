import type { PublicCoachProfile } from '@/@types/api';
import { HiUser, HiStar, HiBadgeCheck } from 'react-icons/hi';

interface Props {
  coach: PublicCoachProfile;
  onSelect: (coachId: string) => void;
}

export default function CoachCard({ coach, onSelect }: Props) {
  return (
    <div className="card p-4 shadow-md rounded-lg flex flex-col items-center 
                    bg-light-gray-100 dark:bg-dark-gray-800 transition-colors duration-300">
      {/* Profile Image */}
      <img
        src={coach.profileImageUrl ?? '/placeholder.png'}
        alt={coach.fullName}
        className="w-24 h-24 rounded-full mb-3 border-2 border-light-primary dark:border-dark-primary"
      />

      {/* Name */}
      <h3 className="font-semibold text-lg text-light-primary dark:text-dark-primary mb-1 flex items-center">
        <HiUser className="w-5 h-5 mr-1 text-light-primary dark:text-dark-primary" />
        {coach.fullName}
      </h3>

      {/* Specialization */}
      <p className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
        <HiBadgeCheck className="w-4 h-4 mr-1 text-ecmePink dark:text-ecmePink" />
        {coach.specialization ?? 'No specialization'}
      </p>

      {/* Experience */}
      {coach.yearsOfExperience && (
        <p className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
          <HiStar className="w-4 h-4 mr-1 text-yellow-500" />
          {coach.yearsOfExperience} yrs experience
        </p>
      )}

      {/* Select Button */}
      <button
        onClick={() => onSelect(coach.id)}
        className="mt-2 px-4 py-1 rounded-lg font-medium
                   bg-light-primary text-white dark:bg-dark-primary hover:opacity-90 transition"
      >
        Select
      </button>
    </div>
  );
}
