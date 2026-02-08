import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { CoachTraineeStatus } from '../enums/coach-trainee-status.enum';

/**
 * Coach-Trainee relationship – defines which trainees belong to which coach.
 * One Coach → Many Trainees
 * One Trainee → One Coach (at a time)
 * This table is critical for authorization.
 */
@Entity({ name: 'coach_trainee', comment: 'This table stores coach-trainee relationship records' })
export class CoachTrainee extends ActionTracked {
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

  /** Start date of the coach-trainee relationship */
  @Column('timestamptz', {
    name: 'start_date',
    nullable: false,
    comment: 'Start date of the coach-trainee relationship',
  })
  start_date: Date;

  /** End date of the coach-trainee relationship (nullable for active relationships) */
  @Column('timestamptz', {
    name: 'end_date',
    nullable: true,
    comment: 'End date of the coach-trainee relationship',
  })
  end_date: Date | null;

  /** Relationship status: active, paused, or completed */
  @Column('varchar', {
    name: 'status',
    length: 20,
    default: CoachTraineeStatus.ACTIVE,
    comment: 'Relationship status: active, paused, or completed',
  })
  status: CoachTraineeStatus;
}
