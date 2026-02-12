/**
 * Exercise type assigned within a training or nutrition plan.
 *
 * Note: `CALISTHENICS` was added for the coach plan flow.
 * `FLEXIBILITY` is kept for backwards compatibility with existing data.
 */
export enum ExerciseType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  CALISTHENICS = 'calisthenics',
  FLEXIBILITY = 'flexibility',
}

