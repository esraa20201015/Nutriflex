import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActionTracked } from '../../shared/ActionTrack/action-tracked.entity';
import { TraineeProgressPeriodType } from '../enums/trainee-progress-period-type.enum';

/**
 * Trainee progress – high-level weekly/monthly summaries.
 */
@Entity({ name: 'trainee_progress', comment: 'High-level weekly/monthly progress summaries for trainees' })
export class TraineeProgress extends ActionTracked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key to users table (trainee) */
  @Column({ name: 'trainee_id', type: 'uuid', comment: 'Foreign key to users table (trainee)' })
  trainee_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainee_id' })
  trainee: User;

  /** Period type: weekly or monthly */
  @Column('varchar', {
    name: 'period_type',
    length: 20,
    nullable: false,
    comment: 'Period type: weekly or monthly',
  })
  period_type: TraineeProgressPeriodType;

  /** Start of the period */
  @Column('date', {
    name: 'period_start',
    nullable: false,
    comment: 'Start date of the period',
  })
  period_start: string;

  /** End of the period */
  @Column('date', {
    name: 'period_end',
    nullable: false,
    comment: 'End date of the period',
  })
  period_end: string;

  /** Summary of the progress (weight change, adherence, etc.) */
  @Column('text', {
    name: 'summary',
    nullable: false,
    comment: 'High-level summary of trainee progress',
  })
  summary: string;

  /** Optional coach notes */
  @Column('text', {
    name: 'coach_notes',
    nullable: true,
    comment: 'Optional notes from coach',
  })
  coach_notes: string | null;
}

