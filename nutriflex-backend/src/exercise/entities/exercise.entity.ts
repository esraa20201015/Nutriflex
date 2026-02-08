import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { ExerciseType } from '../enums/exercise-type.enum';

/**
 * Exercise – assigned by a coach to a trainee.
 */
@Entity({ name: 'exercise', comment: 'This table stores exercise records assigned by coaches to trainees' })
export class Exercise extends ActionTracked {
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

  @Column('varchar', { name: 'name', length: 255 })
  name: string;

  @Column('varchar', { name: 'exercise_type', length: 20 })
  exercise_type: ExerciseType;

  @Column('int', { name: 'sets', nullable: true })
  sets: number | null;

  @Column('int', { name: 'reps', nullable: true })
  reps: number | null;

  @Column('int', { name: 'duration_minutes', nullable: true })
  duration_minutes: number | null;

  @Column('text', { name: 'instructions', nullable: true })
  instructions: string | null;
}

