import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { NutritionPlan } from './nutrition-plan.entity';
import { Exercise } from '../../exercise/entities/exercise.entity';
import { ExerciseType } from '../../exercise/enums/exercise-type.enum';

/**
 * PlanExercise – exercise configured as part of a specific nutrition/training plan.
 *
 * This entity links a plan to either:
 * - an existing master Exercise (exercise_id), or
 * - a custom, plan-only exercise (name, type, configuration).
 */
@Entity({ name: 'plan_exercise', comment: 'Exercises attached to a specific nutrition plan' })
export class PlanExercise extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nutrition_plan_id', type: 'uuid', comment: 'FK to nutrition_plan' })
  nutrition_plan_id: string;

  @ManyToOne(() => NutritionPlan, (plan) => plan.planExercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nutrition_plan_id' })
  nutrition_plan: NutritionPlan;

  @Column({ name: 'exercise_id', type: 'uuid', nullable: true, comment: 'Optional FK to master exercise' })
  exercise_id: string | null;

  @ManyToOne(() => Exercise, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise | null;

  /** Display name for the exercise within this plan (can override master name). */
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  /** Exercise type used in this plan (cardio, strength, calisthenics, etc.) */
  @Column({ name: 'exercise_type', type: 'varchar', length: 20 })
  exercise_type: ExerciseType;

  /** Subcategory for this exercise (e.g. Upper, Core, Lower). */
  @Column({ name: 'sub_category', type: 'varchar', length: 20, nullable: true })
  sub_category: string | null;

  /** Optional day index within the plan (e.g., 1 = Day 1). */
  @Column({ name: 'day_index', type: 'int', default: 1 })
  day_index: number;

  @Column({ name: 'sets', type: 'int', nullable: true })
  sets: number | null;

  @Column({ name: 'reps', type: 'int', nullable: true })
  reps: number | null;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  duration_minutes: number | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  /** Optional guide image (Base64) for trainee reference. */
  @Column({ name: 'guide_image_base64', type: 'text', nullable: true })
  guide_image_base64: string | null;

  /** Optional guide video (Base64) for trainee reference. */
  @Column({ name: 'guide_video_base64', type: 'text', nullable: true })
  guide_video_base64: string | null;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  order_index: number;
}

