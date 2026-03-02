import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { NutritionPlanStatus } from '../enums/nutrition-plan-status.enum';
import type { Meal } from '../../meal/entities/meal.entity';
import type { PlanExercise } from './plan-exercise.entity';

/**
 * Nutrition plan – coach creates structured nutrition plans for trainees.
 */
@Entity({ name: 'nutrition_plan', comment: 'This table stores nutrition plan records' })
export class NutritionPlan extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key to users table (coach) */
  @Column({ name: 'coach_id', type: 'uuid', comment: 'Foreign key to users table (coach)' })
  coach_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: User;

  /** Foreign key to users table (trainee) */
  @Column({ name: 'trainee_id', type: 'uuid', comment: 'Foreign key to users table (trainee)' })
  trainee_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainee_id' })
  trainee: User;

  /** Plan title */
  @Column('varchar', {
    name: 'title',
    length: 255,
    nullable: false,
    comment: 'Plan title',
  })
  title: string;

  /** Plan description */
  @Column('text', {
    name: 'description',
    nullable: true,
    comment: 'Plan description',
  })
  description: string | null;

  /** Target daily calories */
  @Column('int', {
    name: 'daily_calories',
    nullable: true,
    comment: 'Target daily calories',
  })
  daily_calories: number | null;

  /** Plan start date */
  @Column('timestamptz', {
    name: 'start_date',
    nullable: false,
    comment: 'Plan start date',
  })
  start_date: Date;

  /** Plan end date */
  @Column('timestamptz', {
    name: 'end_date',
    nullable: true,
    comment: 'Plan end date',
  })
  end_date: Date | null;

  /** Plan status: draft, active, or archived */
  @Column('varchar', {
    name: 'status',
    length: 20,
    default: NutritionPlanStatus.DRAFT,
    comment: 'Plan status: draft, active, or archived',
  })
  status: NutritionPlanStatus;

  @OneToMany('Meal', 'nutrition_plan')
  meals: Meal[];

  /** Exercises attached to this plan (cardio, strength, calisthenics, etc.). */
  @OneToMany('PlanExercise', 'nutrition_plan')
  planExercises: PlanExercise[];
}
